# Docker Deployment Guide

This guide explains how to deploy the Questionnaire Builder application using Docker.

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/YourUsername/ReactMultiplePathForm.git
cd ReactMultiplePathForm

# Start the application with included MariaDB
docker-compose up -d

# Access the application
# Open http://localhost:5000 in your browser
```

### Option 2: Using Pre-built Image from GitHub Container Registry

```bash
# Pull the latest image
docker pull ghcr.io/YourUsername/reactmultiplepathform:latest

# Run with your own database
docker run -d \
  -p 5000:5000 \
  -e DB_HOST=your-database-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_NAME=questionnaire_db \
  -e DB_PORT=3306 \
  --name questionnaire-app \
  ghcr.io/YourUsername/reactmultiplepathform:latest
```

## Detailed Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Available variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `mariadb` | Database host (use 'mariadb' for included DB, or external host) |
| `DB_PORT` | `3306` | Database port |
| `DB_NAME` | `questionnaire_db` | Database name |
| `DB_USER` | `questionnaire_user` | Database user |
| `DB_PASSWORD` | `questionnaire_pass` | Database password |
| `DB_ROOT_PASSWORD` | `rootpassword` | MariaDB root password (only for included DB) |
| `APP_PORT` | `5000` | Application port to expose |
| `NODE_ENV` | `production` | Node environment |

### Using Included MariaDB

The `docker-compose.yml` includes a pre-configured MariaDB instance:

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes (deletes database data!)
docker-compose down -v
```

**Features:**
- Automatic database initialization with schema
- Persistent data storage in Docker volume
- Health checks
- Sample questionnaire pre-loaded

### Using External Database

To use your own database instead of the included MariaDB:

#### Method 1: Comment out MariaDB in docker-compose.yml

Edit `docker-compose.yml`:

```yaml
services:
  # mariadb:
  #   ... (comment out entire mariadb service)

  app:
    # Remove or comment out the depends_on section
    # depends_on:
    #   mariadb:
    #     condition: service_healthy
```

Update `.env`:
```bash
DB_HOST=your-external-database.com
DB_USER=your-user
DB_PASSWORD=your-password
```

Run:
```bash
docker-compose up -d app
```

#### Method 2: Use standalone Docker command

```bash
docker run -d \
  -p 5000:5000 \
  -e DB_HOST=192.168.1.100 \
  -e DB_USER=myuser \
  -e DB_PASSWORD=mypassword \
  -e DB_NAME=questionnaire_db \
  -e DB_PORT=3306 \
  --name questionnaire-app \
  ghcr.io/YourUsername/reactmultiplepathform:latest
```

### Database Initialization

The database schema is automatically created when using the included MariaDB via `init-db.sql`.

For external databases, manually run the SQL script:

```bash
# Copy init-db.sql to your database server
mysql -h your-host -u your-user -p questionnaire_db < init-db.sql
```

Or use the Node.js initialization script (requires Node.js installed):

```bash
cd server
npm install
npm run init-db
```

## Building Your Own Image

### Build locally

```bash
# Build the image
docker build -t questionnaire-app:local .

# Run it
docker run -d -p 5000:5000 \
  -e DB_HOST=mariadb \
  questionnaire-app:local
```

### Build with Docker Compose

```bash
# Build and start
docker-compose up -d --build

# Force rebuild
docker-compose build --no-cache
```

## GitHub Actions Auto-Build

The repository includes a GitHub Actions workflow that automatically builds and publishes Docker images to GitHub Container Registry (ghcr.io).

### Setup (One-time)

1. **Enable GitHub Container Registry:**
   - Go to repository Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Click "Save"

2. **Make repository public** (or configure package visibility):
   - Public repos get unlimited storage for ghcr.io
   - Private repos have storage limits

### Automatic Builds

Images are automatically built on:
- Push to `main`, `master`, or `develop` branches
- Creating version tags (e.g., `v1.0.0`)
- Pull requests (build only, no push)
- Manual trigger via GitHub Actions UI

### Available Image Tags

After the workflow runs, you can pull images using:

```bash
# Latest from main branch
docker pull ghcr.io/YourUsername/reactmultiplepathform:latest

# Specific branch
docker pull ghcr.io/YourUsername/reactmultiplepathform:develop

# Specific version tag
docker pull ghcr.io/YourUsername/reactmultiplepathform:v1.0.0

# Commit SHA
docker pull ghcr.io/YourUsername/reactmultiplepathform:main-a1b2c3d
```

