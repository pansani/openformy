package handlers

import (
	"context"
	"fmt"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	entQuestion "github.com/occult/pagode/ent/question"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createTestEchoContext(t *testing.T) echo.Context {
	e := echo.New()
	req := httptest.NewRequest("GET", "/dashboard", nil)
	rec := httptest.NewRecorder()
	return e.NewContext(req, rec)
}

func TestDashboard__getStats_EmptyUser(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	ctx := createTestEchoContext(t)

	stats, err := dashboard.getStats(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, stats)
	assert.Equal(t, 0, stats.TotalForms)
	assert.Equal(t, 0, stats.TotalResponses)
	assert.Equal(t, 0, stats.ActiveForms)
	assert.Equal(t, 0.0, stats.AvgCompletionRate)
}

func TestDashboard__getStats_WithForms(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	_, err := c.ORM.Form.Create().
		SetTitle("Test Form 1").
		SetSlug(fmt.Sprintf("test-form-1-%d", randomInt())).
		SetOwner(user).
		SetPublished(true).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Form.Create().
		SetTitle("Test Form 2").
		SetSlug(fmt.Sprintf("test-form-2-%d", randomInt())).
		SetOwner(user).
		SetPublished(false).
		Save(context.Background())
	require.NoError(t, err)

	ctx := createTestEchoContext(t)

	stats, err := dashboard.getStats(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, stats)
	assert.Equal(t, 2, stats.TotalForms)
	assert.Equal(t, 1, stats.ActiveForms)
	assert.Equal(t, 0, stats.TotalResponses)
}

func TestDashboard__getStats_WithResponses(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	form, err := c.ORM.Form.Create().
		SetTitle("Test Form").
		SetSlug(fmt.Sprintf("test-form-%d", randomInt())).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Question.Create().
		SetForm(form).
		SetTitle("Test Question").
		SetType(entQuestion.TypeText).
		SetOrder(1).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(true).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(false).
		Save(context.Background())
	require.NoError(t, err)

	ctx := createTestEchoContext(t)

	stats, err := dashboard.getStats(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, stats)
	assert.Equal(t, 1, stats.TotalForms)
	assert.Equal(t, 2, stats.TotalResponses)
	assert.Equal(t, 50.0, stats.AvgCompletionRate)
}

func TestDashboard__getRecentResponses_Empty(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	ctx := createTestEchoContext(t)

	responses, err := dashboard.getRecentResponses(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, responses)
	assert.Len(t, responses, 0)
}

func TestDashboard__getRecentResponses_WithData(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	form, err := c.ORM.Form.Create().
		SetTitle("Test Form").
		SetSlug(fmt.Sprintf("test-form-%d", randomInt())).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(true).
		SetSubmittedAt(time.Now().Add(-1 * time.Hour)).
		Save(context.Background())
	require.NoError(t, err)

	response2, err := c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(false).
		SetSubmittedAt(time.Now()).
		Save(context.Background())
	require.NoError(t, err)

	ctx := createTestEchoContext(t)

	responses, err := dashboard.getRecentResponses(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, responses)
	assert.Len(t, responses, 2)
	assert.Equal(t, "Test Form", responses[0].FormTitle)
	assert.Equal(t, response2.ID, responses[0].ResponseID)
	assert.Equal(t, false, responses[0].Completed)
	assert.Equal(t, true, responses[1].Completed)
}

func TestDashboard__getRecentResponses_Limit10(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	form, err := c.ORM.Form.Create().
		SetTitle("Test Form").
		SetSlug(fmt.Sprintf("test-form-%d", randomInt())).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)

	for i := 0; i < 15; i++ {
		_, err = c.ORM.Response.Create().
			SetForm(form).
			SetCompleted(true).
			SetSubmittedAt(time.Now().Add(-1 * time.Duration(i) * time.Hour)).
			Save(context.Background())
		require.NoError(t, err)
	}

	ctx := createTestEchoContext(t)

	responses, err := dashboard.getRecentResponses(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, responses)
	assert.Len(t, responses, 10)
}

func TestDashboard__getFormStats_Empty(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	ctx := createTestEchoContext(t)

	formStats, err := dashboard.getFormStats(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, formStats)
	assert.Len(t, formStats, 0)
}

func TestDashboard__getFormStats_WithData(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	form, err := c.ORM.Form.Create().
		SetTitle("Test Form").
		SetSlug(fmt.Sprintf("test-form-%d", randomInt())).
		SetOwner(user).
		SetPublished(true).
		Save(context.Background())
	require.NoError(t, err)

	lastResponseTime := time.Now()
	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(true).
		SetSubmittedAt(lastResponseTime).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(false).
		Save(context.Background())
	require.NoError(t, err)

	ctx := createTestEchoContext(t)

	formStats, err := dashboard.getFormStats(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, formStats)
	assert.Len(t, formStats, 1)
	assert.Equal(t, form.ID, formStats[0].ID)
	assert.Equal(t, "Test Form", formStats[0].Title)
	assert.Equal(t, 2, formStats[0].ResponseCount)
	assert.Equal(t, 50.0, formStats[0].CompletionRate)
	assert.True(t, formStats[0].Published)
	assert.NotNil(t, formStats[0].LastResponse)
}

func TestDashboard__getChartData_Empty(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	ctx := createTestEchoContext(t)

	chartData, err := dashboard.getChartData(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, chartData)
	assert.Greater(t, len(chartData), 0)

	for _, point := range chartData {
		assert.Equal(t, 0, point.Responses)
	}
}

func TestDashboard__getChartData_WithResponses(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	form, err := c.ORM.Form.Create().
		SetTitle("Test Form").
		SetSlug(fmt.Sprintf("test-form-%d", randomInt())).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)

	today := time.Now()
	yesterday := today.AddDate(0, 0, -1)

	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(true).
		SetSubmittedAt(today).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(true).
		SetSubmittedAt(today).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(true).
		SetSubmittedAt(yesterday).
		Save(context.Background())
	require.NoError(t, err)

	ctx := createTestEchoContext(t)

	chartData, err := dashboard.getChartData(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, chartData)
	assert.Greater(t, len(chartData), 0)

	todayStr := today.Format("2006-01-02")
	yesterdayStr := yesterday.Format("2006-01-02")

	var todayCount, yesterdayCount int
	for _, point := range chartData {
		if point.Date == todayStr {
			todayCount = point.Responses
		}
		if point.Date == yesterdayStr {
			yesterdayCount = point.Responses
		}
	}

	assert.Equal(t, 2, todayCount)
	assert.Equal(t, 1, yesterdayCount)
}

func TestDashboard__getChartData_OnlyLast30Days(t *testing.T) {
	user := createTestUser(t)
	dashboard := new(Dashboard)
	dashboard.orm = c.ORM

	form, err := c.ORM.Form.Create().
		SetTitle("Test Form").
		SetSlug(fmt.Sprintf("test-form-%d", randomInt())).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)

	oldDate := time.Now().AddDate(0, 0, -40)
	_, err = c.ORM.Response.Create().
		SetForm(form).
		SetCompleted(true).
		SetSubmittedAt(oldDate).
		Save(context.Background())
	require.NoError(t, err)

	ctx := createTestEchoContext(t)

	chartData, err := dashboard.getChartData(ctx, user)
	require.NoError(t, err)
	assert.NotNil(t, chartData)

	oldDateStr := oldDate.Format("2006-01-02")
	for _, point := range chartData {
		if point.Date == oldDateStr {
			assert.Equal(t, 0, point.Responses)
		}
	}
}
