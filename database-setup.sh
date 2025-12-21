#!/bin/bash

# UltraThink Database Setup Script
# Sets up PostgreSQL and runs migrations

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🗄️  UltraThink Database Setup"
echo "============================="

# Check if .env exists
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        cp .env.production .env
        echo -e "${GREEN}✓${NC} Created .env from .env.production"
    else
        echo -e "${RED}✗${NC} No .env file found. Creating default..."
        cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/polling_db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
EOF
        echo -e "${GREEN}✓${NC} Created default .env file"
    fi
fi

# Source environment variables
source .env

echo ""
echo "1. Checking PostgreSQL availability..."
echo "--------------------------------------"

# Parse DATABASE_URL
if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"

    echo "Database: $DB_NAME"
    echo "Host: $DB_HOST:$DB_PORT"
else
    echo -e "${RED}✗${NC} Invalid DATABASE_URL format"
    exit 1
fi

# Check if PostgreSQL is running locally
if command -v pg_isready &> /dev/null; then
    if pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        echo -e "${GREEN}✓${NC} PostgreSQL is running"
    else
        echo -e "${YELLOW}⚠${NC} PostgreSQL not running locally"
        echo ""
        echo "Options:"
        echo "1. Start PostgreSQL manually"
        echo "2. Use Docker: docker-compose -f docker-compose.ultrathink.yml up -d postgres"
        echo "3. Update DATABASE_URL to point to a remote database"

        read -p "Do you want to start PostgreSQL with Docker? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v docker &> /dev/null; then
                echo "Starting PostgreSQL with Docker..."
                docker run -d \
                    --name ultrathink-postgres \
                    -e POSTGRES_USER=$DB_USER \
                    -e POSTGRES_PASSWORD=$DB_PASS \
                    -e POSTGRES_DB=$DB_NAME \
                    -p $DB_PORT:5432 \
                    postgres:15-alpine 2>/dev/null || {
                        echo -e "${YELLOW}⚠${NC} Container already exists, starting it..."
                        docker start ultrathink-postgres
                    }

                echo "Waiting for PostgreSQL to start..."
                sleep 5

                if docker exec ultrathink-postgres pg_isready &> /dev/null; then
                    echo -e "${GREEN}✓${NC} PostgreSQL started successfully"
                else
                    echo -e "${RED}✗${NC} Failed to start PostgreSQL"
                    exit 1
                fi
            else
                echo -e "${RED}✗${NC} Docker not installed"
                exit 1
            fi
        else
            echo "Please start PostgreSQL manually and run this script again."
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} pg_isready not found, skipping PostgreSQL check"
fi

echo ""
echo "2. Installing Prisma dependencies..."
echo "------------------------------------"
cd packages/database
npm install @prisma/client prisma --save-dev 2>/dev/null || npm install @prisma/client prisma
echo -e "${GREEN}✓${NC} Prisma dependencies installed"

echo ""
echo "3. Generating Prisma Client..."
echo "-------------------------------"
npx prisma generate
echo -e "${GREEN}✓${NC} Prisma Client generated"

echo ""
echo "4. Running database migrations..."
echo "----------------------------------"

# Check if migrations directory exists
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "Applying existing migrations..."
    npx prisma migrate deploy
    echo -e "${GREEN}✓${NC} Migrations applied"
else
    echo "Creating initial migration..."
    npx prisma migrate dev --name initial_schema --skip-seed
    echo -e "${GREEN}✓${NC} Initial migration created"
fi

echo ""
echo "5. Seeding database (optional)..."
echo "----------------------------------"
read -p "Do you want to seed the database with sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create seed file if it doesn't exist
    if [ ! -f "seed.ts" ]; then
        echo "Creating seed file..."
        cat > seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create candidates
  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        name: 'Candidate A',
        party: 'Party 1',
        color: '#3B82F6',
        bio: 'Experienced leader with a vision for the future'
      }
    }),
    prisma.candidate.create({
      data: {
        name: 'Candidate B',
        party: 'Party 2',
        color: '#EF4444',
        bio: 'Champion of change and innovation'
      }
    }),
    prisma.candidate.create({
      data: {
        name: 'Candidate C',
        party: 'Independent',
        color: '#10B981',
        bio: 'Independent voice for the people'
      }
    })
  ]);

  // Create sample polls
  const poll = await prisma.poll.create({
    data: {
      source: 'Sample Poll Co',
      pollster: 'Professional Pollsters',
      date: new Date(),
      sampleSize: 1000,
      marginOfError: 3.5,
      methodology: 'Random digit dialing',
      results: {
        create: [
          {
            candidateId: candidates[0].id,
            percentage: 42.5
          },
          {
            candidateId: candidates[1].id,
            percentage: 38.2
          },
          {
            candidateId: candidates[2].id,
            percentage: 19.3
          }
        ]
      }
    }
  });

  console.log('✅ Database seeded successfully');
  console.log(`Created ${candidates.length} candidates`);
  console.log(`Created 1 poll with results`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF
    fi

    # Run seed
    npx ts-node seed.ts 2>/dev/null || npx tsx seed.ts 2>/dev/null || {
        echo "Installing tsx..."
        npm install --save-dev tsx
        npx tsx seed.ts
    }
    echo -e "${GREEN}✓${NC} Database seeded"
fi

cd ../..

echo ""
echo "6. Verifying database setup..."
echo "-------------------------------"

# Create a test script
cat > test-db.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const candidateCount = await prisma.candidate.count();
    const pollCount = await prisma.poll.count();
    console.log(`✓ Database connected`);
    console.log(`  Candidates: ${candidateCount}`);
    console.log(`  Polls: ${pollCount}`);
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
EOF

cd packages/database
node ../../test-db.js
rm ../../test-db.js
cd ../..

echo ""
echo "============================="
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "Database URL: $DATABASE_URL"
echo ""
echo "Available commands:"
echo "  npm run db:studio     - Open Prisma Studio (GUI)"
echo "  npm run db:migrate    - Run migrations"
echo "  npm run db:seed       - Seed database"
echo "  npm run db:reset      - Reset database"
echo ""

# Create convenience script
cat > db-status.sh << 'EOF'
#!/bin/bash
echo "🗄️  Database Status"
echo "=================="

source .env

if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"

    echo "Database: $DB_NAME"
    echo "Host: $DB_HOST:$DB_PORT"

    if command -v pg_isready &> /dev/null; then
        if pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
            echo "Status: ✅ Running"

            # Check Docker container if it exists
            if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q ultrathink-postgres; then
                docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep ultrathink-postgres
            fi
        else
            echo "Status: ❌ Not running"
        fi
    fi
fi
EOF

chmod +x db-status.sh

echo "Created db-status.sh for checking database status"