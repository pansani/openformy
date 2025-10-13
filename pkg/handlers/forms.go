package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/occult/pagode/config"
	"github.com/occult/pagode/ent"
	"github.com/occult/pagode/ent/form"
	"github.com/occult/pagode/ent/question"
	"github.com/occult/pagode/ent/response"
	"github.com/occult/pagode/pkg/context"
	"github.com/occult/pagode/pkg/middleware"
	"github.com/occult/pagode/pkg/msg"
	"github.com/occult/pagode/pkg/routenames"
	"github.com/occult/pagode/pkg/services"

	inertia "github.com/romsar/gonertia/v2"
)

type Forms struct {
	config  *config.Config
	orm     *ent.Client
	Inertia *inertia.Inertia
}

func init() {
	Register(new(Forms))
}

func (h *Forms) Init(c *services.Container) error {
	h.config = c.Config
	h.orm = c.ORM
	h.Inertia = c.Inertia
	return nil
}

func (h *Forms) Routes(g *echo.Group) {
	// Public routes (no auth required)
	g.GET("/:identifier/:slug", h.View).Name = routenames.FormsView
	g.POST("/:identifier/:slug", h.Submit).Name = routenames.FormsSubmit
	g.GET("/:identifier/:slug/thank-you", h.ThankYou).Name = routenames.FormsThankYou

	// Authenticated routes
	formsGroup := g.Group("/forms", middleware.RequireAuthentication)
	formsGroup.GET("", h.Index).Name = routenames.Forms
	formsGroup.GET("/create", h.Create).Name = routenames.FormsCreate
	formsGroup.POST("", h.Store).Name = routenames.FormsStore
	formsGroup.GET("/:id/edit", h.Edit).Name = routenames.FormsEdit
	formsGroup.POST("/:id", h.Update).Name = routenames.FormsUpdate
	formsGroup.DELETE("/:id", h.Delete).Name = routenames.FormsDelete
	formsGroup.GET("/:id", h.Show).Name = routenames.FormsShow
	formsGroup.GET("/:id/responses", h.Responses).Name = routenames.FormsResponses
	formsGroup.GET("/:id/responses/:responseId", h.ResponseShow).Name = routenames.FormsResponsesShow
	formsGroup.GET("/:id/responses/export", h.ResponsesExport).Name = routenames.FormsResponsesExport
}

func (h *Forms) Index(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)

	forms, err := user.QueryForms().
		WithOwner().
		Order(ent.Desc("created_at")).
		All(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to query forms", h.Inertia, ctx)
	}

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/Index",
		inertia.Props{
			"forms":          forms,
			"user":           user,
			"userIdentifier": getUserIdentifier(user),
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) Create(ctx echo.Context) error {
	err := h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/Create",
		inertia.Props{},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) Store(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)

	w := ctx.Response().Writer
	r := ctx.Request()

	title := ctx.FormValue("title")
	description := ctx.FormValue("description")

	uriCreate := ctx.Echo().Reverse(routenames.FormsCreate)

	if title == "" {
		msg.Danger(ctx, "Title is required")
		h.Inertia.Redirect(w, r, uriCreate)
		return nil
	}

	slug := generateSlug(title)

	formCreate := h.orm.Form.
		Create().
		SetTitle(title).
		SetSlug(slug).
		SetOwner(user)

	if description != "" {
		formCreate.SetDescription(description)
	}

	createdForm, err := formCreate.Save(ctx.Request().Context())
	if err != nil {
		if ent.IsConstraintError(err) {
			for i := 2; i <= 10; i++ {
				slug = fmt.Sprintf("%s-%d", generateSlug(title), i)
				formCreate.SetSlug(slug)
				createdForm, err = formCreate.Save(ctx.Request().Context())
				if err == nil {
					break
				}
			}
			if err != nil {
				msg.Danger(ctx, "A form with this title already exists. Please try a different title.")
				h.Inertia.Redirect(w, r, r.URL.Path)
				return nil
			}
		} else {
			return fail(err, "failed to create form", h.Inertia, ctx)
		}
	}

	msg.Success(ctx, "Form created successfully!")
	h.Inertia.Redirect(w, r, fmt.Sprintf("/forms/%d/edit", createdForm.ID))
	return nil
}

