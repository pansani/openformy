package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Answer struct {
	ent.Schema
}

func (Answer) Fields() []ent.Field {
	return []ent.Field{
		field.Text("value").
			NotEmpty(),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
	}
}

func (Answer) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("response", Response.Type).
			Ref("answers").
			Unique().
			Required(),
		edge.From("question", Question.Type).
			Ref("answers").
			Unique().
			Required(),
	}
}
