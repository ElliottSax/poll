#!/bin/bash
# Development Setup Script for Polling Dashboard
# This script sets up the database and seeds it with demo data

set -e

echo "=========================================="
echo "Polling Dashboard - Development Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is available
check_docker() {
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}Docker is available${NC}"
        return 0
    else
        echo -e "${YELLOW}Docker not found. Please install Docker or set up PostgreSQL manually.${NC}"
        return 1
    fi
}

# Start database services with Docker
start_services() {
    echo ""
    echo "Starting PostgreSQL and Redis with Docker..."
    docker-compose -f docker-compose.dev.yml up -d

    echo "Waiting for services to be ready..."
    sleep 5

    # Wait for PostgreSQL
    until docker exec poll_postgres pg_isready -U poll_user -d poll_db > /dev/null 2>&1; do
        echo "Waiting for PostgreSQL..."
        sleep 2
    done
    echo -e "${GREEN}PostgreSQL is ready${NC}"

    # Wait for Redis
    until docker exec poll_redis redis-cli ping > /dev/null 2>&1; do
        echo "Waiting for Redis..."
        sleep 2
    done
    echo -e "${GREEN}Redis is ready${NC}"
}

# Install dependencies
install_deps() {
    echo ""
    echo "Installing dependencies..."
    npm install
}

# Generate Prisma client
generate_prisma() {
    echo ""
    echo "Generating Prisma client..."
    cd packages/database
    npx prisma generate
    cd ../..
}

# Run database migrations
run_migrations() {
    echo ""
    echo "Running database migrations..."
    cd packages/database
    npx prisma migrate dev --name init
    cd ../..
}

# Seed the database
seed_database() {
    echo ""
    echo "Seeding database with demo data..."
    cd packages/database
    npx tsx seed.ts
    cd ../..
}

# Build the API
build_api() {
    echo ""
    echo "Building API..."
    cd apps/api
    npm run build || echo "Build command not available, skipping..."
    cd ../..
}

# Main execution
main() {
    if check_docker; then
        start_services
    else
        echo ""
        echo "Manual setup instructions:"
        echo "1. Install PostgreSQL and create database:"
        echo "   CREATE DATABASE poll_db;"
        echo "   CREATE USER poll_user WITH PASSWORD 'poll_password';"
        echo "   GRANT ALL PRIVILEGES ON DATABASE poll_db TO poll_user;"
        echo ""
        echo "2. Install Redis (optional, for caching)"
        echo ""
        echo "Press Enter to continue with migrations (requires DATABASE_URL to be set)..."
        read
    fi

    install_deps
    generate_prisma
    run_migrations
    seed_database

    echo ""
    echo -e "${GREEN}=========================================="
    echo "Setup Complete!"
    echo "==========================================${NC}"
    echo ""
    echo "To start development:"
    echo "  npm run dev          # Start all services"
    echo "  npm run dev:web      # Start frontend only"
    echo "  npm run dev:api      # Start API only"
    echo ""
    echo "Database tools:"
    echo "  npx prisma studio    # Open database GUI"
    echo ""
    echo "API endpoints:"
    echo "  http://localhost:3001/api/races"
    echo "  http://localhost:3001/api/polls"
    echo "  http://localhost:3001/api/races/featured"
    echo ""
}

main
