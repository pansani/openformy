package handlers

import (
	"context"
	"fmt"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuth__RegisterWithLogo(t *testing.T) {
	email := fmt.Sprintf("logotest%d@example.com", randomInt())

	testUser, err := c.ORM.User.Create().
		SetEmail(email).
		SetName("Logo Test User").
		SetPassword("password123").
		SetLogo("/files/logos/test-logo.png").
		SetVerified(true).
		Save(context.Background())
	require.NoError(t, err)

	assert.NotEmpty(t, testUser.Logo)
	assert.True(t, strings.HasPrefix(testUser.Logo, "/files/logos/"))
	assert.True(t, strings.HasSuffix(testUser.Logo, "test-logo.png"))
}

func TestAuth__RegisterWithoutLogo(t *testing.T) {
	email := fmt.Sprintf("nologotest%d@example.com", randomInt())

	testUser, err := c.ORM.User.Create().
		SetEmail(email).
		SetName("No Logo User").
		SetPassword("password123").
		SetVerified(true).
		Save(context.Background())
	require.NoError(t, err)

	assert.Empty(t, testUser.Logo)
}
