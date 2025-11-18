#!/bin/bash

# Polling Dashboard - Development Setup Script
# Sets up the development environment from scratch
# Usage: ./scripts/setup-dev.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Polling Dashboard - Development Setup${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
print_info "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_warning "npm is not installed. Please install npm first."
    exit 1
fi
NPM_VERSION=$(npm -v)
print_info "npm version: $NPM_VERSION"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Please install Docker first."
    exit 1
fi
DOCKER_VERSION=$(docker -v)
print_info "Docker version: $DOCKER_VERSION"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
COMPOSE_VERSION=$(docker-compose -v)
print_info "Docker Compose version: $COMPOSE_VERSION"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env file from .env.example..."
    cp .env.example .env
    print_warning "Please update .env with your configuration"
else
    print_info ".env file already exists"
fi

# Install dependencies
print_info "Installing npm dependencies..."
if [ -f "package.json" ]; then
    npm install
fi

# Install dependencies for all workspaces
if [ -f "apps/web/package.json" ]; then
    print_info "Installing frontend dependencies..."
    cd apps/web && npm install && cd ../..
fi

if [ -f "apps/api/package.json" ]; then
    print_info "Installing backend dependencies..."
    cd apps/api && npm install && cd ../..
fi

# Install Python dependencies for ML service
if [ -f "apps/ml/requirements.txt" ]; then
    print_info "Python dependencies for ML service..."
    print_info "To install: cd apps/ml && pip install -r requirements.txt"
fi

# Start Docker services
print_info "Starting Docker services (database, redis)..."
docker-compose up -d postgres redis

# Wait for services
print_info "Waiting for services to be ready..."
sleep 10

# Run database migrations
print_info "Running database migrations..."
if [ -f "packages/database/prisma/schema.prisma" ]; then
    cd packages/database
    npx prisma generate
    npx prisma migrate dev --name init
    cd ../..
fi

# Seed database (if seed script exists)
print_info "Seeding database..."
if [ -f "packages/database/prisma/seed.ts" ]; then
    cd packages/database
    npx prisma db seed
    cd ../..
fi

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p backups
mkdir -p uploads
mkdir -p logs

# Make scripts executable
print_info "Making scripts executable..."
chmod +x scripts/*.sh

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Development setup completed!${NC}"
echo -e "${GREEN}========================================${NC}"

print_info "Next steps:"
echo "  1. Update .env with your configuration"
echo "  2. Start development servers:"
echo "     - Frontend: cd apps/web && npm run dev"
echo "  - Backend: cd apps/api && npm run dev"
echo "     - ML Service: cd apps/ml && uvicorn main:app --reload"
echo "  3. Access the application:"
echo "     - Web: http://localhost:3000"
echo "     - API: http://localhost:3001"
echo "     - API Docs: http://localhost:3001/docs"
echo "     - ML API: http://localhost:8000"
echo "     - Adminer: http://localhost:8080"
echo "     - Redis Commander: http://localhost:8081"
echo ""
print_info "Or start all services with Docker:"
echo "  docker-compose up"