func (h *Forms) Edit(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	id := ctx.Param("id")

	formID, err := parseID(id)
	if err != nil {
		return fail(err, "invalid form ID", h.Inertia, ctx)
	}

	formData, err := h.orm.Form.
		Query().
		Where(form.ID(formID)).
		WithOwner().
		WithQuestions().
		Only(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch form", h.Inertia, ctx)
	}

	if formData.Edges.Owner.ID != user.ID {
		msg.Danger(ctx, "Unauthorized access")
		h.Inertia.Redirect(ctx.Response().Writer, ctx.Request(), ctx.Echo().Reverse(routenames.Forms))
		return nil
	}

	formWithQuestions := map[string]interface{}{
		"id":           formData.ID,
		"title":        formData.Title,
		"description":  formData.Description,
		"slug":         formData.Slug,
		"published":    formData.Published,
		"display_mode": formData.DisplayMode,
		"user_id":      formData.UserID,
		"created_at":   formData.CreatedAt,
		"updated_at":   formData.UpdatedAt,
		"edges": map[string]interface{}{
			"questions": func() []map[string]interface{} {
				questions := []map[string]interface{}{}
				if qs, err := formData.Edges.QuestionsOrErr(); err == nil {
					for _, q := range qs {
						var opts interface{}
						isSelectionField := q.Type == "dropdown" || q.Type == "radio" ||
							q.Type == "checkbox" || q.Type == "multi-select" ||
							q.Type == "picture-choice"
						
						if q.Options != nil {
							opts = q.Options
						} else if isSelectionField {
							opts = map[string]interface{}{"items": []string{"Option 1", "Option 2"}}
						}

						questions = append(questions, map[string]interface{}{
							"id":          q.ID,
							"type":        q.Type,
							"title":       q.Title,
							"description": q.Description,
							"placeholder": q.Placeholder,
							"required":    q.Required,
							"order":       q.Order,
							"options":     opts,
							"created_at":  q.CreatedAt,
							"updated_at":  q.UpdatedAt,
						})
					}
				}
				return questions
			}(),
		},
	}

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/Edit",
		inertia.Props{
			"form":           formWithQuestions,
			"userIdentifier": getUserIdentifier(user),
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) Show(ctx echo.Context) error {
	id := ctx.Param("id")

	err := h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/Show",
		inertia.Props{
			"formId": id,
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) Update(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	id := ctx.Param("id")

	w := ctx.Response().Writer
	r := ctx.Request()

	formID, err := parseID(id)
	if err != nil {
		return fail(err, "invalid form ID", h.Inertia, ctx)
	}

	formData, err := h.orm.Form.Query().
		Where(form.ID(formID)).
		WithOwner().
		Only(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch form", h.Inertia, ctx)
	}

	if formData.Edges.Owner.ID != user.ID {
		msg.Danger(ctx, "Unauthorized access")
		h.Inertia.Redirect(w, r, ctx.Echo().Reverse(routenames.Forms))
		return nil
	}

	update := h.orm.Form.UpdateOne(formData)

	publishedStr := ctx.FormValue("published")
	if publishedStr != "" {
		published := publishedStr == "1" || publishedStr == "true"
		update.SetPublished(published)
	}

	displayMode := ctx.FormValue("display_mode")
	if displayMode != "" {
		update.SetDisplayMode(form.DisplayMode(displayMode))
	}

	_, err = update.Save(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to update form settings", h.Inertia, ctx)
	}

	questionsJSON := ctx.FormValue("questions")
	if questionsJSON == "" {
		return fail(fmt.Errorf("questions field is required"), "questions are required", h.Inertia, ctx)
	}

	var questions []map[string]interface{}
	if err := json.Unmarshal([]byte(questionsJSON), &questions); err != nil {
		return fail(err, "invalid questions format", h.Inertia, ctx)
	}

	tx, err := h.orm.Tx(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to start transaction", h.Inertia, ctx)
	}

	_, err = tx.Question.Delete().
		Where(question.HasFormWith(form.ID(formID))).
		Exec(ctx.Request().Context())
	if err != nil {
		tx.Rollback()
		return fail(err, "failed to delete existing questions", h.Inertia, ctx)
	}

	for _, q := range questions {
		qType, _ := q["type"].(string)
		qTitle, _ := q["title"].(string)
		qDescription, _ := q["description"].(string)
		qPlaceholder, _ := q["placeholder"].(string)
		qRequired, _ := q["required"].(bool)
		qOrder, _ := q["order"].(float64)

		create := tx.Question.Create().
			SetType(question.Type(qType)).
			SetTitle(qTitle).
			SetRequired(qRequired).
			SetOrder(int(qOrder)).
			SetFormID(formID)

		if qDescription != "" {
			create.SetDescription(qDescription)
		}
		if qPlaceholder != "" {
			create.SetPlaceholder(qPlaceholder)
		}

		if optionsMap, ok := q["options"].(map[string]interface{}); ok && len(optionsMap) > 0 {
			create.SetOptions(optionsMap)
		}

		_, err = create.Save(ctx.Request().Context())
		if err != nil {
			tx.Rollback()
			return fail(err, "failed to create question", h.Inertia, ctx)
		}
	}

	if err := tx.Commit(); err != nil {
		return fail(err, "failed to commit transaction", h.Inertia, ctx)
	}

	msg.Success(ctx, "Form updated successfully!")
	h.Inertia.Redirect(w, r, fmt.Sprintf("/forms/%d/edit", formID))
	return nil
}

func (h *Forms) View(ctx echo.Context) error {
	identifier := ctx.Param("identifier")
	slug := ctx.Param("slug")

	users, err := h.orm.User.Query().All(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "Error finding user",
		})
	}

	var foundUser *ent.User
	for _, u := range users {
		if getUserIdentifier(u) == identifier {
			foundUser = u
			break
		}
	}

	if foundUser == nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "User not found",
		})
	}

	formData, err := h.orm.Form.Query().
		Where(form.UserID(foundUser.ID), form.Slug(slug), form.Published(true)).
		WithQuestions().
		Only(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "Form not found",
		})
	}

	props := inertia.Props{
		"form": formData,
		"brandColors": map[string]string{
			"button":     foundUser.BrandButtonColor,
			"background": foundUser.BrandBackgroundColor,
			"text":       foundUser.BrandTextColor,
		},
	}

	if foundUser.Logo != "" {
		props["userLogo"] = foundUser.Logo
	}

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/View",
		props,
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) Submit(ctx echo.Context) error {
	identifier := ctx.Param("identifier")
	slug := ctx.Param("slug")

	users, err := h.orm.User.Query().All(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "Error finding user",
		})
	}

	var foundUser *ent.User
	for _, u := range users {
		if getUserIdentifier(u) == identifier {
			foundUser = u
			break
		}
	}

	if foundUser == nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "User not found",
		})
	}

	formData, err := h.orm.Form.Query().
		Where(form.UserID(foundUser.ID), form.Slug(slug), form.Published(true)).
		WithQuestions().
		Only(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "Form not found or not published",
		})
	}

	answersJSON := ctx.FormValue("answers")
	if answersJSON == "" {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "Answers are required",
		})
	}

	var answers map[string]interface{}
	if err := json.Unmarshal([]byte(answersJSON), &answers); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid answers format",
		})
	}

	tx, err := h.orm.Tx(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to start transaction", h.Inertia, ctx)
	}

	ipAddress := ctx.RealIP()
	userAgent := ctx.Request().UserAgent()

	response, err := tx.Response.Create().
		SetFormID(formData.ID).
		SetIPAddress(ipAddress).
		SetUserAgent(userAgent).
		SetCompleted(true).
		Save(ctx.Request().Context())
	if err != nil {
		tx.Rollback()
		return fail(err, "failed to create response", h.Inertia, ctx)
	}

	for _, q := range formData.Edges.Questions {
		answerValue, ok := answers[fmt.Sprintf("%d", q.ID)]
		if !ok || answerValue == nil {
			if q.Required {
				tx.Rollback()
				return ctx.JSON(http.StatusBadRequest, map[string]string{
					"error": fmt.Sprintf("Required question '%s' not answered", q.Title),
				})
			}
			continue
		}

		var answerStr string
		switch v := answerValue.(type) {
		case string:
			answerStr = v
		case []interface{}:
			bytes, _ := json.Marshal(v)
			answerStr = string(bytes)
		default:
			answerStr = fmt.Sprintf("%v", v)
		}

		_, err = tx.Answer.Create().
			SetResponseID(response.ID).
			SetQuestionID(q.ID).
			SetValue(answerStr).
			Save(ctx.Request().Context())
		if err != nil {
			tx.Rollback()
			return fail(err, "failed to save answer", h.Inertia, ctx)
		}
	}

	if err := tx.Commit(); err != nil {
		return fail(err, "failed to commit transaction", h.Inertia, ctx)
	}

	ctx.Response().Header().Set("Location", fmt.Sprintf("/%s/%s/thank-you", identifier, slug))
	ctx.Response().WriteHeader(http.StatusSeeOther)
	return nil
}

