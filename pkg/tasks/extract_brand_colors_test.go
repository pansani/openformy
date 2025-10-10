package tasks

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/occult/pagode/config"
	"github.com/occult/pagode/pkg/services"
	"github.com/occult/pagode/pkg/tests"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/subosito/gotenv"
)

func init() {
	_ = gotenv.Load("../../.env")
}


func TestExtractBrandColors_NoWebsiteURL(t *testing.T) {
	config.SwitchEnvironment(config.EnvTest)
	c := services.NewContainer()
	defer c.Shutdown()

	ctx := context.Background()

	u, err := tests.CreateUser(c.ORM)
	require.NoError(t, err)

	payload := map[string]interface{}{
		"user_id": float64(u.ID),
	}

	handler := ExtractBrandColors(c.ORM, c.Config.OpenAI.ApiKey)
	err = handler(ctx, payload)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "no website URL")
}

func TestExtractBrandColors_InvalidPayload(t *testing.T) {
	config.SwitchEnvironment(config.EnvTest)
	c := services.NewContainer()
	defer c.Shutdown()

	ctx := context.Background()

	payload := map[string]interface{}{
		"user_id": "invalid",
	}

	handler := ExtractBrandColors(c.ORM, c.Config.OpenAI.ApiKey)
	err := handler(ctx, payload)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid user_id")
}

func TestExtractBrandColorsPayload_Marshal(t *testing.T) {
	payload := ExtractBrandColorsPayload{
		UserID: 123,
	}

	data, err := json.Marshal(payload)
	require.NoError(t, err)

	var result map[string]interface{}
	err = json.Unmarshal(data, &result)
	require.NoError(t, err)

	assert.Equal(t, float64(123), result["user_id"])
}
