#!/bin/bash

# Polling Dashboard - Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: staging, production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_NAME="poll"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Polling Dashboard Deployment${NC}"
echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
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

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_info "Please create .env file from .env.example"
    exit 1
fi

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_info "Valid environments: staging, production"
    exit 1
fi

# Confirm production deployment
if [ "$ENVIRONMENT" == "production" ]; then
    print_warning "You are about to deploy to PRODUCTION!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Deployment cancelled."
        exit 0
    fi
fi

# Pre-deployment checks
print_info "Running pre-deployment checks..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

# Check Git status
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes!"
    git status --short
    read -p "Continue anyway? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Deployment cancelled. Please commit your changes first."
        exit 0
    fi
fi

# Create backup
print_info "Creating backup..."
./scripts/backup.sh

# Pull latest changes (if in git repo)
if [ -d ".git" ]; then
    print_info "Pulling latest changes from git..."
    git pull origin main
fi

# Build images
print_info "Building Docker images..."
docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache

# Run database migrations
print_info "Running database migrations..."
docker-compose -f $DOCKER_COMPOSE_FILE run --rm api npx prisma migrate deploy

# Stop old containers
print_info "Stopping old containers..."
docker-compose -f $DOCKER_COMPOSE_FILE down

# Start new containers
print_info "Starting new containers..."
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Health check
print_info "Running health checks..."

# Check API
API_HEALTH=$(curl -s http://localhost:3001/health | grep -o '"status":"healthy"' || echo "")
if [ -z "$API_HEALTH" ]; then
    print_error "API health check failed!"
    docker-compose -f $DOCKER_COMPOSE_FILE logs api
    exit 1
fi

# Check Web
WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$WEB_HEALTH" != "200" ]; then
    print_error "Web health check failed! Status code: $WEB_HEALTH"
    docker-compose -f $DOCKER_COMPOSE_FILE logs web
    exit 1
fi

# Check ML Service
ML_HEALTH=$(curl -s http://localhost:8000/health | grep -o '"status":"healthy"' || echo "")
if [ -z "$ML_HEALTH" ]; then
    print_warning "ML service health check failed (non-critical)"
    docker-compose -f $DOCKER_COMPOSE_FILE logs ml
fi

# Show running containers
print_info "Running containers:"
docker-compose -f $DOCKER_COMPOSE_FILE ps

# Clean up old images
print_info "Cleaning up old Docker images..."
docker image prune -f

# Deployment success
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
print_info "Web UI: http://localhost:3000"
print_info "API: http://localhost:3001"
print_info "API Docs: http://localhost:3001/docs"
print_info "ML Service: http://localhost:8000"
print_info "Adminer: http://localhost:8080"

# Show logs
read -p "Show logs? (yes/no): " show_logs
if [ "$show_logs" == "yes" ]; then
    docker-compose -f $DOCKER_COMPOSE_FILE logs -f
fi
