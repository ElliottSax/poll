#!/bin/bash
# SessionStart hook for Polling Dashboard
# This script runs when a new Claude Code web session starts

set -e

echo "🚀 Initializing Polling Dashboard environment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "⚙️  Creating .env from .env.example..."
        cp .env.example .env
        echo "⚠️  Please update .env with your actual configuration"
    else
        echo "⚠️  No .env.example found"
    fi
else
    echo "✅ .env file exists"
fi

# Display project structure
echo ""
echo "📂 Project Structure:"
echo "  - apps/web: Next.js frontend"
echo "  - apps/api: Fastify backend API"
echo "  - packages/database: Prisma schema"
echo ""

# Check for parallel work assignments
if [ -f ".claude/WORK_ASSIGNMENTS.md" ]; then
    echo "📋 Checking work assignments..."
    echo "See .claude/WORK_ASSIGNMENTS.md for current task allocation"
    echo ""
fi

# Display available commands
echo "🛠️  Available Commands:"
echo "  npm run dev          - Run all apps in parallel"
echo "  npm run dev:web      - Run web app only"
echo "  npm run dev:api      - Run API only"
echo "  npm run build        - Build all apps"
echo "  npm run lint         - Lint all code"
echo "  npm run type-check   - Type check all code"
echo ""

echo "✅ Environment ready! Happy coding!"
