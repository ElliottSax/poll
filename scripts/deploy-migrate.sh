#!/bin/bash
# Run database migrations for production

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  echo "Export it first: export DATABASE_URL='your-supabase-url'"
  exit 1
fi

echo "🗄️  Running production migrations..."
npm run db:migrate:deploy --workspace=@poll/database

echo ""
echo "✅ Migrations complete!"
echo ""
echo "Optional: Seed sample data"
echo "Run: npm run db:seed --workspace=@poll/database"
