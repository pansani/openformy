package tasks

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
	"github.com/occult/pagode/ent"
	"github.com/occult/pagode/ent/user"
	"github.com/occult/pagode/pkg/log"
	"github.com/sashabaranov/go-openai"
)

type ExtractBrandColorsPayload struct {
	UserID int `json:"user_id"`
}

type brandColorResponse struct {
	ButtonColor     string `json:"button_color"`
	BackgroundColor string `json:"background_color"`
	TextColor       string `json:"text_color"`
}

func ExtractBrandColors(orm *ent.Client, apiKey string) func(ctx context.Context, payload map[string]interface{}) error {
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

		colors, err := extractColorsFromWebsite(ctx, u.WebsiteURL, apiKey)
		if err != nil {
			orm.User.UpdateOne(u).
				SetBrandColorsStatus(user.BrandColorsStatusFailed).
				Exec(context.Background())
			return fmt.Errorf("failed to extract colors: %w", err)
		}

		update := orm.User.UpdateOne(u).
			SetBrandColorsStatus(user.BrandColorsStatusCompleted)

		if len(colors) > 0 {
			update.SetBrandButtonColor(colors[0])
		}
		if len(colors) > 1 {
			update.SetBrandBackgroundColor(colors[1])
		}
		if len(colors) > 2 {
			update.SetBrandTextColor(colors[2])
		}

		err = update.Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to save colors: %w", err)
		}

		log.Default().Info("Brand colors extracted", "user_id", u.ID, "colors", colors)
		return nil
	}
}

func extractColorsFromWebsite(ctx context.Context, url string, apiKey string) ([]string, error) {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.ExecPath("chromium"),
		chromedp.NoSandbox,
		chromedp.DisableGPU,
		chromedp.NoFirstRun,
		chromedp.NoDefaultBrowserCheck,
	)

	allocCtx, allocCancel := chromedp.NewExecAllocator(ctx, opts...)
	defer allocCancel()

	ctxWithChrome, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	timeoutCtx, timeoutCancel := context.WithTimeout(ctxWithChrome, 30*time.Second)
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

	base64Image := base64.StdEncoding.EncodeToString(buf)
	imageURL := fmt.Sprintf("data:image/png;base64,%s", base64Image)

	client := openai.NewClient(apiKey)

	resp, err := client.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: "gpt-4o",
			Messages: []openai.ChatCompletionMessage{
				{
					Role: openai.ChatMessageRoleUser,
					MultiContent: []openai.ChatMessagePart{
						{
							Type: openai.ChatMessagePartTypeText,
							Text: `Extract the brand colors from this website screenshot for SPECIFIC UI purposes:

Identify these FUNCTIONAL colors:

1. BUTTON_COLOR (button_color):
   - What color are the main CTA/action buttons? (e.g., "Sign Up", "Get Started", "Submit")
   - The most prominent clickable color
   - Example: Teal buttons → #78C5C4

2. BACKGROUND_COLOR (background_color):
   - What is the main brand background/surface color?
   - Can be white, black, or any color used as the primary backdrop
   - Example: White background → #FFFFFF

3. TEXT_COLOR (text_color):
   - What color is the text ON the buttons?
   - Needs to contrast with button_color
   - Example: White text on teal buttons → #FFFFFF

EXAMPLES:
- Teal buttons + white backgrounds + white text on buttons:
  {"button_color": "#78C5C4", "background_color": "#FFFFFF", "text_color": "#FFFFFF"}

- Blue buttons + black backgrounds + white text:
  {"button_color": "#0066FF", "background_color": "#000000", "text_color": "#FFFFFF"}

Return ONLY valid JSON: {"button_color": "#RRGGBB", "background_color": "#RRGGBB", "text_color": "#RRGGBB"}`,
						},
						{
							Type: openai.ChatMessagePartTypeImageURL,
							ImageURL: &openai.ChatMessageImageURL{
								URL: imageURL,
							},
						},
					},
				},
			},
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to call OpenAI API: %w", err)
	}

	var colorResponse brandColorResponse

	content := resp.Choices[0].Message.Content
	content = strings.TrimPrefix(content, "```json\n")
	content = strings.TrimPrefix(content, "```\n")
	content = strings.TrimSuffix(content, "\n```")
	content = strings.TrimSpace(content)

	err = json.Unmarshal([]byte(content), &colorResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to parse OpenAI response: %w", err)
	}

	colors := []string{colorResponse.ButtonColor, colorResponse.BackgroundColor, colorResponse.TextColor}
	return colors, nil
}

