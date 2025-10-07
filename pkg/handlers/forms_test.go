package handlers

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/occult/pagode/ent"
	entForm "github.com/occult/pagode/ent/form"
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
