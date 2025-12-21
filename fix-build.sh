#!/bin/bash

# UltraThink Build Fix Script
# Automatically fixes common build issues

set -e

echo "🔧 UltraThink Build Fix Script"
echo "==============================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "1. Cleaning existing build artifacts..."
echo "---------------------------------------"
rm -rf apps/web/.next 2>/dev/null || true
rm -rf apps/api/dist 2>/dev/null || true
rm -rf packages/*/dist 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
echo -e "${GREEN}✓${NC} Build artifacts cleaned"

echo ""
echo "2. Ensuring required directories exist..."
echo "------------------------------------------"
mkdir -p apps/web/public 2>/dev/null || true
mkdir -p apps/web/styles 2>/dev/null || true
mkdir -p apps/web/components 2>/dev/null || true
mkdir -p apps/web/lib 2>/dev/null || true
mkdir -p apps/api/src/routes 2>/dev/null || true
mkdir -p packages/database/prisma 2>/dev/null || true
mkdir -p packages/types/src 2>/dev/null || true
echo -e "${GREEN}✓${NC} Directories verified"

echo ""
echo "3. Creating missing type definitions..."
echo "----------------------------------------"

# Create global type definitions
cat > apps/web/types/global.d.ts << 'EOF'
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_WS_URL: string;
      NEXT_PUBLIC_MAPBOX_TOKEN?: string;
      DATABASE_URL: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
    }
  }
}

export {};
EOF
echo -e "${GREEN}✓${NC} Created global type definitions"

# Create missing index files if needed
if [ ! -f "packages/types/src/index.ts" ]; then
cat > packages/types/src/index.ts << 'EOF'
// Shared type definitions
export interface Poll {
  id: string;
  title: string;
  source: string;
  date: Date;
  sampleSize: number;
  marginOfError: number;
  results: PollResult[];
}

export interface PollResult {
  candidateId: string;
  candidateName: string;
  percentage: number;
  party: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  color: string;
}

export interface TrendData {
  date: Date;
  value: number;
  candidateId: string;
}

export * from './api';
export * from './database';
EOF
echo -e "${GREEN}✓${NC} Created types index"
fi

# Create API types if missing
if [ ! -f "packages/types/src/api.ts" ]; then
cat > packages/types/src/api.ts << 'EOF'
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
EOF
echo -e "${GREEN}✓${NC} Created API types"
fi

# Create database types if missing
if [ ! -f "packages/types/src/database.ts" ]; then
cat > packages/types/src/database.ts << 'EOF'
export interface DbPoll {
  id: string;
  source: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbCandidate {
  id: string;
  name: string;
  party: string;
  createdAt: Date;
  updatedAt: Date;
}
EOF
echo -e "${GREEN}✓${NC} Created database types"
fi

echo ""
echo "4. Creating placeholder files for missing components..."
echo "--------------------------------------------------------"

# Create a basic layout if missing
if [ ! -f "apps/web/app/layout.tsx" ]; then
  mkdir -p apps/web/app
cat > apps/web/app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Polling Dashboard - UltraThink',
  description: 'Advanced polling analytics with ML-powered predictions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOF
echo -e "${GREEN}✓${NC} Created layout.tsx"
fi

# Create globals.css if missing
if [ ! -f "apps/web/app/globals.css" ]; then
cat > apps/web/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
EOF
echo -e "${GREEN}✓${NC} Created globals.css"
fi

# Create basic page if missing
if [ ! -f "apps/web/app/page.tsx" ]; then
cat > apps/web/app/page.tsx << 'EOF'
'use client';

import { UltraThinkPanel } from '@/components/UltraThinkPanel';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Polling Dashboard</h1>
        <UltraThinkPanel />
      </div>
    </main>
  );
}
EOF
echo -e "${GREEN}✓${NC} Created page.tsx"
fi

echo ""
echo "5. Fixing package.json configurations..."
echo "-----------------------------------------"

# Ensure build script exists in packages/types
if [ -f "packages/types/package.json" ]; then
  if ! grep -q '"build":' packages/types/package.json; then
    # Add build script to package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('packages/types/package.json', 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.build = 'tsc';
    fs.writeFileSync('packages/types/package.json', JSON.stringify(pkg, null, 2));
    "
    echo -e "${GREEN}✓${NC} Added build script to @poll/types"
  fi
fi

echo ""
echo "6. Installing missing dependencies..."
echo "--------------------------------------"

# Check for missing peer dependencies
MISSING_DEPS=""

# Check common missing dependencies
if ! npm ls lucide-react 2>/dev/null | grep -q "lucide-react"; then
  MISSING_DEPS="$MISSING_DEPS lucide-react"
fi

if [ ! -z "$MISSING_DEPS" ]; then
  echo "Installing: $MISSING_DEPS"
  cd apps/web && npm install $MISSING_DEPS --save
  cd ../..
  echo -e "${GREEN}✓${NC} Installed missing dependencies"
else
  echo -e "${GREEN}✓${NC} All dependencies present"
fi

echo ""
echo "7. Creating Tailwind configuration if missing..."
echo "-------------------------------------------------"
if [ ! -f "apps/web/tailwind.config.js" ]; then
cat > apps/web/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
EOF
echo -e "${GREEN}✓${NC} Created tailwind.config.js"
fi

if [ ! -f "apps/web/postcss.config.js" ]; then
cat > apps/web/postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
echo -e "${GREEN}✓${NC} Created postcss.config.js"
fi

echo ""
echo "8. Creating basic API health endpoint..."
echo "-----------------------------------------"
if [ ! -f "apps/api/src/routes/health.ts" ]; then
cat > apps/api/src/routes/health.ts << 'EOF'
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    ultrathink: {
      mode: process.env.ULTRATHINK_MODE || 'standard',
      version: '1.0.0'
    }
  });
});

export default router;
EOF
echo -e "${GREEN}✓${NC} Created health endpoint"
fi

echo ""
echo "9. Verifying TypeScript configurations..."
echo "------------------------------------------"

# Create tsconfig for packages/types if missing
if [ ! -f "packages/types/tsconfig.json" ]; then
cat > packages/types/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
echo -e "${GREEN}✓${NC} Created types tsconfig.json"
fi

echo ""
echo "10. Running dependency installation..."
echo "---------------------------------------"
npm install --legacy-peer-deps 2>/dev/null || npm install
echo -e "${GREEN}✓${NC} Dependencies installed"

echo ""
echo "==============================="
echo -e "${GREEN}✅ Build fixes applied successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npm run build"
echo "2. If build still fails, check the error messages"
echo "3. Run: ./health-check.sh to verify system status"
echo ""