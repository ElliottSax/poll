#!/bin/bash

# UltraThink Deployment Troubleshooting Script
# Diagnoses and fixes common deployment issues

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔍 UltraThink Deployment Troubleshooting"
echo "========================================"
echo ""

ISSUES_FOUND=0
FIXES_APPLIED=0

# Function to detect and fix issues
diagnose_and_fix() {
    local issue=$1
    local fix_command=$2
    local description=$3

    echo -e "${YELLOW}Checking:${NC} $description"

    if eval "$issue"; then
        echo -e "${RED}  ✗ Issue detected${NC}"
        ((ISSUES_FOUND++))

        read -p "  Apply fix? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            eval "$fix_command"
            ((FIXES_APPLIED++))
            echo -e "${GREEN}  ✓ Fix applied${NC}"
        fi
    else
        echo -e "${GREEN}  ✓ No issues${NC}"
    fi
    echo ""
}

echo "1. Checking Node.js Issues..."
echo "------------------------------"

# Check Node version
diagnose_and_fix \
    "! node -v >/dev/null 2>&1" \
    "echo 'Please install Node.js v20+ from https://nodejs.org'" \
    "Node.js installation"

diagnose_and_fix \
    "[[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]" \
    "echo 'Please upgrade to Node.js v20+ from https://nodejs.org'" \
    "Node.js version >= 20"

echo "2. Checking Dependencies..."
echo "----------------------------"

# Check for node_modules
diagnose_and_fix \
    "[ ! -d node_modules ] || [ ! '$(ls -A node_modules 2>/dev/null)' ]" \
    "npm install --legacy-peer-deps" \
    "Node modules installation"

# Check for package-lock.json
diagnose_and_fix \
    "[ ! -f package-lock.json ]" \
    "npm install --package-lock-only" \
    "Package lock file"

echo "3. Checking Build Issues..."
echo "----------------------------"

# Check for TypeScript errors in web
diagnose_and_fix \
    "[ ! -f apps/web/tsconfig.json ]" \
    "echo '{\"extends\": \"../../tsconfig.json\", \"include\": [\"**/*.ts\", \"**/*.tsx\"]}' > apps/web/tsconfig.json" \
    "Web TypeScript configuration"

# Check for missing type definitions
diagnose_and_fix \
    "[ ! -d apps/web/types ]" \
    "mkdir -p apps/web/types && touch apps/web/types/global.d.ts" \
    "Web type definitions directory"

echo "4. Checking Environment Configuration..."
echo "-----------------------------------------"

# Check for .env file
diagnose_and_fix \
    "[ ! -f .env ]" \
    "cp .env.production .env 2>/dev/null || cp .env.example .env 2>/dev/null || echo 'DATABASE_URL=postgresql://localhost:5432/polling_db' > .env" \
    "Environment file"

# Check for required env vars
diagnose_and_fix \
    "! grep -q DATABASE_URL .env 2>/dev/null" \
    "echo 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/polling_db' >> .env" \
    "DATABASE_URL environment variable"

echo "5. Checking Port Conflicts..."
echo "------------------------------"

# Function to check and kill process on port
check_port() {
    local port=$1
    local name=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}  Port $port ($name) is in use${NC}"
        PID=$(lsof -Pi :$port -sTCP:LISTEN -t)
        echo "    PID: $PID"
        read -p "    Kill process? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill -9 $PID 2>/dev/null || sudo kill -9 $PID
            echo -e "${GREEN}    ✓ Process killed${NC}"
            ((FIXES_APPLIED++))
        fi
    else
        echo -e "${GREEN}  Port $port ($name) is available${NC}"
    fi
}

check_port 3000 "Web"
check_port 4000 "API"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis"

echo ""
echo "6. Checking Docker Issues..."
echo "-----------------------------"

if command -v docker &> /dev/null; then
    # Check Docker daemon
    diagnose_and_fix \
        "! docker info >/dev/null 2>&1" \
        "echo 'Please start Docker Desktop or run: sudo systemctl start docker'" \
        "Docker daemon status"

    # Check for dangling containers
    DANGLING_CONTAINERS=$(docker ps -aq -f name=ultrathink 2>/dev/null | wc -l)
    if [ "$DANGLING_CONTAINERS" -gt 0 ]; then
        echo -e "${YELLOW}  Found $DANGLING_CONTAINERS UltraThink containers${NC}"
        read -p "  Remove all UltraThink containers? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker rm -f $(docker ps -aq -f name=ultrathink) 2>/dev/null
            echo -e "${GREEN}  ✓ Containers removed${NC}"
            ((FIXES_APPLIED++))
        fi
    fi
else
    echo -e "${YELLOW}  Docker not installed (optional)${NC}"
fi

echo ""
echo "7. Checking Database Issues..."
echo "-------------------------------"

