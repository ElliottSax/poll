# Sentry Integration Setup

## Overview

Sentry error monitoring is configured but requires package installation.

## Installation

```bash
npm install @sentry/nextjs --save --workspace=web
```

## Configuration

### 1. Update .env

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_org
SENTRY_PROJECT=poll-dashboard
```

### 2. Create sentry.client.config.ts

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
})
```

### 3. Create sentry.server.config.ts

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### 4. Update next.config.js

```javascript
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // your config
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
})
```

## Usage

The app is already configured to use Sentry via lib/sentry.ts.
Just install the package and add your DSN!

## Benefits

- Automatic error tracking
- Performance monitoring  
- Release tracking
- User feedback
- Source maps for debugging
