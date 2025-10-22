package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"log/slog"
	"math/rand"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strings"

	entsql "entgo.io/ent/dialect/sql"
	"entgo.io/ent/entc"
	"entgo.io/ent/entc/gen"
	"github.com/occult/pagode/ent/migrate"
	_ "github.com/go-sql-driver/mysql"
	"github.com/labstack/echo/v4"
	_ "github.com/mattn/go-sqlite3"
	"github.com/mikestefanello/backlite"
	"github.com/occult/pagode/config"
	"github.com/occult/pagode/ent"
	"github.com/occult/pagode/pkg/i18n"
	inertia "github.com/romsar/gonertia/v2"
	"github.com/spf13/afero"

	// Required by ent.
	_ "github.com/occult/pagode/ent/runtime"
)

// Container contains all services used by the application and provides an easy way to handle dependency
// injection including within tests.
type Container struct {
	// Validator stores a validator
	Validator *Validator

	// Web stores the web framework.
	Web *echo.Echo

	// Config stores the application configuration.
	Config *config.Config

	// Cache contains the cache client.
	Cache *CacheClient

	// Database stores the connection to the database.
	Database *sql.DB

	// Files stores the file system.
	Files FileStorage

	// ORM stores a client to the ORM.
	ORM *ent.Client

	// Graph is the entity graph defined by your Ent schema.
	Graph *gen.Graph

	// Mail stores an email sending client.
	Mail *MailClient

	// Auth stores an authentication client.
	Auth *AuthClient

	// Tasks stores the task client.
	Tasks *backlite.Client

	// Jobs stores the job worker.
	Jobs *JobWorker

	// Payment stores the payment client.
	Payment *PaymentClient

	// Inertia for React
	Inertia *inertia.Inertia

	// I18n stores the translation service.
	I18n *i18n.Translator
}

// NewContainer creates and initializes a new Container.
func NewContainer() *Container {
	c := new(Container)
	c.initConfig()
	c.initValidator()
	c.initWeb()
	c.initCache()
	c.initDatabase()
	c.initFiles()
	c.initORM()
	c.initAuth()
	c.initMail()
	c.initTasks()
	c.initJobs()
	c.initPayment()
	c.initI18n()
	c.initInertia()
	return c
}

// Shutdown gracefully shuts the Container down and disconnects all connections.
func (c *Container) Shutdown() error {
	// Shutdown the web server.
	webCtx, webCancel := context.WithTimeout(context.Background(), c.Config.HTTP.ShutdownTimeout)
	defer webCancel()
	if err := c.Web.Shutdown(webCtx); err != nil {
		return err
	}

	// Shutdown the task runner.
	// TODO: Tasks disabled for MySQL
	// taskCtx, taskCancel := context.WithTimeout(context.Background(), c.Config.Tasks.ShutdownTimeout)
	// defer taskCancel()
	// c.Tasks.Stop(taskCtx)

	// Shutdown the job worker.
	if c.Jobs != nil {
		c.Jobs.Stop()
	}

	// Shutdown the ORM.
	if err := c.ORM.Close(); err != nil {
		return err
	}

	// Shutdown the database.
	if err := c.Database.Close(); err != nil {
		return err
	}

	// Shutdown the cache.
	c.Cache.Close()

	return nil
}

// initConfig initializes configuration.
func (c *Container) initConfig() {
	cfg, err := config.GetConfig()
	if err != nil {
		panic(fmt.Sprintf("failed to load config: %v", err))
	}
	c.Config = &cfg

	if portEnv := os.Getenv("PORT"); portEnv != "" {
		var portInt int
		_, err := fmt.Sscanf(portEnv, "%d", &portInt)
		if err == nil && portInt > 0 && portInt <= 65535 {
			c.Config.HTTP.Port = uint16(portInt)
			fmt.Printf("🔌 Using port from environment: %d\n", portInt)
		} else {
			fmt.Printf("⚠️ Invalid PORT env value: %s\n", portEnv)
		}
	}

	// Configure logging.
	switch cfg.App.Environment {
	case config.EnvProduction:
		slog.SetLogLoggerLevel(slog.LevelInfo)
	default:
		slog.SetLogLoggerLevel(slog.LevelDebug)
	}
}

// initValidator initializes the validator.
func (c *Container) initValidator() {
	c.Validator = NewValidator()
}

// initWeb initializes the web framework.
func (c *Container) initWeb() {
	c.Web = echo.New()
	c.Web.HideBanner = true
	c.Web.Validator = c.Validator
}

// initCache initializes the cache.
func (c *Container) initCache() {
	store, err := newInMemoryCache(c.Config.Cache.Capacity)
	if err != nil {
		panic(err)
	}

	c.Cache = NewCacheClient(store)
}