# Check PostgreSQL connection
if [ -f .env ]; then
    source .env
    if [ ! -z "$DATABASE_URL" ]; then
        if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[4]}"

            diagnose_and_fix \
                "! nc -z $DB_HOST $DB_PORT 2>/dev/null" \
                "./database-setup.sh 2>/dev/null || echo 'Run ./database-setup.sh manually'" \
                "Database connection"
        fi
    fi
fi

echo "8. Common Build Error Fixes..."
echo "-------------------------------"

# Check for common TypeScript errors
if [ -f apps/web/.next/build-manifest.json ] 2>/dev/null; then
    echo -e "${GREEN}  ✓ Web build exists${NC}"
else
    echo -e "${YELLOW}  No web build found${NC}"
    read -p "  Run build fix script? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        chmod +x fix-build.sh 2>/dev/null || true
        ./fix-build.sh 2>/dev/null || bash fix-build.sh
        ((FIXES_APPLIED++))
    fi
fi

echo ""
echo "9. Checking File Permissions..."
echo "--------------------------------"

# Check script permissions
for script in deploy-production.sh health-check.sh fix-build.sh database-setup.sh; do
    if [ -f "$script" ]; then
        diagnose_and_fix \
            "[ ! -x '$script' ]" \
            "chmod +x '$script'" \
            "$script executable permission"
    fi
done

echo ""
echo "10. Quick Fixes Menu..."
echo "-----------------------"
echo "1) Clear all caches"
echo "2) Reinstall dependencies"
echo "3) Reset database"
echo "4) Kill all Node processes"
echo "5) Docker cleanup"
echo "6) Full reset"
echo "0) Skip"
echo ""
read -p "Select option (0-6): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "Clearing caches..."
        rm -rf .next .turbo node_modules/.cache
        npm cache clean --force 2>/dev/null || true
        echo -e "${GREEN}✓ Caches cleared${NC}"
        ((FIXES_APPLIED++))
        ;;
    2)
        echo "Reinstalling dependencies..."
        rm -rf node_modules package-lock.json
        npm install --legacy-peer-deps
        echo -e "${GREEN}✓ Dependencies reinstalled${NC}"
        ((FIXES_APPLIED++))
        ;;
    3)
        echo "Resetting database..."
        cd packages/database 2>/dev/null && npx prisma migrate reset --force
        cd ../..
        echo -e "${GREEN}✓ Database reset${NC}"
        ((FIXES_APPLIED++))
        ;;
    4)
        echo "Killing Node processes..."
        pkill -f node 2>/dev/null || killall node 2>/dev/null || true
        echo -e "${GREEN}✓ Node processes killed${NC}"
        ((FIXES_APPLIED++))
        ;;
    5)
        echo "Docker cleanup..."
        docker system prune -af 2>/dev/null
        echo -e "${GREEN}✓ Docker cleaned${NC}"
        ((FIXES_APPLIED++))
        ;;
    6)
        echo "Full reset..."
        rm -rf node_modules package-lock.json .next .turbo
        npm install --legacy-peer-deps
        ./fix-build.sh 2>/dev/null || bash fix-build.sh
        echo -e "${GREEN}✓ Full reset complete${NC}"
        ((FIXES_APPLIED++))
        ;;
    *)
        echo "Skipped quick fixes"
        ;;
esac

echo ""
echo "========================================"
echo "Troubleshooting Summary:"
echo "========================================"
echo "Issues found: $ISSUES_FOUND"
echo "Fixes applied: $FIXES_APPLIED"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No issues detected! System ready for deployment.${NC}"
else
    if [ $FIXES_APPLIED -eq $ISSUES_FOUND ]; then
        echo -e "${GREEN}✅ All issues fixed! Try deploying again.${NC}"
    else
        echo -e "${YELLOW}⚠️  Some issues remain. Review the output above.${NC}"
    fi
fi

echo ""
echo "Next steps:"
echo "1. Run: ./health-check.sh"
echo "2. Run: npm run build"
echo "3. Run: ./deploy-production.sh"
echo ""

# Create a diagnostic report
cat > deployment-diagnostic.txt << EOF
UltraThink Deployment Diagnostic Report
Generated: $(date)
========================================

System Information:
- OS: $(uname -s)
- Node: $(node -v 2>/dev/null || echo "Not installed")
- NPM: $(npm -v 2>/dev/null || echo "Not installed")
- Docker: $(docker -v 2>/dev/null || echo "Not installed")

Issues Found: $ISSUES_FOUND
Fixes Applied: $FIXES_APPLIED

Environment:
$(env | grep -E "NODE_ENV|DATABASE_URL|ULTRATHINK" | sed 's/=.*/=***/' || echo "No relevant env vars")

Ports Status:
- 3000: $(lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "FREE")
- 4000: $(lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "FREE")
- 5432: $(lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "IN USE" || echo "FREE")

Last Build Attempt:
$(ls -la apps/web/.next 2>/dev/null | head -5 || echo "No build found")

EOF

echo "Diagnostic report saved to: deployment-diagnostic.txt"