package handlers

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/occult/pagode/ent"
	"github.com/occult/pagode/ent/user"
	"github.com/occult/pagode/pkg/context"
	"github.com/occult/pagode/pkg/form"
	"github.com/occult/pagode/pkg/log"
	"github.com/occult/pagode/pkg/middleware"
	"github.com/occult/pagode/pkg/msg"
	"github.com/occult/pagode/pkg/routenames"
	"github.com/occult/pagode/pkg/services"
	inertia "github.com/romsar/gonertia/v2"
)

type Profile struct {
	orm     *ent.Client
	Inertia *inertia.Inertia
	auth    *services.AuthClient
	jobs    *services.JobWorker
	cont    *services.Container
}

type UpdateBasicInfoForm struct {
	Name     string `form:"name" validate:"required"`
	Email    string `form:"email" validate:"required,email"`
	Language string `form:"language" validate:"required,oneof=en pt es fr"`
	form.Submission
}

type UpdatePasswordForm struct {
	CurrentPassword      string `form:"current_password" validate:"required"`
	Password             string `form:"password" validate:"required,min=8"`
	PasswordConfirmation string `form:"password_confirmation" validate:"required,eqfield=Password"`
	form.Submission
}

type DeleteAccountForm struct {
	Password string `form:"password" validate:"required"`
	form.Submission
}

func init() {
	Register(new(Profile))
}

func (h *Profile) Init(c *services.Container) error {
	h.orm = c.ORM
	h.Inertia = c.Inertia
	h.auth = c.Auth
	h.jobs = c.Jobs
	h.cont = c
	return nil
}

func (h *Profile) Routes(g *echo.Group) {
	profile := g.Group("/profile")
	profile.Use(middleware.RequireAuthentication)
	profile.GET("/info", h.EditPage).Name = routenames.ProfileEdit
	profile.POST("/update", h.UpdateBasicInfo).Name = routenames.ProfileUpdate
	profile.POST("/delete", h.DeleteAccount).Name = routenames.ProfileDestroy

	profile.GET("/appearance", h.AppearancePage).Name = routenames.ProfileAppearance
	profile.GET("/password", h.PasswordPage).Name = routenames.ProfilePassword
	profile.POST("/update-password", h.UpdatePassword).Name = routenames.ProfileUpdatePassword
	profile.POST("/extract-brand-colors", h.ExtractBrandColors).Name = routenames.ProfileExtractBrandColors
}

func (h *Profile) EditPage(ctx echo.Context) error {
	return h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Settings/Profile",
	)
}

