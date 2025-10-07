package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/occult/pagode/config"
	"github.com/occult/pagode/ent"
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

	_, err := formCreate.Save(ctx.Request().Context())

	if err != nil {
		if ent.IsConstraintError(err) {
			slug = fmt.Sprintf("%s-%d", slug, time.Now().Unix())
			formCreate.SetSlug(slug)
			_, err = formCreate.Save(ctx.Request().Context())
			if err != nil {
				return fail(err, "failed to create form", h.Inertia, ctx)
			}
		} else {
			return fail(err, "failed to create form", h.Inertia, ctx)
		}
	}

	msg.Success(ctx, "Form created successfully!")
	h.Inertia.Redirect(w, r, ctx.Echo().Reverse(routenames.Forms))
	return nil
}

func (h *Forms) Edit(ctx echo.Context) error {
	id := ctx.Param("id")

	err := h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Forms/Edit",
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
	return ctx.JSON(http.StatusOK, map[string]string{
		"message": "Update form - to be implemented",
	})
}

func (h *Forms) Delete(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, map[string]string{
		"message": "Delete form - to be implemented",
	})
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