### Manually Trigger Build

1. Go to Actions tab in GitHub
2. Select "Build and Push Docker Image"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow"

### Viewing Published Images

1. Go to your GitHub profile
2. Click "Packages"
3. Find "reactmultiplepathform"
4. View available versions and pull commands

## Production Deployment

### Using Docker Compose in Production

1. **Clone repository on server:**
   ```bash
   git clone https://github.com/YourUsername/ReactMultiplePathForm.git
   cd ReactMultiplePathForm
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

3. **Secure your configuration:**
   ```bash
   # Use strong passwords
   DB_PASSWORD=$(openssl rand -base64 32)
   DB_ROOT_PASSWORD=$(openssl rand -base64 32)
   ```

4. **Start services:**
   ```bash
   docker-compose up -d
   ```

5. **Setup reverse proxy (optional but recommended):**

   Example with Nginx:
   ```nginx
   server {
       listen 80;
       server_name questionnaire.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Using Pre-built Image

```bash
# Create docker-compose.yml on your server
version: '3.8'

services:
  mariadb:
    image: mariadb:11.2
    # ... (same as provided docker-compose.yml)

  app:
    image: ghcr.io/YourUsername/reactmultiplepathform:latest
    # ... (same as provided docker-compose.yml)
```

## Backup and Restore

### Backup Database

```bash
# Backup database to file
docker exec questionnaire-db mysqldump -u questionnaire_user -pquestionnaire_pass questionnaire_db > backup.sql

# Or using docker-compose
docker-compose exec mariadb mysqldump -u questionnaire_user -pquestionnaire_pass questionnaire_db > backup.sql
```

### Restore Database

```bash
# Restore from backup
docker exec -i questionnaire-db mysql -u questionnaire_user -pquestionnaire_pass questionnaire_db < backup.sql

# Or using docker-compose
docker-compose exec -T mariadb mysql -u questionnaire_user -pquestionnaire_pass questionnaire_db < backup.sql
```

### Backup Docker Volume

```bash
# Backup volume data
docker run --rm \
  -v reactmultiplepathform_mariadb_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mariadb-backup.tar.gz -C /data .

# Restore volume data
docker run --rm \
  -v reactmultiplepathform_mariadb_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mariadb-backup.tar.gz -C /data
```

## Troubleshooting

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mariadb

# Last 100 lines
docker-compose logs --tail=100 app
```

### Check Service Health

```bash
# Check running containers
docker-compose ps

# Inspect container
docker inspect questionnaire-app

# Check health status
docker inspect --format='{{.State.Health.Status}}' questionnaire-app
```

### Database Connection Issues

```bash
# Test database connection from app container
docker-compose exec app nc -zv mariadb 3306

# Access database shell
docker-compose exec mariadb mysql -u questionnaire_user -pquestionnaire_pass questionnaire_db
```

### Reset Everything

```bash
# Stop and remove everything including volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all -v

# Start fresh
docker-compose up -d --build
```

### Common Issues

1. **Port already in use:**
   ```bash
   # Change APP_PORT in .env
   APP_PORT=8080
   ```

2. **Database initialization fails:**
   ```bash
   # Remove volumes and restart
   docker-compose down -v
   docker-compose up -d
   ```

3. **App can't connect to database:**
   - Ensure `DB_HOST=mariadb` in .env (not localhost)
   - Check database is healthy: `docker-compose ps`
   - Wait for database initialization (check logs)

## Health Checks

The application includes health check endpoints:

```bash
# Check app health
curl http://localhost:5000/api/health

# Response: {"status":"ok","message":"Server is running"}
```

Docker health checks automatically monitor:
- App: HTTP endpoint every 30s
- MariaDB: MySQL connection every 10s

## Scaling

To run multiple app instances behind a load balancer:

```yaml
services:
  app:
    deploy:
      replicas: 3
    # ... rest of config
```

## Updates and Maintenance

### Update to Latest Image

```bash
# Pull latest image
docker-compose pull

# Restart with new image
docker-compose up -d

# Or in one command
docker-compose pull && docker-compose up -d
```

### Update Specific Version

```bash
# Edit docker-compose.yml
services:
  app:
    image: ghcr.io/YourUsername/reactmultiplepathform:v1.2.0

# Pull and restart
docker-compose pull && docker-compose up -d
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/YourUsername/ReactMultiplePathForm/issues
- Documentation: See README.md for application features

## License

MIT License - See LICENSE file
