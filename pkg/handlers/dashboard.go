package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/occult/pagode/ent"
	"github.com/occult/pagode/ent/form"
	"github.com/occult/pagode/ent/response"
	entUser "github.com/occult/pagode/ent/user"
	"github.com/occult/pagode/pkg/context"
	"github.com/occult/pagode/pkg/middleware"
	"github.com/occult/pagode/pkg/routenames"
	"github.com/occult/pagode/pkg/services"
	inertia "github.com/romsar/gonertia/v2"
)

type Dashboard struct {
	orm     *ent.Client
	Inertia *inertia.Inertia
}

func init() {
	Register(new(Dashboard))
}

func (h *Dashboard) Init(c *services.Container) error {
	h.orm = c.ORM
	h.Inertia = c.Inertia
	return nil
}

func (h *Dashboard) Routes(g *echo.Group) {
	authGroup := g.Group("")
	authGroup.Use(middleware.RequireAuthentication)
	authGroup.GET("/dashboard", h.Page).Name = routenames.Dashboard
}

type DashboardStats struct {
	TotalForms        int     `json:"total_forms"`
	TotalResponses    int     `json:"total_responses"`
	ActiveForms       int     `json:"active_forms"`
	AvgCompletionRate float64 `json:"avg_completion_rate"`
}

type RecentResponse struct {
	FormTitle   string    `json:"form_title"`
	SubmittedAt time.Time `json:"submitted_at"`
	Completed   bool      `json:"completed"`
	ResponseID  int       `json:"response_id"`
	FormID      int       `json:"form_id"`
}

type FormStats struct {
	ID             int        `json:"id"`
	Title          string     `json:"title"`
	ResponseCount  int        `json:"response_count"`
	CompletionRate float64    `json:"completion_rate"`
	LastResponse   *time.Time `json:"last_response"`
	Published      bool       `json:"published"`
}

type ChartDataPoint struct {
	Date      string `json:"date"`
	Responses int    `json:"responses"`
}

func (h *Dashboard) Page(ctx echo.Context) error {
	user := ctx.Get(context.AuthenticatedUserKey).(*ent.User)

	stats, err := h.getStats(ctx, user)
	if err != nil {
		return fail(err, "failed to get dashboard stats", h.Inertia, ctx)
	}

	recentResponses, err := h.getRecentResponses(ctx, user)
	if err != nil {
		return fail(err, "failed to get recent responses", h.Inertia, ctx)
	}

	formStats, err := h.getFormStats(ctx, user)
	if err != nil {
		return fail(err, "failed to get form stats", h.Inertia, ctx)
	}

	chartData, err := h.getChartData(ctx, user)
	if err != nil {
		return fail(err, "failed to get chart data", h.Inertia, ctx)
	}

	err = h.Inertia.Render(
		ctx.Response().Writer,
		ctx.Request(),
		"Dashboard",
		inertia.Props{
			"stats":           stats,
			"recentResponses": recentResponses,
			"formStats":       formStats,
			"chartData":       chartData,
		},
	)
	if err != nil {
		handleServerErr(ctx.Response().Writer, err)
		return err
	}

	return nil
}

func (h *Dashboard) getStats(ctx echo.Context, user *ent.User) (*DashboardStats, error) {
	totalForms, err := user.QueryForms().Count(ctx.Request().Context())
	if err != nil {
		return nil, err
	}

	totalResponses, err := h.orm.Response.Query().
		Where(response.HasFormWith(form.HasOwnerWith(entUser.ID(user.ID)))).
		Count(ctx.Request().Context())
	if err != nil {
		return nil, err
	}

	activeForms, err := user.QueryForms().Where(form.Published(true)).Count(ctx.Request().Context())
	if err != nil {
		return nil, err
	}

	completedResponses, err := h.orm.Response.Query().
		Where(
			response.HasFormWith(form.HasOwnerWith(entUser.ID(user.ID))),
			response.Completed(true),
		).
		Count(ctx.Request().Context())
	if err != nil {
		return nil, err
	}

	var avgCompletionRate float64
	if totalResponses > 0 {
		avgCompletionRate = (float64(completedResponses) / float64(totalResponses)) * 100
	}

	return &DashboardStats{
		TotalForms:        totalForms,
		TotalResponses:    totalResponses,
		ActiveForms:       activeForms,
		AvgCompletionRate: avgCompletionRate,
	}, nil
}

func (h *Dashboard) getRecentResponses(ctx echo.Context, user *ent.User) ([]RecentResponse, error) {
	responses, err := h.orm.Response.Query().
		Where(response.HasFormWith(form.HasOwnerWith(entUser.ID(user.ID)))).
		WithForm().
		Order(ent.Desc(response.FieldSubmittedAt)).
		Limit(10).
		All(ctx.Request().Context())
	if err != nil {
		return nil, err
	}

	recent := make([]RecentResponse, 0, len(responses))
	for _, r := range responses {
		recent = append(recent, RecentResponse{
			FormTitle:   r.Edges.Form.Title,
			SubmittedAt: r.SubmittedAt,
			Completed:   r.Completed,
			ResponseID:  r.ID,
			FormID:      r.Edges.Form.ID,
		})
	}

	return recent, nil
}

func (h *Dashboard) getFormStats(ctx echo.Context, user *ent.User) ([]FormStats, error) {
	forms, err := user.QueryForms().
		WithResponses().
		Order(ent.Desc(form.FieldCreatedAt)).
		All(ctx.Request().Context())
	if err != nil {
		return nil, err
	}

	stats := make([]FormStats, 0, len(forms))
	for _, f := range forms {
		responseCount := len(f.Edges.Responses)
		completedCount := 0
		var lastResponse *time.Time

		for _, r := range f.Edges.Responses {
			if r.Completed {
				completedCount++
			}
			if lastResponse == nil || r.SubmittedAt.After(*lastResponse) {
				lastResponse = &r.SubmittedAt
			}
		}

		var completionRate float64
		if responseCount > 0 {
			completionRate = (float64(completedCount) / float64(responseCount)) * 100
		}

		stats = append(stats, FormStats{
			ID:             f.ID,
			Title:          f.Title,
			ResponseCount:  responseCount,
			CompletionRate: completionRate,
			LastResponse:   lastResponse,
			Published:      f.Published,
		})
	}

	return stats, nil
}

func (h *Dashboard) getChartData(ctx echo.Context, user *ent.User) ([]ChartDataPoint, error) {
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)

	responses, err := h.orm.Response.Query().
		Where(
			response.HasFormWith(form.HasOwnerWith(entUser.ID(user.ID))),
			response.SubmittedAtGTE(thirtyDaysAgo),
		).
		All(ctx.Request().Context())
	if err != nil {
		return nil, err
	}

	countsByDate := make(map[string]int)
	for _, r := range responses {
		date := r.SubmittedAt.Format("2006-01-02")
		countsByDate[date]++
	}

	chartData := make([]ChartDataPoint, 0)
	for d := thirtyDaysAgo; d.Before(now) || d.Equal(now); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")
		chartData = append(chartData, ChartDataPoint{
			Date:      dateStr,
			Responses: countsByDate[dateStr],
		})
	}

	return chartData, nil
}
