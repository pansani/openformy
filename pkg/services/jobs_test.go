package services

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/occult/pagode/ent/job"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestJobWorker__Enqueue(t *testing.T) {
	worker := NewJobWorker(c.ORM)
	ctx := context.Background()

	payload := map[string]interface{}{
		"user_id": 123,
		"url":     "https://example.com",
	}

	err := worker.Enqueue(ctx, "test_queue", payload)
	require.NoError(t, err)

	jobs, err := c.ORM.Job.Query().
		Where(job.QueueEQ("test_queue")).
		All(ctx)
	require.NoError(t, err)
	assert.Len(t, jobs, 1)
	assert.Equal(t, "test_queue", jobs[0].Queue)
	assert.Equal(t, job.StatusPending, jobs[0].Status)
	assert.Equal(t, 0, jobs[0].Attempts)
	assert.Equal(t, 3, jobs[0].MaxAttempts)
}

func TestJobWorker__EnqueueJSON(t *testing.T) {
	worker := NewJobWorker(c.ORM)
	ctx := context.Background()

	type TestPayload struct {
		UserID int    `json:"user_id"`
		URL    string `json:"url"`
	}

	payload := TestPayload{
		UserID: 456,
		URL:    "https://test.com",
	}

	err := worker.EnqueueJSON(ctx, "test_json_queue", payload)
	require.NoError(t, err)

	jobs, err := c.ORM.Job.Query().
		Where(job.QueueEQ("test_json_queue")).
		All(ctx)
	require.NoError(t, err)
	assert.Len(t, jobs, 1)
	assert.Equal(t, float64(456), jobs[0].Payload["user_id"])
	assert.Equal(t, "https://test.com", jobs[0].Payload["url"])
}

func TestJobWorker__Register(t *testing.T) {
	worker := NewJobWorker(c.ORM)

	handlerCalled := false
	worker.Register("test_handler", func(ctx context.Context, payload map[string]interface{}) error {
		handlerCalled = true
		return nil
	})

	assert.Contains(t, worker.handlers, "test_handler")
	assert.NotNil(t, worker.handlers["test_handler"])

	err := worker.handlers["test_handler"](context.Background(), nil)
	require.NoError(t, err)
	assert.True(t, handlerCalled)
}

func TestJobWorker__ProcessJob_Success(t *testing.T) {
	worker := NewJobWorker(c.ORM)
	ctx := context.Background()

	processed := false
	var receivedPayload map[string]interface{}

	worker.Register("success_queue", func(ctx context.Context, payload map[string]interface{}) error {
		processed = true
		receivedPayload = payload
		return nil
	})

	payload := map[string]interface{}{
		"test": "data",
	}

	err := worker.Enqueue(ctx, "success_queue", payload)
	require.NoError(t, err)

	jobs, err := c.ORM.Job.Query().
		Where(job.QueueEQ("success_queue")).
		All(ctx)
	require.NoError(t, err)
	require.Len(t, jobs, 1)

	worker.processJob(ctx, jobs[0])

	assert.True(t, processed)
	assert.Equal(t, "data", receivedPayload["test"])

	updatedJob, err := c.ORM.Job.Get(ctx, jobs[0].ID)
	require.NoError(t, err)
	assert.Equal(t, job.StatusCompleted, updatedJob.Status)
	assert.Equal(t, 1, updatedJob.Attempts)
	assert.NotNil(t, updatedJob.ProcessedAt)
}

func TestJobWorker__ProcessJob_Failure(t *testing.T) {
	worker := NewJobWorker(c.ORM)
	ctx := context.Background()

	worker.Register("fail_queue", func(ctx context.Context, payload map[string]interface{}) error {
		return fmt.Errorf("job failed")
	})

	err := worker.Enqueue(ctx, "fail_queue", map[string]interface{}{})
	require.NoError(t, err)

	jobs, err := c.ORM.Job.Query().
		Where(job.QueueEQ("fail_queue")).
		All(ctx)
	require.NoError(t, err)
	require.Len(t, jobs, 1)

	worker.processJob(ctx, jobs[0])

	updatedJob, err := c.ORM.Job.Get(ctx, jobs[0].ID)
	require.NoError(t, err)
	assert.Equal(t, job.StatusPending, updatedJob.Status)
	assert.Equal(t, 1, updatedJob.Attempts)
}

func TestJobWorker__ProcessJob_MaxAttemptsReached(t *testing.T) {
	worker := NewJobWorker(c.ORM)
	ctx := context.Background()

	worker.Register("max_fail_queue", func(ctx context.Context, payload map[string]interface{}) error {
		return fmt.Errorf("permanent failure")
	})

	createdJob, err := c.ORM.Job.Create().
		SetQueue("max_fail_queue").
		SetPayload(map[string]interface{}{}).
		SetAttempts(2).
		SetMaxAttempts(3).
		Save(ctx)
	require.NoError(t, err)

	worker.processJob(ctx, createdJob)

	updatedJob, err := c.ORM.Job.Get(ctx, createdJob.ID)
	require.NoError(t, err)
	assert.Equal(t, job.StatusFailed, updatedJob.Status)
	assert.Equal(t, 3, updatedJob.Attempts)
	assert.Contains(t, updatedJob.Error, "permanent failure")
}

func TestJobWorker__ProcessJob_NoHandler(t *testing.T) {
	worker := NewJobWorker(c.ORM)
	ctx := context.Background()

	createdJob, err := c.ORM.Job.Create().
		SetQueue("unknown_queue").
		SetPayload(map[string]interface{}{}).
		Save(ctx)
	require.NoError(t, err)

	worker.processJob(ctx, createdJob)

	updatedJob, err := c.ORM.Job.Get(ctx, createdJob.ID)
	require.NoError(t, err)
	assert.Equal(t, job.StatusPending, updatedJob.Status)
	assert.Equal(t, 0, updatedJob.Attempts)
}

func TestJobWorker__ProcessJobs(t *testing.T) {
	worker := NewJobWorker(c.ORM)
	ctx := context.Background()

	processedCount := 0
	worker.Register("batch_queue", func(ctx context.Context, payload map[string]interface{}) error {
		processedCount++
		return nil
	})

	for i := 0; i < 5; i++ {
		err := worker.Enqueue(ctx, "batch_queue", map[string]interface{}{
			"index": i,
		})
		require.NoError(t, err)
	}

	worker.processJobs()

	assert.Equal(t, 5, processedCount)

	completedJobs, err := c.ORM.Job.Query().
		Where(
			job.QueueEQ("batch_queue"),
			job.StatusEQ(job.StatusCompleted),
		).
		Count(ctx)
	require.NoError(t, err)
	assert.Equal(t, 5, completedJobs)
}

func TestJobWorker__StartStop(t *testing.T) {
	worker := NewJobWorker(c.ORM)

	assert.Nil(t, worker.ticker)

	worker.Start()
	assert.NotNil(t, worker.ticker)

	time.Sleep(100 * time.Millisecond)

	worker.Stop()
	time.Sleep(100 * time.Millisecond)
}
