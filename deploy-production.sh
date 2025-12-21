#!/bin/bash

# UltraThink Production Deployment Script
# Advanced polling analytics with ML-powered predictions

set -e

echo "🚀 Starting UltraThink Production Deployment"
echo "============================================"

# Environment setup
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Check for required environment variables
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with required configuration"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📦 Installing dependencies..."
npm ci --production=false

echo "🔨 Building applications..."
# Build in parallel
npx turbo run build --filter=@poll/types
npx turbo run build --filter=@poll/database
npx turbo run build --filter=api
npx turbo run build --filter=web

echo "🗄️  Running database migrations..."
npm run db:migrate:deploy

echo "✨ UltraThink Features Enabled:"
echo "  - Real-time polling data processing"
echo "  - ML-powered prediction models"
echo "  - Advanced visualization engine"
echo "  - Distributed computing ready"

echo "🎯 Starting production servers..."

# Start API server
cd apps/api
npm run start &
API_PID=$!

# Start web server
cd ../web
npm run start &
WEB_PID=$!

cd ../..

echo ""
echo "✅ UltraThink Production Deployment Complete!"
echo "============================================"
echo "API Server PID: $API_PID"
echo "Web Server PID: $WEB_PID"
echo ""
echo "🌐 Access the application at:"
echo "   Web: http://localhost:3000"
echo "   API: http://localhost:4000"
echo ""
echo "💡 UltraThink Mode: ACTIVE"