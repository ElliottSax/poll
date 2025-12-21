#!/bin/bash

# UltraThink Health Check & Pre-deployment Validation Script
# Checks all critical components before deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 UltraThink Pre-Deployment Health Check"
echo "=========================================="

ERRORS=0
WARNINGS=0

# Function to check command existence
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        ((ERRORS++))
    fi
}

# Function to check port availability
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}✗${NC} Port $1 is already in use"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓${NC} Port $1 is available"
    fi
}

# Function to check environment variable
check_env() {
    if [ -z "${!1}" ]; then
        if [ -f .env ]; then
            if grep -q "^$1=" .env; then
                echo -e "${GREEN}✓${NC} $1 is configured in .env"
            else
                echo -e "${YELLOW}⚠${NC} $1 is not set (using default)"
                ((WARNINGS++))
            fi
        else
            echo -e "${YELLOW}⚠${NC} $1 is not set"
            ((WARNINGS++))
        fi
    else
        echo -e "${GREEN}✓${NC} $1 is set"
    fi
}

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
    else
        echo -e "${RED}✗${NC} $1 is missing"
        ((ERRORS++))
    fi
}

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 directory exists"
    else
        echo -e "${YELLOW}⚠${NC} $1 directory missing (will be created)"
        mkdir -p "$1"
        ((WARNINGS++))
    fi
}

echo ""
echo "1. Checking System Requirements..."
echo "-----------------------------------"
check_command node
check_command npm
check_command git

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ] 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Node version >= 20.0.0"
else
    echo -e "${RED}✗${NC} Node version must be >= 20.0.0"
    ((ERRORS++))
fi

echo ""
echo "2. Checking Port Availability..."
echo "---------------------------------"
check_port 3000  # Web
check_port 4000  # API
check_port 5432  # PostgreSQL
check_port 6379  # Redis
check_port 5000  # ML Service

echo ""
echo "3. Checking Required Files..."
echo "------------------------------"
check_file "package.json"
check_file "apps/web/package.json"
check_file "apps/api/package.json"
check_file "turbo.json"

echo ""
echo "4. Checking Directories..."
echo "--------------------------"
check_dir "apps/web"
check_dir "apps/api"
check_dir "packages"
check_dir "node_modules"

echo ""
echo "5. Checking Environment Configuration..."
echo "-----------------------------------------"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠${NC} .env file not found, creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Created .env from .env.example"
    elif [ -f .env.production ]; then
        cp .env.production .env
        echo -e "${GREEN}✓${NC} Created .env from .env.production"
    else
        echo -e "${RED}✗${NC} No .env template found"
        ((ERRORS++))
    fi
fi

check_env DATABASE_URL
check_env NEXT_PUBLIC_API_URL
check_env NODE_ENV

echo ""
echo "6. Checking Dependencies..."
echo "----------------------------"
if [ -f "package-lock.json" ]; then
    echo -e "${GREEN}✓${NC} package-lock.json exists"
else
    echo -e "${YELLOW}⚠${NC} package-lock.json missing (will be created during install)"
    ((WARNINGS++))
fi

# Check if node_modules exists and is populated
if [ -d "node_modules" ] && [ "$(ls -A node_modules)" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Dependencies not installed (run npm install)"
    ((WARNINGS++))
fi

echo ""
echo "7. Checking Database Connection..."
echo "-----------------------------------"
if [ -f .env ]; then
    source .env
    if [ ! -z "$DATABASE_URL" ]; then
        # Extract database details from URL
        if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[4]}"

            # Check if PostgreSQL is reachable
            if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
                echo -e "${GREEN}✓${NC} Database port is reachable"
            else
                echo -e "${YELLOW}⚠${NC} Database not reachable (will use Docker PostgreSQL)"
                ((WARNINGS++))
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} Cannot check database (no .env file)"
    ((WARNINGS++))
fi

echo ""
echo "8. Checking Docker (Optional)..."
echo "---------------------------------"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is installed"

    # Check Docker daemon
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker daemon is running"
    else
        echo -e "${YELLOW}⚠${NC} Docker daemon is not running"
        ((WARNINGS++))
    fi

    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✓${NC} docker-compose is installed"
    else
        echo -e "${YELLOW}⚠${NC} docker-compose is not installed"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker not installed (optional for containerized deployment)"
    ((WARNINGS++))
fi

echo ""
echo "9. Checking Build Readiness..."
echo "-------------------------------"
# Check for TypeScript
if [ -f "apps/web/tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} TypeScript configured for web"
else
    echo -e "${RED}✗${NC} TypeScript not configured for web"
    ((ERRORS++))
fi

if [ -f "apps/api/tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} TypeScript configured for API"
else
    echo -e "${YELLOW}⚠${NC} TypeScript not configured for API"
    ((WARNINGS++))
fi

echo ""
echo "10. Checking UltraThink Components..."
echo "--------------------------------------"
check_file "apps/web/lib/ultrathink.ts"
check_file "apps/web/components/UltraThinkPanel.tsx"
check_file "deploy-production.sh"
check_file "docker-compose.ultrathink.yml"

echo ""
echo "=========================================="
echo "Health Check Results:"
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed! System is ready for deployment.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  System is ready with $WARNINGS warnings.${NC}"
        echo "   Review warnings above and proceed with caution."
        exit 0
    fi
else
    echo -e "${RED}❌ Found $ERRORS critical errors and $WARNINGS warnings.${NC}"
    echo "   Please fix the errors before deploying."
    exit 1
fi