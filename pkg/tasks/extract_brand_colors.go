package tasks

import (
	"bytes"
	"context"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"time"

	"github.com/cenkalti/dominantcolor"
	"github.com/chromedp/chromedp"
	"github.com/occult/pagode/ent"
	"github.com/occult/pagode/ent/user"
	"github.com/occult/pagode/pkg/log"
)

type ExtractBrandColorsPayload struct {
	UserID int `json:"user_id"`
}

func ExtractBrandColors(orm *ent.Client) func(ctx context.Context, payload map[string]interface{}) error {
	return func(ctx context.Context, payload map[string]interface{}) error {
		userID, ok := payload["user_id"].(float64)
		if !ok {
			return fmt.Errorf("invalid user_id in payload")
		}

		u, err := orm.User.Query().
			Where(user.ID(int(userID))).
			Only(ctx)
		if err != nil {
			return fmt.Errorf("failed to get user: %w", err)
		}

		if u.WebsiteURL == "" {
			return fmt.Errorf("user has no website URL")
		}

		err = orm.User.UpdateOne(u).
			SetBrandColorsStatus(user.BrandColorsStatusProcessing).
			Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to update status: %w", err)
		}

		colors, err := extractColorsFromWebsite(ctx, u.WebsiteURL)
		if err != nil {
			orm.User.UpdateOne(u).
				SetBrandColorsStatus(user.BrandColorsStatusFailed).
				Exec(context.Background())
			return fmt.Errorf("failed to extract colors: %w", err)
		}

		update := orm.User.UpdateOne(u).
			SetBrandColorsStatus(user.BrandColorsStatusCompleted)

		if len(colors) > 0 {
			update.SetBrandPrimaryColor(colors[0])
		}
		if len(colors) > 1 {
			update.SetBrandSecondaryColor(colors[1])
		}
		if len(colors) > 2 {
			update.SetBrandAccentColor(colors[2])
		}

		err = update.Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to save colors: %w", err)
		}

		log.Default().Info("Brand colors extracted", "user_id", u.ID, "colors", colors)
		return nil
	}
}

func extractColorsFromWebsite(ctx context.Context, url string) ([]string, error) {
	allocCtx, cancel := chromedp.NewContext(ctx)
	defer cancel()

	timeoutCtx, timeoutCancel := context.WithTimeout(allocCtx, 30*time.Second)
	defer timeoutCancel()

	var buf []byte
	err := chromedp.Run(timeoutCtx,
		chromedp.Navigate(url),
		chromedp.Sleep(2*time.Second),
		chromedp.FullScreenshot(&buf, 90),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to capture screenshot: %w", err)
	}

	img, _, err := image.Decode(bytes.NewReader(buf))
	if err != nil {
		return nil, fmt.Errorf("failed to decode screenshot: %w", err)
	}

	colors := make([]string, 0, 3)
	
	primaryColor := dominantcolor.Hex(dominantcolor.Find(img))
	colors = append(colors, primaryColor)

	if len(colors) >= 3 {
		return colors[:3], nil
	}

	return colors, nil
}