func (h *Forms) ThankYou(ctx echo.Context) error {
	identifier := ctx.Param("identifier")
	slug := ctx.Param("slug")

	users, err := h.orm.User.Query().All(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "Error finding user",
		})
	}

	var foundUser *ent.User
	for _, u := range users {
		if getUserIdentifier(u) == identifier {
			foundUser = u
			break
		}
	}

	if foundUser == nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "User not found",
		})
	}

	formData, err := h.orm.Form.Query().
		Where(form.UserID(foundUser.ID), form.Slug(slug)).
		Only(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "Form not found",
		})
	}

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/ThankYou",
		inertia.Props{
			"formTitle": formData.Title,
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) Delete(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	id := ctx.Param("id")

	w := ctx.Response().Writer
	r := ctx.Request()

	formID, err := parseID(id)
	if err != nil {
		return fail(err, "invalid form ID", h.Inertia, ctx)
	}

	formData, err := h.orm.Form.Query().
		Where(form.ID(formID)).
		WithOwner().
		Only(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch form", h.Inertia, ctx)
	}

	if formData.Edges.Owner.ID != user.ID {
		msg.Danger(ctx, "Unauthorized access")
		h.Inertia.Redirect(w, r, ctx.Echo().Reverse(routenames.Forms))
		return nil
	}

	err = h.orm.Form.DeleteOne(formData).Exec(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to delete form", h.Inertia, ctx)
	}

	msg.Success(ctx, "Form deleted successfully")
	ctx.Response().Header().Set("Location", "/forms")
	ctx.Response().WriteHeader(http.StatusSeeOther)
	return nil
}

func generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = regexp.MustCompile(`[^a-z0-9\s-]`).ReplaceAllString(slug, "")
	slug = regexp.MustCompile(`[\s-]+`).ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")

	if slug == "" {
		slug = fmt.Sprintf("form-%d", time.Now().Unix())
	}

	return slug
}

func parseID(id string) (int, error) {
	return strconv.Atoi(id)
}

func getUserIdentifier(user *ent.User) string {
	if user.CompanyName != "" {
		return generateSlug(user.CompanyName)
	}
	if user.Username != "" {
		return user.Username
	}
	emailParts := strings.Split(user.Email, "@")
	if len(emailParts) > 0 {
		return generateSlug(emailParts[0])
	}
	return fmt.Sprintf("user-%d", user.ID)
}

func (h *Forms) Responses(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	id := ctx.Param("id")

	formID, err := parseID(id)
	if err != nil {
		return fail(err, "invalid form ID", h.Inertia, ctx)
	}

	formData, err := h.orm.Form.Query().
		Where(form.ID(formID)).
		WithOwner().
		Only(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch form", h.Inertia, ctx)
	}

	if formData.Edges.Owner.ID != user.ID {
		msg.Danger(ctx, "Unauthorized access")
		h.Inertia.Redirect(ctx.Response().Writer, ctx.Request(), ctx.Echo().Reverse(routenames.Forms))
		return nil
	}

	responses, err := h.orm.Response.Query().
		Where(response.HasFormWith(form.ID(formID))).
		WithAnswers(func(q *ent.AnswerQuery) {
			q.WithQuestion()
		}).
		Order(ent.Desc("submitted_at")).
		All(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch responses", h.Inertia, ctx)
	}

	totalResponses := len(responses)
	completedResponses := 0
	for _, r := range responses {
		if r.Completed {
			completedResponses++
		}
	}

	completionRate := 0.0
	if totalResponses > 0 {
		completionRate = float64(completedResponses) / float64(totalResponses) * 100
	}

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/Responses/Index",
		inertia.Props{
			"form":           formData,
			"responses":      responses,
			"totalResponses": totalResponses,
			"completionRate": completionRate,
			"userIdentifier": getUserIdentifier(user),
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) ResponseShow(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	id := ctx.Param("id")
	responseID := ctx.Param("responseId")

	formID, err := parseID(id)
	if err != nil {
		return fail(err, "invalid form ID", h.Inertia, ctx)
	}

	respID, err := parseID(responseID)
	if err != nil {
		return fail(err, "invalid response ID", h.Inertia, ctx)
	}

	formData, err := h.orm.Form.Query().
		Where(form.ID(formID)).
		WithOwner().
		WithQuestions().
		Only(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch form", h.Inertia, ctx)
	}

	if formData.Edges.Owner.ID != user.ID {
		msg.Danger(ctx, "Unauthorized access")
		h.Inertia.Redirect(ctx.Response().Writer, ctx.Request(), ctx.Echo().Reverse(routenames.Forms))
		return nil
	}

	responseData, err := h.orm.Response.Query().
		Where(response.ID(respID), response.HasFormWith(form.ID(formID))).
		WithAnswers(func(q *ent.AnswerQuery) {
			q.WithQuestion()
		}).
		Only(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch response", h.Inertia, ctx)
	}

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/Responses/Show",
		inertia.Props{
			"form":     formData,
			"response": responseData,
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) ResponsesExport(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	id := ctx.Param("id")

	formID, err := parseID(id)
	if err != nil {
		return fail(err, "invalid form ID", h.Inertia, ctx)
	}

	formData, err := h.orm.Form.Query().
		Where(form.ID(formID)).
		WithOwner().
		WithQuestions().
		Only(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch form", h.Inertia, ctx)
	}

	if formData.Edges.Owner.ID != user.ID {
		msg.Danger(ctx, "Unauthorized access")
		h.Inertia.Redirect(ctx.Response().Writer, ctx.Request(), ctx.Echo().Reverse(routenames.Forms))
		return nil
	}

	responses, err := h.orm.Response.Query().
		Where(response.HasFormWith(form.ID(formID))).
		WithAnswers(func(q *ent.AnswerQuery) {
			q.WithQuestion()
		}).
		Order(ent.Desc("submitted_at")).
		All(ctx.Request().Context())
	if err != nil {
		return fail(err, "failed to fetch responses", h.Inertia, ctx)
	}

	csv := "Submitted At,IP Address,User Agent,Completed"
	for _, q := range formData.Edges.Questions {
		csv += fmt.Sprintf(",\"%s\"", strings.ReplaceAll(q.Title, "\"", "\"\""))
	}
	csv += "\n"

	for _, resp := range responses {
		row := fmt.Sprintf("%s,\"%s\",\"%s\",%t",
			resp.SubmittedAt.Format("2006-01-02 15:04:05"),
			resp.IPAddress,
			resp.UserAgent,
			resp.Completed,
		)

		answerMap := make(map[int]string)
		for _, answer := range resp.Edges.Answers {
			answerMap[answer.Edges.Question.ID] = answer.Value
		}

		for _, q := range formData.Edges.Questions {
			value := answerMap[q.ID]
			value = strings.ReplaceAll(value, "\"", "\"\"")
			row += fmt.Sprintf(",\"%s\"", value)
		}

		csv += row + "\n"
	}

	ctx.Response().Header().Set("Content-Type", "text/csv")
	ctx.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s-responses.csv\"", formData.Slug))
	ctx.Response().WriteHeader(http.StatusOK)
	ctx.Response().Write([]byte(csv))

	return nil
}
