# Deployment Guide

Complete guide for deploying the Polling Dashboard to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Deployment](#database-deployment)
- [Backend API Deployment](#backend-api-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Scraper Deployment](#scraper-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **Server**: Linux server (Ubuntu 22.04 LTS recommended)
- **Domain**: Registered domain with DNS access
- **SSL**: Let's Encrypt or commercial SSL certificate
- **Database**: PostgreSQL 15+ server
- **Node.js**: v18 or higher
- **Python**: 3.11 or higher
- **Nginx**: For reverse proxy
- **PM2**: For process management

## Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install PostgreSQL 15
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-15

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install build essentials
sudo apt install -y build-essential
```

### 2. Create Application User

```bash
# Create user for the application
sudo useradd -m -s /bin/bash pollapp
sudo su - pollapp
```

## Database Deployment

### 1. PostgreSQL Setup

```bash
# Connect as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE polldb;
CREATE USER polluser WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE polldb TO polluser;
\q
```

### 2. Configure PostgreSQL

Edit `/etc/postgresql/15/main/postgresql.conf`:

```conf
# Performance tuning
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

Edit `/etc/postgresql/15/main/pg_hba.conf`:

```conf
# Allow local connections
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Run Migrations

```bash
# As pollapp user
cd /home/pollapp/poll/packages/database
npm install
npm run db:migrate
npm run db:seed  # Optional: seed initial data
```

## Backend API Deployment

### 1. Clone and Build

```bash
# As pollapp user
cd /home/pollapp
git clone <repository-url> poll
cd poll

# Install dependencies
npm install

# Build API
cd apps/api
npm install
npm run build
```

### 2. Environment Configuration

Create `/home/pollapp/poll/apps/api/.env`:

```env
NODE_ENV=production
PORT=3001
HOST=127.0.0.1

# Database
DATABASE_URL=postgresql://polluser:secure_password_here@localhost:5432/polldb

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Logging
LOG_LEVEL=info

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

### 3. PM2 Configuration

Create `/home/pollapp/poll/apps/api/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'poll-api',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/home/pollapp/logs/api-error.log',
    out_file: '/home/pollapp/logs/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

### 4. Start API

```bash
# Create logs directory
mkdir -p /home/pollapp/logs

# Start with PM2
cd /home/pollapp/poll/apps/api
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions printed
```

## Frontend Deployment

### 1. Build Frontend

```bash
# As pollapp user
cd /home/pollapp/poll/apps/web

# Create production environment
cat > .env.production.local <<EOF
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
EOF

# Build
npm install
npm run build
```

### 2. PM2 Configuration

Create `/home/pollapp/poll/apps/web/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'poll-web',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/home/pollapp/logs/web-error.log',
    out_file: '/home/pollapp/logs/web-out.log',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
```

### 3. Start Frontend

```bash
cd /home/pollapp/poll/apps/web
pm2 start ecosystem.config.js
pm2 save
```

## Nginx Configuration

### 1. Create Nginx Configuration

Create `/etc/nginx/sites-available/poll`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;

# Upstream servers
upstream api_backend {
    least_conn;
    server 127.0.0.1:3001;
}

upstream web_backend {
    least_conn;
    server 127.0.0.1:3000;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/poll-access.log;
    error_log /var/log/nginx/poll-error.log;

    # API proxy
    location /api {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Frontend proxy
    location / {
        limit_req zone=web burst=50 nodelay;

        proxy_pass http://web_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### 2. Enable and Restart Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/poll /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

## Scraper Deployment

### 1. Setup Python Environment

```bash
# As pollapp user
cd /home/pollapp/poll/apps/scraper

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create `/home/pollapp/poll/apps/scraper/.env`:

```env
DATABASE_URL=postgresql://polluser:secure_password_here@localhost:5432/polldb
SCRAPER_USER_AGENT=Mozilla/5.0 (compatible; PollScraper/1.0)
LOG_LEVEL=INFO
```

### 3. Cron Job for Scheduled Scraping

```bash
# Edit crontab
crontab -e

# Add scraper job (runs every 6 hours)
0 */6 * * * cd /home/pollapp/poll/apps/scraper && /home/pollapp/poll/apps/scraper/venv/bin/python src/main.py >> /home/pollapp/logs/scraper.log 2>&1
```

## Monitoring & Logging

### 1. PM2 Monitoring

```bash
# View all processes
pm2 list

# Monitor in real-time
pm2 monit

# View logs
pm2 logs
pm2 logs poll-api
pm2 logs poll-web
```

### 2. Log Rotation

Create `/etc/logrotate.d/poll`:

```conf
/home/pollapp/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 pollapp pollapp
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. PostgreSQL Monitoring

```bash
# Check database size
sudo -u postgres psql -c "SELECT pg_database_size('polldb');"

# Check active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# View slow queries
sudo -u postgres psql polldb -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Security Checklist

- [ ] Firewall configured (UFW recommended)
- [ ] SSH key-based authentication only
- [ ] PostgreSQL not exposed to internet
- [ ] Environment variables secured (not in git)
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular security updates scheduled
- [ ] Backups configured (database + code)
- [ ] Log monitoring set up
- [ ] API keys rotated regularly
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection enabled

### Firewall Configuration

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Backup Strategy

### 1. Database Backup Script

Create `/home/pollapp/scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/pollapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="polldb_$DATE.sql.gz"

mkdir -p $BACKUP_DIR
pg_dump -U polluser polldb | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "polldb_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

### 2. Schedule Backups

```bash
# Make executable
chmod +x /home/pollapp/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/pollapp/scripts/backup-db.sh >> /home/pollapp/logs/backup.log 2>&1
```

## Troubleshooting

### API Not Responding

```bash
# Check PM2 status
pm2 list

# View API logs
pm2 logs poll-api --lines 100

# Restart API
pm2 restart poll-api

# Check port
netstat -tulpn | grep 3001
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U polluser -d polldb -h localhost

# View active connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname='polldb';"
```

### High Memory Usage

```bash
# Check memory
free -h

# Check PM2 processes
pm2 list

# Restart with memory limit
pm2 restart poll-api --max-memory-restart 500M
```

### SSL Certificate Issues

```bash
# Test certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

## Performance Optimization

### 1. Enable Caching

Install and configure Redis:

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
```

### 2. Database Indexing

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_polls_race_id ON "Poll"("raceId");
CREATE INDEX idx_polls_pollster_id ON "Poll"("pollsterId");
CREATE INDEX idx_polls_date ON "Poll"("pollDate" DESC);
CREATE INDEX idx_races_status ON "Race"("status");
CREATE INDEX idx_races_type ON "Race"("raceType");
```

### 3. CDN Setup (Optional)

For static assets, consider using Cloudflare or similar CDN.

---

## Support

For deployment issues:
- Check logs in `/home/pollapp/logs/`
- Review Nginx logs in `/var/log/nginx/`
- Test API: `curl http://localhost:3001/health`
- Test frontend: `curl http://localhost:3000`

**Production Deployment Complete! 🚀**
