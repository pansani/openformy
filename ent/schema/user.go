package schema

import (
	"context"
	"net/mail"
	"strings"
	"time"

	ge "github.com/occult/pagode/ent"
	"github.com/occult/pagode/ent/hook"
	"golang.org/x/crypto/bcrypt"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").
			NotEmpty(),
		field.String("email").
			NotEmpty().
			Unique().
			Validate(func(s string) error {
				_, err := mail.ParseAddress(s)
				return err
			}),
		field.String("password").
			Sensitive().
			NotEmpty(),
		field.String("username").
			Unique().
			Optional(),
		field.String("company_name").
			Optional(),
		field.Bool("verified").
			Default(false),
		field.Bool("admin").
			Default(false),
		field.String("website").
			Optional(),
		field.String("brand_button_color").
			Optional().
			Comment("Button/CTA color extracted from user's website"),
		field.String("brand_background_color").
			Optional().
			Comment("Main background/surface color extracted from user's website"),
		field.String("brand_text_color").
			Optional().
			Comment("Text color on buttons extracted from user's website"),
		field.Enum("brand_colors_status").
			Values("pending", "processing", "completed", "failed").
			Optional().
			Comment("Status of brand color extraction job"),
		field.String("logo").
			Optional(),
		field.Enum("language").
			Values("en", "pt", "es", "fr").
			Default("en").
			Comment("User's preferred language for UI and communications"),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("owner", PasswordToken.Type).
			Ref("user"),
		edge.From("payment_customer", PaymentCustomer.Type).
			Ref("user").
			Unique(),
		edge.To("forms", Form.Type),
		edge.To("responses", Response.Type),
	}
}

// Hooks of the User.
func (User) Hooks() []ent.Hook {
	return []ent.Hook{
		hook.On(
			func(next ent.Mutator) ent.Mutator {
				return hook.UserFunc(func(ctx context.Context, m *ge.UserMutation) (ent.Value, error) {
					if v, exists := m.Email(); exists {
						m.SetEmail(strings.ToLower(v))
					}

					if v, exists := m.Password(); exists {
						hash, err := bcrypt.GenerateFromPassword([]byte(v), bcrypt.DefaultCost)
						if err != nil {
							return "", err
						}
						m.SetPassword(string(hash))
					}
					return next.Mutate(ctx, m)
				})
			},
			// Limit the hook only for these operations.
			ent.OpCreate|ent.OpUpdate|ent.OpUpdateOne,
		),
	}
}
