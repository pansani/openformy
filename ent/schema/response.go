package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Response struct {
	ent.Schema
}

func (Response) Fields() []ent.Field {
	return []ent.Field{
		field.Time("submitted_at").
			Default(time.Now).
			Immutable(),
		field.Bool("completed").
			Default(true),
		field.String("ip_address").
			Optional().
			StructTag(`json:"ip_address"`),
		field.String("user_agent").
			Optional().
			StructTag(`json:"user_agent"`),
	}
}

func (Response) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("form", Form.Type).
			Ref("responses").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("responses").
			Unique(),
		edge.To("answers", Answer.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (Response) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("submitted_at"),
	}
}