// initDatabase initializes the database.
func (c *Container) initDatabase() {
	var err error
	var connection string

	switch c.Config.App.Environment {
	case config.EnvTest:
		connection = buildConnectionString(c.Config.Database, true)
	default:
		connection = c.Config.Database.Connection
		if connection == "" {
			connection = buildConnectionString(c.Config.Database, false)
		}
	}

	driver := c.Config.Database.Driver

	c.Database, err = openDB(driver, connection)
	if err != nil {
		panic(err)
	}
}

// initFiles initializes the file system.
func (c *Container) initFiles() {
	// Use in-memory storage for tests.
	if c.Config.App.Environment == config.EnvTest {
		c.Files = &LocalStorage{Fs: afero.NewMemMapFs()}
		return
	}

	// Check if S3 is configured
	if c.Config.Files.Driver == "s3" {
		s3Storage, err := NewS3Storage(c.Config.Files.S3)
		if err != nil {
			panic(fmt.Sprintf("failed to initialize S3 storage: %v", err))
		}
		c.Files = s3Storage
		return
	}

	// Default to local file system
	fs := afero.NewOsFs()
	if err := fs.MkdirAll(c.Config.Files.Directory, 0755); err != nil {
		panic(err)
	}
	c.Files = &LocalStorage{Fs: afero.NewBasePathFs(fs, c.Config.Files.Directory)}
}

// initORM initializes the ORM.
func (c *Container) initORM() {
	driver := c.Config.Database.Driver

	drv := entsql.OpenDB(driver, c.Database)
	c.ORM = ent.NewClient(ent.Driver(drv))

	// Run the auto migration tool.
	if err := c.ORM.Schema.Create(context.Background(), migrate.WithDropColumn(true)); err != nil {
		panic(err)
	}

	// Load the graph.
	_, b, _, _ := runtime.Caller(0)
	d := path.Join(path.Dir(b))
	p := filepath.Join(filepath.Dir(d), "../ent/schema")
	g, err := entc.LoadGraph(p, &gen.Config{})
	if err != nil {
		panic(err)
	}
	c.Graph = g
}

// initAuth initializes the authentication client.
func (c *Container) initAuth() {
	c.Auth = NewAuthClient(c.Config, c.ORM)
}

// initMail initialize the mail client.
func (c *Container) initMail() {
	var err error
	c.Mail, err = NewMailClient(c.Config)
	if err != nil {
		panic(fmt.Sprintf("failed to create mail client: %v", err))
	}
}

// initTasks initializes the task client.
func (c *Container) initTasks() {
	// TODO: Backlite only supports SQLite, disabled for MySQL
	// var err error
	// c.Tasks, err = backlite.NewClient(backlite.ClientConfig{
	// 	DB:              c.Database,
	// 	Logger:          log.Default(),
	// 	NumWorkers:      c.Config.Tasks.Goroutines,
	// 	ReleaseAfter:    c.Config.Tasks.ReleaseAfter,
	// 	CleanupInterval: c.Config.Tasks.CleanupInterval,
	// })
	// if err != nil {
	// 	panic(fmt.Sprintf("failed to create task client: %v", err))
	// }
	//
	// if err = c.Tasks.Install(); err != nil {
	// 	panic(fmt.Sprintf("failed to install task schema: %v", err))
	// }
}

// initJobs initializes the job worker.
func (c *Container) initJobs() {
	c.Jobs = NewJobWorker(c.ORM)
	c.Jobs.Start()
}

// initPayment initializes the payment client.
func (c *Container) initPayment() {
	var provider PaymentProvider

	switch c.Config.Payment.Provider {
	case "stripe":
		provider = NewStripeProvider(c.Config)
	default:
		panic(fmt.Sprintf("unsupported payment provider: %s", c.Config.Payment.Provider))
	}

	c.Payment = NewPaymentClient(c.Config, c.ORM, provider)
}

func ProjectRoot() string {
	currentDir, err := os.Getwd()
	if err != nil {
		return ""
	}

	for {
		_, err := os.ReadFile(filepath.Join(currentDir, "go.mod"))
		if os.IsNotExist(err) {
			if currentDir == filepath.Dir(currentDir) {
				return ""
			}
			currentDir = filepath.Dir(currentDir)
			continue
		} else if err != nil {
			return ""
		}
		break
	}
	return currentDir
}

