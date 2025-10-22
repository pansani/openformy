package i18n

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/occult/pagode/config"
)

type Translator struct {
	translations map[string]map[string]string
	config       *config.I18nConfig
	mu           sync.RWMutex
}

func NewTranslator(cfg *config.I18nConfig) (*Translator, error) {
	t := &Translator{
		translations: make(map[string]map[string]string),
		config:       cfg,
	}

	if err := t.loadTranslations(); err != nil {
		return nil, err
	}

	return t, nil
}

func (t *Translator) loadTranslations() error {
	for _, lang := range t.config.SupportedLanguages {
		searchPaths := []string{
			filepath.Join("locales", fmt.Sprintf("%s.json", lang)),
			filepath.Join("..", "locales", fmt.Sprintf("%s.json", lang)),
			filepath.Join("..", "..", "locales", fmt.Sprintf("%s.json", lang)),
			filepath.Join("..", "..", "..", "locales", fmt.Sprintf("%s.json", lang)),
		}
		
		var data []byte
		var err error
		found := false
		
		for _, filePath := range searchPaths {
			data, err = os.ReadFile(filePath)
			if err == nil {
				found = true
				break
			}
		}
		
		if !found {
			t.mu.Lock()
			t.translations[lang] = make(map[string]string)
			t.mu.Unlock()
			continue
		}

		var translations map[string]string
		if err := json.Unmarshal(data, &translations); err != nil {
			return fmt.Errorf("failed to parse translation file for %s: %w", lang, err)
		}

		t.mu.Lock()
		t.translations[lang] = translations
		t.mu.Unlock()
	}

	return nil
}

func (t *Translator) Translate(lang, key string) string {
	t.mu.RLock()
	defer t.mu.RUnlock()

	if langTranslations, ok := t.translations[lang]; ok {
		if translation, ok := langTranslations[key]; ok {
			return translation
		}
	}

	if lang != t.config.DefaultLanguage {
		if defaultTranslations, ok := t.translations[t.config.DefaultLanguage]; ok {
			if translation, ok := defaultTranslations[key]; ok {
				return translation
			}
		}
	}

	return key
}

func (t *Translator) TranslateWithArgs(lang, key string, args ...interface{}) string {
	translation := t.Translate(lang, key)
	return fmt.Sprintf(translation, args...)
}

func (t *Translator) GetSupportedLanguages() []string {
	return t.config.SupportedLanguages
}

func (t *Translator) GetDefaultLanguage() string {
	return t.config.DefaultLanguage
}

func (t *Translator) IsLanguageSupported(lang string) bool {
	for _, supportedLang := range t.config.SupportedLanguages {
		if supportedLang == lang {
			return true
		}
	}
	return false
}
