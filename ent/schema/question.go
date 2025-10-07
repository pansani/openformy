package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Question struct {
	ent.Schema
}

func (Question) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("type").
			Values("text", "email", "number", "textarea", "dropdown", "radio", "checkbox", "date", "phone", "url").
			Default("text"),
		field.String("title").
			NotEmpty(),
		field.Text("description").
			Optional(),
		field.String("placeholder").
			Optional(),
		field.Bool("required").
			Default(false),
		field.Int("order").
			Default(0).
			NonNegative(),
		field.JSON("options", map[string]interface{}{}).
			Optional(),
		field.JSON("validation", map[string]interface{}{}).
			Optional(),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

func (Question) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("form", Form.Type).
			Ref("questions").
			Unique().
			Required(),
		edge.To("answers", Answer.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (Question) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("order"),
	}
}
