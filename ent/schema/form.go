package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Form struct {
	ent.Schema
}

func (Form) Fields() []ent.Field {
	return []ent.Field{
		field.String("title").
			NotEmpty(),
		field.Text("description").
			Optional(),
		field.Bool("published").
			Default(false),
		field.String("slug").
			Unique().
			NotEmpty(),
		field.Int("user_id"),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

func (Form) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("owner", User.Type).
			Ref("forms").
			Unique().
			Required().
			Field("user_id"),
		edge.To("questions", Question.Type),
		edge.To("responses", Response.Type),
	}
}

func (Form) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("slug").
			Unique(),
	}
}