func (h *Profile) UpdateBasicInfo(ctx echo.Context) error {
	var input UpdateBasicInfoForm

	usr, ok := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	if !ok {
		msg.Danger(ctx, "You must be logged in.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	err := form.Submit(ctx, &input)

	switch err.(type) {
	case nil:
	case validator.ValidationErrors:
		msg.Warning(ctx, "Please fix the errors in the form and try again.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	default:
		return err
	}

	update := h.orm.User.UpdateOne(usr).
		SetName(input.Name).
		SetEmail(input.Email).
		SetLanguage(usr.Language)
	
	if input.Language != "" && input.Language != string(usr.Language) {
		update.SetLanguage(user.Language(input.Language))
	}

	hasChanges := input.Name != usr.Name || input.Email != usr.Email || (input.Language != "" && input.Language != string(usr.Language))

	logoFile, logoErr := ctx.FormFile("logo")
	if logoErr == nil && logoFile != nil {
		src, err := logoFile.Open()
		if err != nil {
			log.Ctx(ctx).Error("failed to open logo file", "error", err)
			msg.Danger(ctx, "Failed to upload logo")
			h.Inertia.Back(ctx.Response().Writer, ctx.Request())
			return nil
		}
		defer src.Close()

		if err := h.cont.Files.MkdirAll("logos", 0755); err != nil {
			log.Ctx(ctx).Error("failed to create logos directory", "error", err)
			msg.Danger(ctx, "Failed to upload logo")
			h.Inertia.Back(ctx.Response().Writer, ctx.Request())
			return nil
		}

		logoPath := fmt.Sprintf("logos/%d_%s", time.Now().Unix(), logoFile.Filename)
		dst, err := h.cont.Files.Create(logoPath)
		if err != nil {
			log.Ctx(ctx).Error("failed to create logo file", "error", err)
			msg.Danger(ctx, "Failed to upload logo")
			h.Inertia.Back(ctx.Response().Writer, ctx.Request())
			return nil
		}
		defer dst.Close()

		_, err = io.Copy(dst, src)
		if err != nil {
			log.Ctx(ctx).Error("failed to copy logo file", "error", err)
			msg.Danger(ctx, "Failed to upload logo")
			h.Inertia.Back(ctx.Response().Writer, ctx.Request())
			return nil
		}

		dst.Close()
		logoURL := h.cont.Files.GetPublicURL(logoPath)
		update.SetLogo(logoURL)
		hasChanges = true
		log.Ctx(ctx).Info("logo uploaded successfully", "path", logoPath, "url", logoURL)
	} else if logoErr != nil && logoErr != http.ErrMissingFile {
		log.Ctx(ctx).Error("error getting logo file", "error", logoErr)
	}

	if !hasChanges {
		msg.Info(ctx, "Nothing to update.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	_, err = update.Save(ctx.Request().Context())
	if err != nil {
		msg.Danger(ctx, "Failed to update user.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	msg.Success(ctx, "Your profile has been updated.")
	h.Inertia.Back(ctx.Response().Writer, ctx.Request())
	return nil
}

func (h *Profile) UpdatePassword(ctx echo.Context) error {
	var input UpdatePasswordForm

	usr, ok := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	if !ok {
		msg.Danger(ctx, "You must be logged in.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	err := form.Submit(ctx, &input)

	switch err.(type) {
	case nil:
	case validator.ValidationErrors:
		msg.Warning(ctx, "Please fix the errors in the form and try again.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	default:
		return err
	}

	if err := h.auth.CheckPassword(input.CurrentPassword, usr.Password); err != nil {
		msg.Danger(ctx, "The current password you entered is incorrect.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	_, err = h.orm.User.
		UpdateOneID(usr.ID).
		SetPassword(input.Password).
		Save(ctx.Request().Context())
	if err != nil {
		msg.Danger(ctx, "Something went wrong while saving your new password.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	usr, err = h.orm.User.Get(ctx.Request().Context(), usr.ID)
	if err != nil {
		msg.Danger(ctx, "Something went wrong while refreshing your session.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	uri := ctx.Echo().Reverse(routenames.ProfileUpdatePassword)

	msg.Success(ctx, "Your password has been updated successfully.")
	h.Inertia.Redirect(ctx.Response().Writer, ctx.Request(), uri)
	return nil
}

func (h *Profile) DeleteAccount(ctx echo.Context) error {
	usr := ctx.Get(context.AuthenticatedUserKey).(*ent.User)

	if err := h.auth.Logout(ctx); err != nil {
		log.Ctx(ctx).Error("error during logout on delete", "error", err)
	}

	if err := h.orm.User.DeleteOne(usr).Exec(ctx.Request().Context()); err != nil {
		return fail(err, "unable to delete user account", h.Inertia, ctx)
	}

	uri := ctx.Echo().Reverse(routenames.Welcome)

	msg.Success(ctx, "Your account has been deleted.")
	h.Inertia.Redirect(ctx.Response().Writer, ctx.Request(), uri)
	return nil
}

func (h *Profile) AppearancePage(ctx echo.Context) error {
	return h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Settings/Appearance",
	)
}

func (h *Profile) PasswordPage(ctx echo.Context) error {
	return h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Settings/Password",
	)
}

type ExtractBrandColorsForm struct {
	WebsiteURL string `form:"website_url" validate:"required,url"`
	form.Submission
}

func (h *Profile) ExtractBrandColors(ctx echo.Context) error {
	var input ExtractBrandColorsForm

	usr, ok := ctx.Get(context.AuthenticatedUserKey).(*ent.User)
	if !ok {
		msg.Danger(ctx, "You must be logged in.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	err := form.Submit(ctx, &input)
	switch err.(type) {
	case nil:
	case validator.ValidationErrors:
		msg.Warning(ctx, "Please provide a valid website URL.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	default:
		return err
	}

	_, err = h.orm.User.UpdateOne(usr).
		SetWebsite(input.WebsiteURL).
		SetBrandColorsStatus("pending").
		Save(ctx.Request().Context())
	if err != nil {
		msg.Danger(ctx, "Failed to update website URL.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	err = h.jobs.Enqueue(ctx.Request().Context(), "extract_brand_colors", map[string]interface{}{
		"user_id": usr.ID,
	})
	if err != nil {
		msg.Danger(ctx, "Failed to enqueue brand color extraction.")
		h.Inertia.Back(ctx.Response().Writer, ctx.Request())
		return nil
	}

	msg.Success(ctx, "Brand color extraction started. This may take a few moments.")
	ctx.Response().Header().Set("X-Inertia-Location", ctx.Request().Header.Get("Referer"))
	ctx.Response().WriteHeader(http.StatusOK)
	return nil
}
