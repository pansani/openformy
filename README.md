# OpenForm

**Open-source form builder inspired by Typeform - beautiful, conversational forms made simple.**

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Built with Go](https://img.shields.io/badge/Made%20with-Go-1f425f.svg)
![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb.svg)

---

## About OpenForm

OpenForm is a modern, open-source alternative to Typeform and Google Forms. Built on the powerful [Pagode](https://pagode.dev) framework, it combines the speed and type-safety of Go with the flexibility of React to deliver beautiful, engaging forms.

### Key Features

- 🎨 **Conversational & Traditional Modes** - Choose between one-question-at-a-time (Typeform-style) or traditional multi-field forms
- ⚡ **Lightning Fast** - Built on Go + Echo for blazing-fast performance
- 🔐 **Secure by Default** - Session-based authentication, CSRF protection, rate limiting
- 📊 **Response Analytics** - View, filter, and analyze form submissions with ease
- 🎯 **Rich Question Types** - Text, email, number, dropdown, checkboxes, date, file upload, and more
- 🌐 **Public Sharing** - Share forms via unique URLs with published/draft status control
- 💾 **Simple Database** - SQLite for easy setup and portability
- 🎭 **Auto-Generated Admin Panel** - Manage all entities through built-in admin interface
- 🔄 **Hot Reload Development** - Fast development workflow with Air

### Tech Stack

**Backend:**
- Go 1.24 with Echo v4 web framework
- Ent ORM for type-safe database operations
- SQLite with WAL mode for concurrent access
- InertiaJS for seamless frontend-backend communication

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS v4 for styling
- shadcn/ui component library
- Vite for blazing-fast builds

---

## Quick Start

### Prerequisites

- Go 1.24+
- Node.js 18+
- Make (optional but recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/pansani/openform.git
cd openform

# Install backend dependencies
go mod download

# Install frontend dependencies
npm install

# Generate Ent code
make ent-gen

# Run the application
make run
```

The application will be available at `http://localhost:8000`

### Development with Hot Reload

```bash
# Install Air (Go hot reload)
make air-install

# Start with hot reload
make watch
```

---

## Usage

### Creating Your First Form

1. **Register an account** at `/user/register`
2. **Create a form** - Click "New Form" from the dashboard
3. **Add questions** - Drag question types from the sidebar
4. **Choose display mode** - Toggle between Conversational and Traditional
5. **Publish** - Toggle the Published switch
6. **Share** - Copy the public form URL and share it

### Display Modes

**Traditional Mode:**
- All questions visible on one page
- Faster for short forms
- Familiar user experience

**Conversational Mode:**
- One question at a time
- Typeform-style experience
- More engaging for users
- Progress indicator and keyboard navigation

---

## Documentation

OpenForm is built on **Pagode**, a full-stack Go + React starter kit. For detailed documentation on the underlying framework:

- 📖 [Pagode Documentation](https://pagode.dev/)
- 🏗️ [Architecture Guide](https://pagode.dev/docs/intro)
- 🗄️ [Database & ORM](https://pagode.dev/docs/database-and-orm)
- 🔐 [Authentication](https://pagode.dev/docs/authentication)
- ⚙️ [Configuration](https://pagode.dev/docs/configuration)

### Project-Specific Documentation

- [ROADMAP.md](./ROADMAP.md) - Feature roadmap and development phases
- [CLAUDE.md](./CLAUDE.md) - Development guide and architecture notes

---

## Development Commands

```bash
# Run the application
make run

# Hot reload development
make watch

# Run tests
make test

# Generate Ent code (after schema changes)
make ent-gen

# Create new Ent entity
make ent-new name=EntityName

# Create admin user
make admin email=user@example.com
```

---

## Project Structure

```
openform/
├── cmd/                    # Application entry points
│   ├── web/               # Main web application
│   └── admin/             # Admin CLI tools
├── pkg/
│   ├── handlers/          # HTTP request handlers
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic & service container
│   └── routenames/        # Route name constants
├── ent/
│   └── schema/            # Database entity schemas
├── resources/
│   └── js/
│       ├── Pages/         # InertiaJS page components
│       ├── components/    # Reusable React components
│       ├── hooks/         # Custom React hooks
│       └── types/         # TypeScript type definitions
├── config/                # Configuration files
└── static/                # Static assets
```

---

## Testing

```bash
# Run all tests
make test

# Run E2E tests with Playwright
npm run test:e2e

# Run specific test
go test ./pkg/handlers -run TestForms
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Credits

OpenForm is built with and inspired by many amazing open-source projects:

### Core Framework
- [Pagode](https://pagode.dev/) - Full-stack Go + React starter kit

### Backend
- [Go](https://go.dev/) - Programming language
- [Echo](https://github.com/labstack/echo) - Web framework
- [Ent](https://github.com/ent/ent) - Entity framework & ORM
- [SQLite](https://sqlite.org/) - Database
- [Air](https://github.com/air-verse/air) - Hot reload
- [Backlite](https://github.com/mikestefanello/backlite) - Background job processing
- [Viper](https://github.com/spf13/viper) - Configuration management

### Frontend
- [React](https://react.dev/) - UI library
- [InertiaJS](https://inertiajs.com/) - SPA bridge (via [gonertia](https://github.com/romsar/gonertia))
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Vite](https://vitejs.dev/) - Build tool
- [Lucide](https://lucide.dev/) - Icons

### Inspiration
- [Typeform](https://www.typeform.com/) - Conversational form UX
- [ikiform](https://ikiform.com/) - AI-powered features concept

---

## Support

- 📚 [Documentation](https://pagode.dev/)
- 🐛 [Issue Tracker](https://github.com/pansani/openform/issues)
- 💬 [Discussions](https://github.com/pansani/openform/discussions)

---

**Built with ❤️ using [Pagode](https://pagode.dev/)**
