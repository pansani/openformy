package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Job holds the schema definition for the Job entity.
type Job struct {
	ent.Schema
}

// Fields of the Job.
func (Job) Fields() []ent.Field {
	return []ent.Field{
		field.String("queue").
			NotEmpty().
			Comment("Name of the job queue (e.g., extract_brand_colors)"),
		field.JSON("payload", map[string]interface{}{}).
			Comment("Job payload data as JSON"),
		field.Int("attempts").
			Default(0).
			Comment("Number of times this job has been attempted"),
		field.Int("max_attempts").
			Default(3).
			Comment("Maximum number of retry attempts"),
		field.Enum("status").
			Values("pending", "processing", "completed", "failed").
			Default("pending").
			Comment("Current status of the job"),
		field.Text("error").
			Optional().
			Comment("Error message if job failed"),
		field.Time("created_at").
			Default(time.Now).
			Immutable().
			Comment("When the job was created"),
		field.Time("processed_at").
			Optional().
			Comment("When the job was processed"),
	}
}

// Edges of the Job.
func (Job) Edges() []ent.Edge {
	return nil
}

// Indexes of the Job.
func (Job) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("queue", "status"),
		index.Fields("created_at"),
	}
}
