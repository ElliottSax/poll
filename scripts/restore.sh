#!/bin/bash

# Polling Dashboard - Restore Script
# Restores database and redis from backup
# Usage: ./scripts/restore.sh <backup_name>

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_NAME=$1
BACKUP_DIR="./backups"
BACKUP_ARCHIVE="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
RESTORE_DIR="$BACKUP_DIR/restore_tmp"

# Database config
DB_CONTAINER="poll-postgres-prod"
DB_USER=${POSTGRES_USER:-poll_user}
DB_NAME=${POSTGRES_DB:-poll_db}

# Redis config
REDIS_CONTAINER="poll-redis-prod"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Polling Dashboard Restore${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate backup name
if [ -z "$BACKUP_NAME" ]; then
    print_error "Backup name is required!"
    print_info "Usage: ./scripts/restore.sh <backup_name>"
    print_info "Available backups:"
    ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | xargs -n 1 basename | sed 's/.tar.gz$//' || echo "No backups found"
    exit 1
fi

# Check if backup exists
if [ ! -f "$BACKUP_ARCHIVE" ]; then
    print_error "Backup not found: $BACKUP_ARCHIVE"
    print_info "Available backups:"
    ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | xargs -n 1 basename | sed 's/.tar.gz$//' || echo "No backups found"
    exit 1
fi

# Confirm restore
print_warning "This will OVERWRITE current data with backup from: $BACKUP_NAME"
read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    print_info "Restore cancelled."
    exit 0
fi

# Extract backup
print_info "Extracting backup..."
rm -rf "$RESTORE_DIR"
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_ARCHIVE" -C "$RESTORE_DIR"

# Find the backup directory (it should be the only directory in restore_tmp)
BACKUP_PATH=$(find "$RESTORE_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)

if [ -z "$BACKUP_PATH" ]; then
    print_error "Invalid backup structure"
    exit 1
fi

print_info "Backup extracted to: $BACKUP_PATH"

# Show backup metadata
if [ -f "$BACKUP_PATH/metadata.txt" ]; then
    print_info "Backup metadata:"
    cat "$BACKUP_PATH/metadata.txt"
fi

# Stop services
print_info "Stopping services..."
docker-compose -f docker-compose.prod.yml stop

# Restore PostgreSQL
if [ -f "$BACKUP_PATH/postgres.sql.gz" ]; then
    print_info "Restoring PostgreSQL database..."

    # Start only postgres
    docker-compose -f docker-compose.prod.yml up -d postgres
    sleep 5

    # Drop and recreate database
    print_warning "Dropping existing database..."
    docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres
    docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" postgres

    # Restore from backup
    gunzip -c "$BACKUP_PATH/postgres.sql.gz" | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME

    print_info "PostgreSQL restore completed"
else
    print_warning "No PostgreSQL backup found in archive"
fi

# Restore Redis
if [ -f "$BACKUP_PATH/redis.rdb.gz" ]; then
    print_info "Restoring Redis data..."

    # Stop redis
    docker-compose -f docker-compose.prod.yml stop redis

    # Extract and copy RDB file
    gunzip -c "$BACKUP_PATH/redis.rdb.gz" > "$RESTORE_DIR/dump.rdb"
    docker cp "$RESTORE_DIR/dump.rdb" $REDIS_CONTAINER:/data/dump.rdb

    print_info "Redis restore completed"
else
    print_warning "No Redis backup found in archive"
fi

# Restore uploaded files
if [ -f "$BACKUP_PATH/uploads.tar.gz" ]; then
    print_info "Restoring uploaded files..."
    rm -rf ./uploads
    tar -xzf "$BACKUP_PATH/uploads.tar.gz"
    print_info "Uploads restore completed"
fi

# Clean up
print_info "Cleaning up temporary files..."
rm -rf "$RESTORE_DIR"

# Restart services
print_info "Restarting all services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
print_info "Waiting for services to start..."
sleep 10

# Health check
print_info "Running health checks..."
API_HEALTH=$(curl -s http://localhost:3001/health | grep -o '"status":"healthy"' || echo "")
if [ -z "$API_HEALTH" ]; then
    print_warning "API health check failed, but restore completed"
else
    print_info "API is healthy"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Restore completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
print_info "Services are starting up..."
print_info "Check logs with: docker-compose -f docker-compose.prod.yml logs -f"
