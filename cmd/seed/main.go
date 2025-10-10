package main

import (
	"context"
	"fmt"
	"time"

	"github.com/occult/pagode/ent/question"
	"github.com/occult/pagode/pkg/log"
	"github.com/occult/pagode/pkg/services"
)

func main() {
	c := services.NewContainer()
	defer func() {
		if err := c.Shutdown(); err != nil {
			log.Default().Error("shutdown failed", "error", err)
		}
	}()

	ctx := context.Background()

	fmt.Println("🌱 Seeding database...")

	u, err := c.ORM.User.
		Create().
		SetEmail(fmt.Sprintf("demo-%d@example.com", time.Now().Unix())).
		SetName("Demo User").
		SetPassword("password123").
		SetVerified(true).
		Save(ctx)
	if err != nil {
		fmt.Printf("❌ Failed to create user: %v\n", err)
		return
	}
	fmt.Printf("✅ Created user: %s (ID: %d)\n", u.Email, u.ID)

	contactForm, err := c.ORM.Form.
		Create().
		SetTitle("Contact Us").
		SetDescription("Get in touch with our team").
		SetSlug(fmt.Sprintf("contact-us-%d", time.Now().Unix())).
		SetPublished(true).
		SetOwner(u).
		Save(ctx)
	if err != nil {
		fmt.Printf("❌ Failed to create contact form: %v\n", err)
		return
	}
	fmt.Printf("✅ Created form: %s (published) - slug: %s\n", contactForm.Title, contactForm.Slug)

	questions := []struct {
		Type        question.Type
		Title       string
		Description string
		Placeholder string
		Required    bool
		Order       int
		Options     map[string]interface{}
	}{
		{
			Type:        question.TypeText,
			Title:       "Full Name",
			Description: "What should we call you?",
			Placeholder: "John Smith",
			Required:    true,
			Order:       0,
		},
		{
			Type:        question.TypeEmail,
			Title:       "Email",
			Description: "Your best email address",
			Placeholder: "john@example.com",
			Required:    true,
			Order:       1,
		},
		{
			Type:        question.TypePhone,
			Title:       "Phone",
			Description: "Phone number with area code",
			Placeholder: "(555) 123-4567",
			Required:    false,
			Order:       2,
		},
		{
			Type:        question.TypeDropdown,
			Title:       "Subject",
			Description: "What is your reason for contacting us?",
			Required:    true,
			Order:       3,
			Options: map[string]interface{}{
				"items": []string{"Support", "Sales", "Partnership", "Other"},
			},
		},
		{
			Type:        question.TypeTextarea,
			Title:       "Message",
			Description: "Tell us more details",
			Placeholder: "Write your message here...",
			Required:    true,
			Order:       4,
		},
	}

	for _, q := range questions {
		create := c.ORM.Question.Create().
			SetType(q.Type).
			SetTitle(q.Title).
			SetDescription(q.Description).
			SetPlaceholder(q.Placeholder).
			SetRequired(q.Required).
			SetOrder(q.Order).
			SetFormID(contactForm.ID)

		if q.Options != nil {
			create.SetOptions(q.Options)
		}

		_, err := create.Save(ctx)
		if err != nil {
			fmt.Printf("❌ Failed to create question: %v\n", err)
			return
		}
	}
	fmt.Printf("✅ Added %d questions to contact form\n", len(questions))

	surveyForm, err := c.ORM.Form.
		Create().
		SetTitle("Customer Satisfaction Survey").
		SetDescription("Help us improve our service").
		SetSlug(fmt.Sprintf("customer-satisfaction-%d", time.Now().Unix())).
		SetPublished(true).
		SetOwner(u).
		Save(ctx)
	if err != nil {
		fmt.Printf("❌ Failed to create survey form: %v\n", err)
		return
	}
	fmt.Printf("✅ Created form: %s (published) - slug: %s\n", surveyForm.Title, surveyForm.Slug)

	surveyQuestions := []struct {
		Type        question.Type
		Title       string
		Description string
		Required    bool
		Order       int
		Options     map[string]interface{}
	}{
		{
			Type:        question.TypeRadio,
			Title:       "How satisfied are you with our service?",
			Description: "Please rate your overall experience",
			Required:    true,
			Order:       0,
			Options: map[string]interface{}{
				"items": []string{"Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"},
			},
		},
		{
			Type:        question.TypeCheckbox,
			Title:       "Which features do you use most?",
			Description: "Select all that apply",
			Required:    false,
			Order:       1,
			Options: map[string]interface{}{
				"items": []string{"Form Builder", "Analytics", "Integrations", "Custom Branding", "Export Data"},
			},
		},
		{
			Type:        question.TypeNumber,
			Title:       "How likely are you to recommend us? (0-10)",
			Description: "0 = Not at all likely, 10 = Extremely likely",
			Required:    true,
			Order:       2,
		},
		{
			Type:        question.TypeTextarea,
			Title:       "Any additional feedback?",
			Description: "We'd love to hear your suggestions",
			Required:    false,
			Order:       3,
		},
	}

	for _, q := range surveyQuestions {
		create := c.ORM.Question.Create().
			SetType(q.Type).
			SetTitle(q.Title).
			SetDescription(q.Description).
			SetRequired(q.Required).
			SetOrder(q.Order).
			SetFormID(surveyForm.ID)

		if q.Options != nil {
			create.SetOptions(q.Options)
		}

		_, err := create.Save(ctx)
		if err != nil {
			fmt.Printf("❌ Failed to create question: %v\n", err)
			return
		}
	}
	fmt.Printf("✅ Added %d questions to survey form\n", len(surveyQuestions))

	draftForm, err := c.ORM.Form.
		Create().
		SetTitle("Event Registration (Draft)").
		SetDescription("Register for our upcoming event").
		SetSlug(fmt.Sprintf("event-registration-%d", time.Now().Unix())).
		SetPublished(false).
		SetOwner(u).
		Save(ctx)
	if err != nil {
		fmt.Printf("❌ Failed to create draft form: %v\n", err)
		return
	}
	fmt.Printf("✅ Created form: %s (draft)\n", draftForm.Title)

	fmt.Println("\n🎉 Database seeded successfully!")
	fmt.Println("\n📋 Forms created:")
	fmt.Printf("   • Contact Us: /%s\n", contactForm.Slug)
	fmt.Printf("   • Customer Satisfaction: /%s\n", surveyForm.Slug)
	fmt.Printf("   • Event Registration: (draft, not publicly accessible)\n")
	fmt.Println("\n👤 Login credentials:")
	fmt.Printf("   Email: %s\n", u.Email)
	fmt.Printf("   Password: password123\n")
	fmt.Println("")
}
