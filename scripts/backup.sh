#!/bin/bash

# Polling Dashboard - Backup Script
# Creates backups of database, redis, and uploaded files
# Usage: ./scripts/backup.sh [backup_name]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_NAME=${1:-$(date +%Y%m%d_%H%M%S)}
BACKUP_DIR="./backups"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Database config (from .env or defaults)
DB_CONTAINER="poll-postgres-prod"
DB_USER=${POSTGRES_USER:-poll_user}
DB_NAME=${POSTGRES_DB:-poll_db}

# Redis config
REDIS_CONTAINER="poll-redis-prod"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Polling Dashboard Backup${NC}"
echo -e "${GREEN}Backup Name: ${BACKUP_NAME}${NC}"
echo -e "${GREEN}========================================${NC}"

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Backup PostgreSQL database
print_info "Backing up PostgreSQL database..."
if docker ps | grep -q $DB_CONTAINER; then
    docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_PATH/postgres.sql.gz"
    print_info "PostgreSQL backup completed: $BACKUP_PATH/postgres.sql.gz"
else
    print_warning "PostgreSQL container not running, skipping database backup"
fi

# Backup Redis data
print_info "Backing up Redis data..."
if docker ps | grep -q $REDIS_CONTAINER; then
    # Trigger Redis save
    docker exec $REDIS_CONTAINER redis-cli --pass ${REDIS_PASSWORD:-""} SAVE || true

    # Copy RDB file
    docker cp $REDIS_CONTAINER:/data/dump.rdb "$BACKUP_PATH/redis.rdb" 2>/dev/null || \
        print_warning "Redis backup failed (might be empty or password protected)"

    if [ -f "$BACKUP_PATH/redis.rdb" ]; then
        gzip "$BACKUP_PATH/redis.rdb"
        print_info "Redis backup completed: $BACKUP_PATH/redis.rdb.gz"
    fi
else
    print_warning "Redis container not running, skipping Redis backup"
fi

# Backup application files (if any upload directories exist)
if [ -d "./uploads" ]; then
    print_info "Backing up uploaded files..."
    tar -czf "$BACKUP_PATH/uploads.tar.gz" ./uploads
    print_info "Uploads backup completed: $BACKUP_PATH/uploads.tar.gz"
fi

# Backup environment configuration (without secrets)
print_info "Backing up configuration..."
if [ -f ".env" ]; then
    # Copy .env.example instead of actual .env for security
    cp .env.example "$BACKUP_PATH/.env.example"
fi

# Copy docker-compose files
cp docker-compose.yml "$BACKUP_PATH/docker-compose.yml" 2>/dev/null || true
cp docker-compose.prod.yml "$BACKUP_PATH/docker-compose.prod.yml" 2>/dev/null || true

# Create backup metadata
cat > "$BACKUP_PATH/metadata.txt" << EOF
Backup Created: $(date)
Backup Name: $BACKUP_NAME
Database: $DB_NAME
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
Git Branch: $(git branch --show-current 2>/dev/null || echo "N/A")
EOF

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

# Compress entire backup
print_info "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

COMPRESSED_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
print_info "Backup location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
print_info "Original size: $BACKUP_SIZE"
print_info "Compressed size: $COMPRESSED_SIZE"

# Clean up old backups (keep last 7 days)
print_info "Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +7 -delete

# List all backups
print_info "Available backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || print_warning "No backups found"
