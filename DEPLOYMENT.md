# Deployment Guide

This guide covers deploying OpenFormy to production using Coolify with Nixpacks.

---

## Deploying to Coolify

### Prerequisites

- A running [Coolify](https://coolify.io) instance
- Git repository (GitHub, GitLab, etc.)
- Domain name (optional but recommended)

### Step-by-Step Deployment

1. **Connect Your Repository**
   - In Coolify, create a new application
   - Select "Git Repository" as the source
   - Connect your OpenFormy repository
   - Choose the branch to deploy (e.g., `main`)

2. **Nixpacks Auto-Detection**
   - Coolify will automatically detect the `nixpacks.toml` file
   - The build process will be configured automatically
   - No additional build configuration needed

3. **Configure Environment Variables**
   - See the [Environment Variables](#environment-variables) section below
   - Set all required variables in Coolify's environment settings

4. **Set Up Persistent Storage** (if using SQLite)
   - Add a persistent volume in Coolify
   - Mount point: `/app/data`
   - Set `PAGODA_DATABASE_CONNECTION=/app/data/database.db`

5. **Deploy**
   - Click "Deploy" in Coolify
   - Monitor the build logs
   - First deployment takes ~3-5 minutes

6. **Configure Domain**
   - Add your domain in Coolify's domain settings
   - Enable HTTPS (automatic with Let's Encrypt)
   - Update `PAGODA_APP_HOST` to match your domain

---

## Environment Variables

All configuration is done through environment variables with the `PAGODA_` prefix.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PAGODA_APP_ENVIRONMENT` | Application environment | `production` |
| `PAGODA_APP_HOST` | Public URL of your application | `https://forms.yourdomain.com` |
| `PAGODA_APP_ENCRYPTIONKEY` | 32+ character secret key for sessions/JWT | `your-random-32+-char-secret-key-here` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PAGODA_HTTP_PORT` | HTTP server port | `8000` |
| `PAGODA_DATABASE_CONNECTION` | Database connection string | SQLite in-memory |
| `PAGODA_OPENAI_APIKEY` | OpenAI API key for AI features | None |
| `PAGODA_PAYMENT_STRIPE_SECRETKEY` | Stripe secret key | None |
| `PAGODA_PAYMENT_STRIPE_PUBLISHABLEKEY` | Stripe publishable key | None |
| `PAGODA_PAYMENT_STRIPE_WEBHOOKSECRET` | Stripe webhook secret | None |
| `PAGODA_MAIL_HOSTNAME` | SMTP server hostname | `localhost` |
| `PAGODA_MAIL_PORT` | SMTP server port | `25` |
| `PAGODA_MAIL_USER` | SMTP username | `admin` |
| `PAGODA_MAIL_PASSWORD` | SMTP password | `admin` |
| `PAGODA_MAIL_FROMADDRESS` | From email address | `admin@localhost` |

### Generating Secrets

Generate a strong encryption key:
```bash
openssl rand -base64 32
```

---

## Nixpacks Build Process

OpenFormy uses Nixpacks for automatic builds. The build process is defined in `nixpacks.toml`:

### Build Phases

1. **Setup** - Installs system dependencies
   - Node.js (for frontend build)
   - Go (for backend compilation)
   - GCC (for CGO/SQLite)
   - Chromium (for brand color extraction feature)

2. **Install** - Installs npm dependencies
   ```bash
   npm ci
   ```

3. **Frontend Build** - Builds React/Vite frontend
   ```bash
   npm run build
   ```

4. **Backend Build** - Compiles Go application
   ```bash
   go build -o app ./cmd/web
   ```

5. **Start** - Runs the application
   ```bash
   ./app
   ```

### Why Chromium?

Chromium is required for the brand color extraction feature, which automatically detects brand colors from a website URL. If you don't need this feature, you can remove it from `nixpacks.toml`.

### CGO_ENABLED

Set to `1` to enable CGO, which is required for SQLite support. Without this, the Go SQLite driver won't compile.

---

## Database Configuration

### SQLite (Recommended for Most Deployments)

**Advantages:**
- Zero configuration
- No separate database service needed
- Perfect for small to medium deployments
- Automatic backups with file system snapshots

**Setup:**
1. Create persistent volume in Coolify at `/app/data`
2. Set `PAGODA_DATABASE_CONNECTION=/app/data/database.db`
3. Database file will be created automatically on first run

**Backup:**
- Use Coolify's volume backup feature
- Or manually copy `/app/data/database.db` file

### MySQL (For Large Scale)

**When to use:**
- High traffic (1000+ concurrent users)
- Multiple application instances
- Advanced replication/clustering needs

**Setup:**
1. Create MySQL service in Coolify or use external MySQL
2. Set environment variable:
   ```
   PAGODA_DATABASE_CONNECTION=mysql://user:password@host:3306/dbname
   ```
3. Database tables will be created automatically on first run

---

## Production Checklist

Before going live, ensure you've completed these steps:

- [ ] Generated and set a strong `PAGODA_APP_ENCRYPTIONKEY` (32+ characters)
- [ ] Set `PAGODA_APP_ENVIRONMENT=production`
- [ ] Configured `PAGODA_APP_HOST` with your actual domain
- [ ] Set up persistent volume for SQLite database (if using SQLite)
- [ ] Configured domain and enabled HTTPS in Coolify
- [ ] Tested the application with a test form submission
- [ ] Created admin user account
- [ ] Configured mail service (if using email features)
- [ ] Set up Stripe webhooks (if using payment features)
- [ ] Reviewed and configured CORS settings if needed
- [ ] Set up monitoring/alerts in Coolify

---

## Post-Deployment

### Create Admin User

After deployment, create your first admin user:

1. Access the application container in Coolify (click "Terminal")
2. Run the admin creation command:
   ```bash
   ./app admin create your-email@example.com
   ```
3. Check your email for the verification link
4. Log in and access the admin panel at `/admin`

### Monitor Application

- Check application logs in Coolify's log viewer
- Monitor resource usage (CPU, memory, disk)
- Set up alerts for errors or downtime

### Stripe Webhooks (Optional)

If using payment features:

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/webhooks/stripe`
3. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
4. Copy webhook signing secret to `PAGODA_PAYMENT_STRIPE_WEBHOOKSECRET`

---

## Troubleshooting

### Build Fails

**Check Nixpacks logs:**
- Ensure all dependencies install correctly
- Verify Node.js and Go versions are compatible
- Check for disk space issues

**Common issues:**
- Out of memory: Increase container memory in Coolify
- Chromium install fails: Check Nixpacks package availability
- Frontend build fails: Clear npm cache, rebuild

### Application Won't Start

**Check environment variables:**
- Ensure `PAGODA_APP_ENCRYPTIONKEY` is set
- Verify `PAGODA_APP_HOST` uses correct protocol (http/https)
- Check database connection string format

**Check logs:**
```bash
# In Coolify terminal
./app
# Look for error messages
```

### Database Issues

**SQLite file not persisted:**
- Verify persistent volume is mounted at `/app/data`
- Check file permissions

**Connection errors:**
- Verify database path is correct
- Check file permissions on SQLite file
- For MySQL: verify connection string format and credentials

### Performance Issues

**High memory usage:**
- Increase container resources in Coolify
- Consider switching to MySQL if using SQLite

**Slow response times:**
- Enable caching in config
- Consider using CDN for static assets
- Check database query performance

---

## Updating the Application

1. Push changes to your Git repository
2. Coolify will auto-deploy (if configured) or manually trigger deployment
3. Build process runs automatically
4. Zero-downtime deployment (if configured in Coolify)

---

## Backup Strategy

### Database Backups

**SQLite:**
```bash
# In container or via Coolify terminal
sqlite3 /app/data/database.db ".backup /app/data/backup.db"
```

**Automated backups:**
- Use Coolify's volume snapshot feature
- Set up cron job to copy database file to external storage
- Use rclone to sync to cloud storage (S3, Backblaze, etc.)

### Full Application Backup

- Coolify provides built-in backup features
- Configure backup retention policy
- Test restore process regularly

---

## Security Best Practices

1. **Always use HTTPS** - Enable in Coolify (automatic with Let's Encrypt)
2. **Strong encryption key** - Use 32+ character random string
3. **Regular updates** - Keep dependencies up to date
4. **Monitor logs** - Watch for suspicious activity
5. **Rate limiting** - Built-in, but configure if needed
6. **Database security** - Use strong passwords for MySQL
7. **Environment variables** - Never commit secrets to Git

---

## Support

- 📚 [OpenFormy Documentation](https://github.com/pansani/openformy)
- 💬 [Coolify Documentation](https://coolify.io/docs)
- 🐛 [Report Issues](https://github.com/pansani/openformy/issues)
