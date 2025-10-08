# OpenFormy - Roadmap

**Open-source form builder inspired by Typeform and ikiform**

> Start simple, iterate fast. Build a powerful, user-friendly form builder that's free and open-source.

## Vision
Create an open-source alternative to Typeform and Google Forms with a focus on beautiful design, conversational forms, and powerful analytics - all while keeping the codebase simple and maintainable.

---

## Phase 1: MVP - Basic Form Builder

**Goal:** Get a working form builder that users can create and fill out forms with.

### Backend
- [ ] Create `Form` Ent schema (title, description, user_id, published, created_at, updated_at)
- [ ] Create `Question` Ent schema (form_id, type, title, description, required, order)
- [ ] Create `Response` Ent schema (form_id, submitted_at, user_id nullable)
- [ ] Create `Answer` Ent schema (response_id, question_id, value)
- [ ] Form handler with CRUD routes
- [ ] Question handler with CRUD operations
- [ ] Response collection handler
- [ ] Public form view route (no auth required)

### Frontend
- [ ] Form list page (user's forms)
- [ ] Form builder page (add/edit/delete questions)
- [ ] Question types: Short Text, Email, Multiple Choice
- [ ] Traditional multi-field form renderer
- [ ] Form submission handling
- [ ] Simple responses list page

### Database
- Relations: User → Forms → Questions, Form → Responses → Answers

---

## Phase 2: Form Management & Sharing

**Goal:** Make forms shareable and manage responses effectively.

- [ ] Unique shareable URLs for published forms
- [ ] Form published/draft status toggle
- [ ] Form duplication
- [ ] Form deletion with confirmation
- [ ] Response viewing page with filters
- [ ] Response detail view
- [ ] Basic response statistics (total, completion rate)
- [ ] Delete individual responses

---

## Phase 3: Enhanced Question Types

**Goal:** Support more input types for richer data collection.

- [ ] Long Text (textarea)
- [ ] Number input
- [ ] Date picker
- [ ] Dropdown select
- [ ] Checkboxes (multi-select)
- [ ] Yes/No toggle
- [ ] File upload (leverage existing file upload system)
- [ ] Phone number
- [ ] URL input
- [ ] Question validation rules (min/max length, regex, etc)
- [ ] Placeholder text and help text for questions

---

## Phase 4: Conversational UI (Typeform-style)

**Goal:** Create the signature one-question-at-a-time experience.

- [ ] One-question-at-a-time renderer mode
- [ ] Smooth animations between questions
- [ ] Progress indicator (question X of Y)
- [ ] Keyboard navigation (Enter to advance, Backspace to go back)
- [ ] Mobile-optimized conversational UI
- [ ] Form settings: Choose traditional vs conversational mode
- [ ] Thank you screen after submission
- [ ] Auto-save partial responses (optional)

---

## Phase 5: Branding & Customization

**Goal:** Let users brand their forms to match their identity.

### Auto-Branding
- [ ] "Share your website" input field
- [ ] Fetch website metadata (logo from favicon/Open Graph)
- [ ] Extract brand colors from website
- [ ] Auto-apply branding to form

### Manual Customization
- [ ] Custom logo upload
- [ ] Color picker (primary, accent, background)
- [ ] Font selection
- [ ] Background image/gradient
- [ ] Custom thank you message
- [ ] Custom button text
- [ ] Form theme preview

---

## Phase 6: Analytics & Insights

**Goal:** Help users understand their data.

- [ ] Response analytics dashboard
- [ ] Per-question analytics (most common answers, averages)
- [ ] Response time tracking
- [ ] Completion rate charts
- [ ] Export responses (CSV format)
- [ ] Export responses (JSON format)
- [ ] Filter responses by date range
- [ ] Search responses
- [ ] Response charts (bar, pie, line graphs)

---

## Phase 7: Advanced Form Logic

**Goal:** Enable dynamic, intelligent forms.

- [ ] Conditional logic (show/hide questions based on answers)
- [ ] Skip logic (jump to specific question)
- [ ] Answer piping (use previous answers in questions)
- [ ] Calculated fields (for scoring/totals)
- [ ] Question branching UI in builder
- [ ] Logic testing mode

---

## Phase 8: Access Control & Security

**Goal:** Control who can access forms and prevent abuse.

- [ ] Password-protected forms
- [ ] Response limits (close after X responses)
- [ ] Time-based availability (start/end dates)
- [ ] Rate limiting per IP address
- [ ] CAPTCHA integration (hCaptcha or reCAPTCHA)
- [ ] Spam detection
- [ ] Profanity filter (optional setting)
- [ ] Require authentication to submit

---

## Phase 9: AI-Powered Features

**Goal:** Leverage AI for smarter forms and insights.

- [ ] AI form generator (describe form, AI creates questions)
- [ ] Smart question suggestions based on form purpose
- [ ] AI response analysis and insights
- [ ] Sentiment analysis on text responses
- [ ] Automatic spam/bot detection using AI
- [ ] Trend prediction from response data
- [ ] AI-powered response summaries

---

## Phase 10: Developer Features & Integrations

**Goal:** Make OpenFormy extensible and integratable.

### API & Webhooks
- [ ] Public REST API for form management
- [ ] API authentication with tokens
- [ ] Webhooks on form submission
- [ ] Webhook payload customization
- [ ] Webhook delivery logs and retries
- [ ] API documentation

### Integrations
- [ ] Zapier/Make.com webhook support
- [ ] Email notifications on new responses
- [ ] Auto-responder emails to form fillers
- [ ] Slack notifications
- [ ] Google Sheets export integration
- [ ] Custom email templates

### Embedding
- [ ] Embed code generator (iframe)
- [ ] Popup embed mode
- [ ] Slider embed mode
- [ ] QR code generator for forms

---

## Phase 11: Premium Features (Monetization)

**Goal:** Build sustainable revenue through premium features.

### Free Tier
- Unlimited forms
- Up to 100 responses/month per form
- Basic question types
- Basic analytics

### Premium Tier (Subscription)
- [ ] Unlimited responses
- [ ] Advanced question types (file upload, signature)
- [ ] Conditional logic
- [ ] Custom branding (remove "Powered by OpenFormy")
- [ ] File upload storage (increased limits)
- [ ] Priority support
- [ ] AI features
- [ ] Advanced analytics
- [ ] Team collaboration

### Enterprise Features
- [ ] Custom domains (forms.yourdomain.com)
- [ ] White-label (complete rebranding)
- [ ] SSO/SAML authentication
- [ ] Dedicated support
- [ ] SLA guarantees
- [ ] On-premise deployment option

---

## Phase 12: Collaboration & Teams

**Goal:** Enable teams to work together on forms.

- [ ] Workspaces/Organizations
- [ ] Team member invitations
- [ ] Role-based access (owner, editor, viewer)
- [ ] Form folders for organization
- [ ] Team response analytics
- [ ] Activity logs (who edited what)
- [ ] Comments on forms and responses

---

## Technical Infrastructure

### Performance & Scaling
- [ ] Form response caching for public forms
- [ ] CDN integration for static assets
- [ ] Database indexing optimization
- [ ] Background job processing for webhooks
- [ ] Response export as background task

### Testing & Quality
- [ ] Unit tests for all entities
- [ ] Integration tests for form submission flow
- [ ] E2E tests for critical user journeys
- [ ] Load testing for high-traffic forms

### Documentation
- [ ] User documentation site
- [ ] API documentation
- [ ] Developer guide for self-hosting
- [ ] Contributing guidelines
- [ ] Video tutorials

---

## Feature Inspirations

### From Typeform
- One-question-at-a-time conversational UI
- Beautiful, engaging form design
- Auto-branding from website URL
- Logic jumps and branching
- Rich question types

### From ikiform
- AI-powered analytics and insights
- Spam/bot detection
- Developer API
- External API field data fetching
- Open-source positioning

### Original OpenFormy Features
- Built on modern Go + React stack
- Self-hostable with SQLite (simple deployment)
- Integrated with existing auth and payment system
- Leverages Pagode's admin panel for form management
- Background task processing with Backlite

---

## Success Metrics

### User Growth
- 1,000 forms created (first 3 months)
- 10,000 forms created (first year)
- 50,000 responses collected (first year)

### Product Quality
- 90%+ form completion rate
- < 2s form load time
- 99.9% uptime
- High user satisfaction scores

### Community
- 100+ GitHub stars (first 6 months)
- Active contributors
- Documentation coverage
- Regular releases

---

## Immediate Next Steps (Phase 1)

1. **Database Schema**
   - Create `Form`, `Question`, `Response`, `Answer` Ent schemas
   - Run `make ent-gen` to generate code
   - Set up relationships between entities

2. **Backend Routes**
   - Form CRUD handler
   - Question management routes
   - Response collection endpoint
   - Public form view (unauthenticated)

3. **Frontend Builder**
   - Form list page
   - Form builder UI (add/edit questions)
   - Simple form renderer
   - Response viewing page

4. **Testing**
   - Create test forms
   - Test submission flow
   - Verify response storage
   - Run `make test` to ensure quality

---

**Built with ❤️ by the OpenFormy community**
