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
		field.String("IPAddress").
			Optional().
			StorageKey("ip_address").
			StructTag(`json:"ip_address"`),
		field.String("UserAgent").
			Optional().
			StorageKey("user_agent").
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