func (c *Container) getInertia() *inertia.Inertia {
	rootDir := ProjectRoot()
	viteHotFile := filepath.Join(rootDir, "public", "hot")
	rootViewFile := filepath.Join(rootDir, "resources", "views", "root.html")
	manifestPath := filepath.Join(rootDir, "public", "build", "manifest.json")
	viteManifestPath := filepath.Join(rootDir, "public", "build", ".vite", "manifest.json")

	// check if laravel-vite-plugin is running in dev mode (it puts a "hot" file in the public folder)
	url, err := viteHotFileUrl(viteHotFile)
	if err != nil {
		panic(err)
	}
	if url != "" {
		i, err := inertia.NewFromFile(
			rootViewFile,
		)
		if err != nil {
			panic(err)
		}

		i.ShareTemplateFunc("vite", func(entry string) (template.HTML, error) {
			if entry != "" && !strings.HasPrefix(entry, "/") {
				entry = "/" + entry
			}
			htmlTag := fmt.Sprintf(`<script type="module" src="%s%s"></script>`, url, entry)
			return template.HTML(htmlTag), nil
		})
		i.ShareTemplateFunc("viteReactRefresh", viteReactRefresh(url))

		return i
	}

	// laravel-vite-plugin not running in dev mode, use build manifest file
	// check if the manifest file exists, if not, rename it
	if _, err := os.Stat(manifestPath); os.IsNotExist(err) {
		// move the manifest from ./public/build/.vite/manifest.json to ./public/build/manifest.json
		// so that the vite function can find it
		if err := os.Rename(viteManifestPath, manifestPath); err != nil {
			panic(fmt.Errorf("inertia build manifest file not found: %w", err))
		}
	}

	i, err := inertia.NewFromFile(
		rootViewFile,
		inertia.WithVersionFromFile(manifestPath),
	)
	if err != nil {
		panic(err)
	}

	i.ShareTemplateFunc("vite", vite(manifestPath, "/build/"))
	i.ShareTemplateFunc("viteReactRefresh", viteReactRefresh(url))

	return i
}

func (c *Container) initI18n() {
	var err error
	c.I18n, err = i18n.NewTranslator(&c.Config.I18n)
	if err != nil {
		panic(fmt.Sprintf("failed to initialize i18n: %v", err))
	}
}

func (c *Container) initInertia() {
	c.Inertia = c.getInertia()
}

func vite(manifestPath, buildDir string) func(path string) (template.HTML, error) {
	f, err := os.Open(manifestPath)
	if err != nil {
		panic(err)
	}
	defer f.Close()

	viteAssets := make(map[string]*struct {
		File   string   `json:"file"`
		Source string   `json:"src"`
		CSS    []string `json:"css"`
	})
	err = json.NewDecoder(f).Decode(&viteAssets)
	if err != nil {
		panic(err)
	}

	return func(p string) (template.HTML, error) {
		if val, ok := viteAssets[p]; ok {
			cssLinks := ""
			for _, css := range val.CSS {
				cssLinks += fmt.Sprintf(`<link rel="stylesheet" href="%s%s">`, buildDir, css)
			}
			htmlTag := fmt.Sprintf(
				`%s<script type="module" src="%s%s"></script>`,
				cssLinks,
				buildDir,
				val.File,
			)
			return template.HTML(htmlTag), nil
		}
		return "", fmt.Errorf("asset %q not found", p)
	}
}

// buildConnectionString builds a database connection string from individual components.
func buildConnectionString(cfg config.DatabaseConfig, isTest bool) string {
	switch cfg.Driver {
	case "mysql":
		dbName := cfg.Database
		if isTest {
			dbName = fmt.Sprintf("%s_test", cfg.Database)
		}
		return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&charset=utf8mb4",
			cfg.Username,
			cfg.Password,
			cfg.Host,
			cfg.Port,
			dbName,
		)
	case "sqlite3":
		// For SQLite, use the legacy connection string
		return cfg.Connection
	default:
		return cfg.Connection
	}
}

// openDB opens a database connection.
func openDB(driver, connection string) (*sql.DB, error) {
	if driver == "sqlite3" {
		// Helper to automatically create the directories that the specified sqlite file
		// should reside in, if one.
		d := strings.Split(connection, "/")
		if len(d) > 1 {
			dirpath := strings.Join(d[:len(d)-1], "/")

			if err := os.MkdirAll(dirpath, 0755); err != nil {
				return nil, err
			}
		}

		// Check if a random value is required, which is often used for in-memory test databases.
		if strings.Contains(connection, "$RAND") {
			connection = strings.Replace(connection, "$RAND", fmt.Sprint(rand.Int()), 1)
		}
	}

	if driver == "mysql" {
		// Check if a random value is required for test databases.
		if strings.Contains(connection, "$RAND") {
			connection = strings.Replace(connection, "$RAND", fmt.Sprint(rand.Int()), 1)
		}
	}

	return sql.Open(driver, connection)
}

// viteHotFileUrl Get the vite hot file url
func viteHotFileUrl(viteHotFile string) (string, error) {
	_, err := os.Stat(viteHotFile)
	if err != nil {
		return "", nil
	}
	content, err := os.ReadFile(viteHotFile)
	if err != nil {
		return "", err
	}
	url := strings.TrimSpace(string(content))
	if strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://") {
		url = url[strings.Index(url, ":")+1:]
	} else {
		url = "//localhost:1323"
	}
	return url, nil
}

// viteReactRefresh Generate React refresh runtime script
func viteReactRefresh(url string) func() (template.HTML, error) {
	return func() (template.HTML, error) {
		if url == "" {
			return "", nil
		}
		script := fmt.Sprintf(`
<script type="module">
    import RefreshRuntime from '%s/@react-refresh'
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
</script>`, url)

		return template.HTML(script), nil
	}
}
