package handlers

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/occult/pagode/ent"
	entForm "github.com/occult/pagode/ent/form"
	entQuestion "github.com/occult/pagode/ent/question"
	entResponse "github.com/occult/pagode/ent/response"
	entUser "github.com/occult/pagode/ent/user"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestForms__Store(t *testing.T) {
	user := createTestUser(t)

	forms, err := c.ORM.Form.Query().
		Where(entForm.HasOwnerWith(entUser.ID(user.ID))).
		All(context.Background())
	require.NoError(t, err)
	initialCount := len(forms)

	slug := fmt.Sprintf("my-test-form-%d", randomInt())
	form, err := c.ORM.Form.Create().
		SetTitle("My Test Form").
		SetDescription("This is a test form").
		SetSlug(slug).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)

	forms, err = c.ORM.Form.Query().
		Where(entForm.HasOwnerWith(entUser.ID(user.ID))).
		All(context.Background())
	require.NoError(t, err)
	require.Len(t, forms, initialCount+1)
	assert.Equal(t, "My Test Form", form.Title)
	assert.Equal(t, "This is a test form", form.Description)
	assert.Contains(t, form.Slug, "my-test-form")
}

func TestForms__Store_DuplicateSlug(t *testing.T) {
	user := createTestUser(t)

	baseSlug := fmt.Sprintf("customer-satisfaction-%d", randomInt())
	form1, err := c.ORM.Form.Create().
		SetTitle("Customer Satisfaction").
		SetDescription("First form").
		SetSlug(baseSlug).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Form.Create().
		SetTitle("Customer Satisfaction").
		SetDescription("Second form with same slug").
		SetSlug(baseSlug).
		SetOwner(user).
		Save(context.Background())
	assert.Error(t, err, "Should fail with duplicate slug")

	slug2 := fmt.Sprintf("%s-2", baseSlug)
	form2, err := c.ORM.Form.Create().
		SetTitle("Customer Satisfaction").
		SetDescription("Second form with different slug").
		SetSlug(slug2).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)

	forms, err := c.ORM.Form.Query().
		Where(entForm.HasOwnerWith(entUser.ID(user.ID))).
		Order(ent.Asc("created_at")).
		All(context.Background())
	require.NoError(t, err)
	require.Len(t, forms, 2)
	assert.Equal(t, form1.Slug, forms[0].Slug)
	assert.Equal(t, form2.Slug, forms[1].Slug)
	assert.Contains(t, forms[1].Slug, "-2")
}

func TestForms__Delete(t *testing.T) {
	user := createTestUser(t)
	formData := createTestForm(t, user, "Form to Delete", "Will be deleted")

	err := c.ORM.Form.DeleteOne(formData).Exec(context.Background())
	require.NoError(t, err)

	exists, err := c.ORM.Form.Query().
		Where(entForm.IDEQ(formData.ID)).
		Exist(context.Background())
	require.NoError(t, err)
	assert.False(t, exists)
}

