#!/bin/bash
# Deployment readiness check

set -e

echo "🔍 Checking deployment readiness..."
echo ""

# Check for required files
echo "✓ Checking required files..."
required_files=(
  "packages/database/prisma/schema.prisma"
  "apps/web/package.json"
  "apps/api/package.json"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

echo "✓ All required files present"
echo ""

# Check environment variables
echo "✓ Checking environment template..."
if [ ! -f ".env.example.mvp" ]; then
  echo "❌ Missing .env.example.mvp"
  exit 1
fi
echo "✓ Environment template exists"
echo ""

# Check build
echo "✓ Testing build..."
npm run db:generate --workspace=@poll/database
npm run build --workspace=@poll/web

echo ""
echo "✅ Deployment readiness check passed!"
echo ""
echo "Next steps:"
echo "1. Create Supabase project: https://supabase.com"
echo "2. Copy DATABASE_URL from Supabase"
echo "3. Run: npm run deploy:migrate"
echo "4. Deploy to Vercel: npm run deploy:vercel"
