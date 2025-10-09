package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/occult/pagode/ent"
	"github.com/occult/pagode/ent/job"
	"github.com/occult/pagode/pkg/log"
)

type JobHandler func(ctx context.Context, payload map[string]interface{}) error

type JobWorker struct {
	orm      *ent.Client
	handlers map[string]JobHandler
	ticker   *time.Ticker
	stop     chan bool
}

func NewJobWorker(orm *ent.Client) *JobWorker {
	return &JobWorker{
		orm:      orm,
		handlers: make(map[string]JobHandler),
		stop:     make(chan bool),
	}
}

func (w *JobWorker) Register(queue string, handler JobHandler) {
	w.handlers[queue] = handler
}

func (w *JobWorker) Start() {
	w.ticker = time.NewTicker(5 * time.Second)
	
	go func() {
		for {
			select {
			case <-w.ticker.C:
				w.processJobs()
			case <-w.stop:
				return
			}
		}
	}()
	
	log.Default().Info("Job worker started")
}

func (w *JobWorker) Stop() {
	if w.ticker != nil {
		w.ticker.Stop()
	}
	w.stop <- true
	log.Default().Info("Job worker stopped")
}

func (w *JobWorker) processJobs() {
	ctx := context.Background()
	
	jobs, err := w.orm.Job.Query().
		Where(
			job.StatusEQ(job.StatusPending),
		).
		Order(ent.Asc(job.FieldCreatedAt)).
		Limit(10).
		All(ctx)
	
	if err != nil {
		log.Default().Error("Failed to fetch jobs", "error", err)
		return
	}
	
	for _, j := range jobs {
		w.processJob(ctx, j)
	}
}

func (w *JobWorker) processJob(ctx context.Context, j *ent.Job) {
	handler, exists := w.handlers[j.Queue]
	if !exists {
		log.Default().Warn("No handler registered for queue", "queue", j.Queue, "job_id", j.ID)
		return
	}
	
	newAttempts := j.Attempts + 1
	
	update := j.Update()
	update.SetStatus(job.StatusProcessing)
	update.SetAttempts(newAttempts)
	
	if _, err := update.Save(ctx); err != nil {
		log.Default().Error("Failed to update job status", "job_id", j.ID, "error", err)
		return
	}
	
	err := handler(ctx, j.Payload)
	
	finalUpdate := j.Update()
	finalUpdate.SetProcessedAt(time.Now())
	
	if err != nil {
		log.Default().Error("Job failed", "job_id", j.ID, "queue", j.Queue, "error", err)
		
		if newAttempts >= j.MaxAttempts {
			finalUpdate.SetStatus(job.StatusFailed)
			finalUpdate.SetError(err.Error())
		} else {
			finalUpdate.SetStatus(job.StatusPending)
		}
	} else {
		finalUpdate.SetStatus(job.StatusCompleted)
		log.Default().Info("Job completed", "job_id", j.ID, "queue", j.Queue)
	}
	
	if _, err := finalUpdate.Save(ctx); err != nil {
		log.Default().Error("Failed to update job final status", "job_id", j.ID, "error", err)
	}
}

func (w *JobWorker) Enqueue(ctx context.Context, queue string, payload map[string]interface{}) error {
	_, err := w.orm.Job.Create().
		SetQueue(queue).
		SetPayload(payload).
		Save(ctx)
	
	if err != nil {
		return fmt.Errorf("failed to enqueue job: %w", err)
	}
	
	return nil
}

func (w *JobWorker) EnqueueJSON(ctx context.Context, queue string, data interface{}) error {
	payloadBytes, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}
	
	var payload map[string]interface{}
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}
	
	return w.Enqueue(ctx, queue, payload)
}
