package handlers

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/occult/pagode/pkg/routenames"
	"github.com/occult/pagode/pkg/services"
	"github.com/occult/pagode/pkg/ui/pages"
	inertia "github.com/romsar/gonertia/v2"
)

type Pages struct {
	Inertia *inertia.Inertia
}

func init() {
	Register(new(Pages))
}

func (h *Pages) Init(c *services.Container) error {
	h.Inertia = c.Inertia
	return nil
}

func (h *Pages) Routes(g *echo.Group) {
	g.GET("/", h.Welcome).Name = routenames.Welcome
	g.GET("/about", h.About).Name = routenames.About
}

func (h *Pages) Welcome(ctx echo.Context) error {
	err := h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Welcome",
		inertia.Props{
			"text": "Inertia.js with React and Go! 💚",
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func handleServerErr(w http.ResponseWriter, err error) {
	log.Printf("http error: %s\n", err)
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte("server error"))
}

func (h *Pages) About(ctx echo.Context) error {
	return pages.About(ctx)
}
