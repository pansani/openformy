package handlers

import (
	"context"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestProfile__UpdateWithLogo(t *testing.T) {
	testUser := createTestUser(t)
	require.Empty(t, testUser.Logo)

	updatedUser, err := c.ORM.User.UpdateOne(testUser).
		SetLogo("/files/logos/profile-logo.png").
		Save(context.Background())
	require.NoError(t, err)

	assert.NotEmpty(t, updatedUser.Logo)
	assert.True(t, strings.HasPrefix(updatedUser.Logo, "/files/logos/"))
	assert.True(t, strings.HasSuffix(updatedUser.Logo, "profile-logo.png"))
}

func TestProfile__UpdateWithoutLogo(t *testing.T) {
	testUser := createTestUser(t)

	oldName := testUser.Name
	newName := "Updated Name"

	updatedUser, err := c.ORM.User.UpdateOne(testUser).
		SetName(newName).
		Save(context.Background())
	require.NoError(t, err)

	assert.Equal(t, newName, updatedUser.Name)
	assert.NotEqual(t, oldName, updatedUser.Name)
	assert.Empty(t, updatedUser.Logo)
}

func TestProfile__UpdateReplaceLogo(t *testing.T) {
	testUser := createTestUser(t)

	firstUser, err := c.ORM.User.UpdateOne(testUser).
		SetLogo("/files/logos/old-logo.png").
		Save(context.Background())
	require.NoError(t, err)
	require.NotEmpty(t, firstUser.Logo)

	updatedUser, err := c.ORM.User.UpdateOne(testUser).
		SetLogo("/files/logos/new-logo.png").
		Save(context.Background())
	require.NoError(t, err)

	assert.NotEmpty(t, updatedUser.Logo)
	assert.True(t, strings.HasSuffix(updatedUser.Logo, "new-logo.png"))
	assert.NotEqual(t, firstUser.Logo, updatedUser.Logo)
}