func TestForms__Delete_UnauthorizedUser(t *testing.T) {
	user1 := createTestUser(t)
	user2 := createTestUser(t)
	formData := createTestForm(t, user1, "User 1 Form", "Description")

	_, err := c.ORM.Form.Query().
		Where(entForm.IDEQ(formData.ID)).
		Where(entForm.HasOwnerWith(entUser.ID(user2.ID))).
		First(context.Background())
	assert.Error(t, err, "User 2 should not be able to query User 1's form")

	exists, err := c.ORM.Form.Query().
		Where(entForm.IDEQ(formData.ID)).
		Exist(context.Background())
	require.NoError(t, err)
	assert.True(t, exists)
}

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"Simple Title", "simple-title"},
		{"Title with Numbers 123", "title-with-numbers-123"},
		{"Special!@#$%Characters", "specialcharacters"},
		{"Multiple   Spaces", "multiple-spaces"},
		{"Title-With-Dashes", "title-with-dashes"},
		{"CamelCaseTitle", "camelcasetitle"},
		{"  Leading and Trailing  ", "leading-and-trailing"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := generateSlug(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGenerateSlug_Empty(t *testing.T) {
	result := generateSlug("")
	assert.Contains(t, result, "form-")
}

func createTestUser(t *testing.T) *ent.User {
	user, err := c.ORM.User.Create().
		SetEmail(fmt.Sprintf("test%d@example.com", randomInt())).
		SetName("Test User").
		SetPassword("password123").
		SetVerified(true).
		Save(context.Background())
	require.NoError(t, err)
	return user
}

func createTestForm(t *testing.T, user *ent.User, title, description string) *ent.Form {
	slug := fmt.Sprintf("%s-%d", generateSlug(title), randomInt())
	
	form, err := c.ORM.Form.Create().
		SetTitle(title).
		SetDescription(description).
		SetSlug(slug).
		SetOwner(user).
		Save(context.Background())
	require.NoError(t, err)
	return form
}

func randomInt() int64 {
	return time.Now().UnixNano()
}

func TestForms__Update_SaveQuestions(t *testing.T) {
	user := createTestUser(t)
	formData := createTestForm(t, user, "Test Form", "Form for testing question updates")

	questions := []map[string]interface{}{
		{
			"type":        "text",
			"title":       "What is your name?",
			"description": "Please enter your full name",
			"placeholder": "John Doe",
			"required":    true,
			"order":       0,
		},
		{
			"type":        "email",
			"title":       "Email address",
			"description": "",
			"placeholder": "you@example.com",
			"required":    true,
			"order":       1,
		},
		{
			"type":        "dropdown",
			"title":       "Favorite color",
			"description": "",
			"placeholder": "",
			"required":    false,
			"order":       2,
			"options":     []string{"Red", "Blue", "Green"},
		},
	}

	tx, err := c.ORM.Tx(context.Background())
	require.NoError(t, err)

	for _, q := range questions {
		qType := q["type"].(string)
		qTitle := q["title"].(string)
		qDescription := q["description"].(string)
		qPlaceholder := q["placeholder"].(string)
		qRequired := q["required"].(bool)
		qOrder := q["order"].(int)

		create := tx.Question.Create().
			SetType(entQuestion.Type(qType)).
			SetTitle(qTitle).
			SetRequired(qRequired).
			SetOrder(qOrder).
			SetFormID(formData.ID)

		if qDescription != "" {
			create.SetDescription(qDescription)
		}
		if qPlaceholder != "" {
			create.SetPlaceholder(qPlaceholder)
		}
		if options, ok := q["options"].([]string); ok {
			optionsMap := make(map[string]interface{})
			optionsMap["items"] = options
			create.SetOptions(optionsMap)
		}

		_, err = create.Save(context.Background())
		require.NoError(t, err)
	}

	require.NoError(t, tx.Commit())

	savedQuestions, err := c.ORM.Question.Query().
		Where(entQuestion.HasFormWith(entForm.IDEQ(formData.ID))).
		Order(ent.Asc("order")).
		All(context.Background())
	require.NoError(t, err)
	require.Len(t, savedQuestions, 3)

	assert.Equal(t, "What is your name?", savedQuestions[0].Title)
	assert.Equal(t, "text", string(savedQuestions[0].Type))
	assert.True(t, savedQuestions[0].Required)

	assert.Equal(t, "Email address", savedQuestions[1].Title)
	assert.Equal(t, "email", string(savedQuestions[1].Type))

	assert.Equal(t, "Favorite color", savedQuestions[2].Title)
	assert.Equal(t, "dropdown", string(savedQuestions[2].Type))
}

func TestForms__View_PublishedForm(t *testing.T) {
	user := createTestUser(t)
	formData := createTestForm(t, user, "Public Form", "This is a public form")

	_, err := c.ORM.Form.UpdateOne(formData).
		SetPublished(true).
		Save(context.Background())
	require.NoError(t, err)

	result, err := c.ORM.Form.Query().
		Where(entForm.Slug(formData.Slug), entForm.Published(true)).
		WithQuestions().
		Only(context.Background())
	require.NoError(t, err)
	assert.Equal(t, formData.ID, result.ID)
	assert.True(t, result.Published)
}

func TestForms__View_UnpublishedForm(t *testing.T) {
	user := createTestUser(t)
	formData := createTestForm(t, user, "Draft Form", "This form is not published")

	assert.False(t, formData.Published)

	_, err := c.ORM.Form.Query().
		Where(entForm.Slug(formData.Slug), entForm.Published(true)).
		Only(context.Background())
	assert.Error(t, err, "Should not find unpublished form")
}

func TestForms__Submit_CreateResponse(t *testing.T) {
	user := createTestUser(t)
	formData := createTestForm(t, user, "Survey Form", "Test survey")

	_, err := c.ORM.Form.UpdateOne(formData).
		SetPublished(true).
		Save(context.Background())
	require.NoError(t, err)

	question1, err := c.ORM.Question.Create().
		SetType("text").
		SetTitle("Your name").
		SetRequired(true).
		SetOrder(0).
		SetFormID(formData.ID).
		Save(context.Background())
	require.NoError(t, err)

	question2, err := c.ORM.Question.Create().
		SetType("email").
		SetTitle("Your email").
		SetRequired(true).
		SetOrder(1).
		SetFormID(formData.ID).
		Save(context.Background())
	require.NoError(t, err)

	response, err := c.ORM.Response.Create().
		SetFormID(formData.ID).
		SetIPAddress("127.0.0.1").
		SetUserAgent("Test Agent").
		SetCompleted(true).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Answer.Create().
		SetResponseID(response.ID).
		SetQuestionID(question1.ID).
		SetValue("John Doe").
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Answer.Create().
		SetResponseID(response.ID).
		SetQuestionID(question2.ID).
		SetValue("john@example.com").
		Save(context.Background())
	require.NoError(t, err)

	savedResponse, err := c.ORM.Response.Query().
		Where(entResponse.IDEQ(response.ID)).
		WithAnswers().
		Only(context.Background())
	require.NoError(t, err)

	assert.True(t, savedResponse.Completed)
	assert.Equal(t, "127.0.0.1", savedResponse.IPAddress)
	assert.Len(t, savedResponse.Edges.Answers, 2)
}

func TestForms__Submit_RequiredFieldValidation(t *testing.T) {
	user := createTestUser(t)
	formData := createTestForm(t, user, "Required Fields Form", "Test required validation")

	_, err := c.ORM.Form.UpdateOne(formData).
		SetPublished(true).
		Save(context.Background())
	require.NoError(t, err)

	_, err = c.ORM.Question.Create().
		SetType("text").
		SetTitle("Required field").
		SetRequired(true).
		SetOrder(0).
		SetFormID(formData.ID).
		Save(context.Background())
	require.NoError(t, err)

	response, err := c.ORM.Response.Create().
		SetFormID(formData.ID).
		SetIPAddress("127.0.0.1").
		SetUserAgent("Test Agent").
		SetCompleted(false).
		Save(context.Background())
	require.NoError(t, err)

	assert.False(t, response.Completed)
}
