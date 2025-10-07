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
	g.GET("/f/:slug", h.View).Name = routenames.FormsView
	g.POST("/f/:slug", h.Submit).Name = routenames.FormsSubmit
	
	// Authenticated routes
	formsGroup := g.Group("/forms", middleware.RequireAuthentication)
	formsGroup.GET("", h.Index).Name = routenames.Forms
	formsGroup.GET("/create", h.Create).Name = routenames.FormsCreate
	formsGroup.POST("", h.Store).Name = routenames.FormsStore
	formsGroup.GET("/:id/edit", h.Edit).Name = routenames.FormsEdit
	formsGroup.PUT("/:id", h.Update).Name = routenames.FormsUpdate
	formsGroup.DELETE("/:id", h.Delete).Name = routenames.FormsDelete
	formsGroup.GET("/:id", h.Show).Name = routenames.FormsShow
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
			"forms": forms,
			"user":  user,
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
				return fail(err, "failed to create form", h.Inertia, ctx)
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

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/Edit",
		inertia.Props{
			"form": formData,
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

	// Update published status
	publishedStr := ctx.FormValue("published")
	if publishedStr != "" {
		published := publishedStr == "1" || publishedStr == "true"
		_, err = h.orm.Form.UpdateOne(formData).
			SetPublished(published).
			Save(ctx.Request().Context())
		if err != nil {
			return fail(err, "failed to update published status", h.Inertia, ctx)
		}
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

		if options, ok := q["options"].([]interface{}); ok && len(options) > 0 {
			optionsMap := make(map[string]interface{})
			optionsMap["items"] = options
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
	slug := ctx.Param("slug")

	formData, err := h.orm.Form.Query().
		Where(form.Slug(slug), form.Published(true)).
		WithQuestions().
		Only(ctx.Request().Context())

	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "Form not found",
		})
	}

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/View",
		inertia.Props{
			"form": formData,
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Forms) Submit(ctx echo.Context) error {
	slug := ctx.Param("slug")
	w := ctx.Response().Writer
	r := ctx.Request()

	formData, err := h.orm.Form.Query().
		Where(form.Slug(slug), form.Published(true)).
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

	msg.Success(ctx, "Thank you! Your response has been submitted successfully.")
	h.Inertia.Redirect(w, r, fmt.Sprintf("/f/%s", slug))
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
