# 📝 Best Practices & Code Standards

Coding standards and best practices for the polling dashboard project.

---

## 🎯 General Principles

### 1. Write Self-Documenting Code

```typescript
// ❌ Bad - unclear variable name
const d = new Date()
const x = polls.filter(p => p.s > 1000)

// ✅ Good - clear, descriptive names
const currentDate = new Date()
const pollsWithLargeSample = polls.filter(poll => poll.sampleSize > 1000)
```

### 2. Keep Functions Small and Focused

```typescript
// ❌ Bad - function does too many things
function processPoll(poll: any) {
  // validate
  // transform
  // save
  // send notification
  // update cache
  // log
}

// ✅ Good - single responsibility
function validatePoll(poll: Poll): boolean { ... }
function transformPoll(poll: RawPoll): Poll { ... }
function savePoll(poll: Poll): Promise<void> { ... }
```

### 3. Use TypeScript Strictly

```typescript
// ❌ Bad - using any
function getPoll(id: any): any {
  return polls.find(p => p.id === id)
}

// ✅ Good - proper types
function getPoll(id: string): Poll | undefined {
  return polls.find(poll => poll.id === id)
}
```

---

## 🏗️ Architecture Patterns

### API Layer (Track 2)

#### Route Handler Pattern

```typescript
// ✅ Good structure
fastify.get<{ Querystring: QueryType, Reply: ResponseType }>(
  '/endpoint',
  {
    schema: { /* OpenAPI schema */ },
  },
  async (request, reply) => {
    // 1. Validate input (automatic with schema)
    const query = QuerySchema.parse(request.query)

    // 2. Check cache
    const cached = await cache.get(cacheKey)
    if (cached) return reply.send(cached)

    // 3. Query database
    const data = await prisma.model.findMany({ ... })

    // 4. Transform if needed
    const response = transformData(data)

    // 5. Cache result
    await cache.set(cacheKey, response, ttl)

    // 6. Return response
    return reply.send(response)
  }
)
```

#### Error Handling

```typescript
// ✅ Good error handling
try {
  const poll = await prisma.poll.findUnique({ where: { id } })

  if (!poll) {
    return reply.code(404).send({
      error: 'Not Found',
      message: 'Poll not found',
      statusCode: 404,
    })
  }

  return reply.send(poll)

} catch (error) {
  if (error instanceof z.ZodError) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: 'Invalid request',
      details: error.errors,
      statusCode: 400,
    })
  }

  fastify.log.error(error)
  return reply.code(500).send({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  })
}
```

### Frontend Layer (Track 3)

#### Component Structure

```typescript
// ✅ Good component structure
'use client'

// 1. Imports
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Types
interface ComponentProps {
  title: string
  onAction?: () => void
}

// 3. Component
export function Component({ title, onAction }: ComponentProps) {
  // 4. Hooks (useState, useEffect, useQuery, etc.)
  const [loading, setLoading] = useState(false)
  const { data } = useQuery({ ... })

  // 5. Event handlers
  const handleClick = () => { ... }

  // 6. Effects
  useEffect(() => { ... }, [])

  // 7. Early returns (loading, error, empty states)
  if (loading) return <LoadingSpinner />
  if (!data) return <EmptyState />

  // 8. Main render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

#### Custom Hooks

```typescript
// ✅ Extract reusable logic into custom hooks
function usePollData(raceId: string) {
  return useQuery({
    queryKey: ['race', raceId, 'polls'],
    queryFn: () => fetchRacePolls(raceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Usage
function PollList({ raceId }: Props) {
  const { data, isLoading, error } = usePollData(raceId)
  // ...
}
```

### Database Layer (Track 6)

#### Schema Design

```prisma
// ✅ Good schema practices
model Poll {
  // Primary key
  id        String   @id @default(uuid())

  // Required fields
  pollDate  DateTime
  sampleSize Int

  // Optional fields
  sponsor   String?

  // Foreign keys with clear names
  race      Race     @relation(fields: [raceId], references: [id])
  raceId    String

  // Indexes for performance
  @@index([raceId])
  @@index([pollDate])
  @@index([raceId, pollDate])

  // Constraints
  @@check(sampleSize > 0, name: "positive_sample")
}
```

#### Database Queries

```typescript
// ✅ Good query patterns
// Use select to limit fields
const polls = await prisma.poll.findMany({
  where: { raceId },
  select: {
    id: true,
    pollDate: true,
    pollster: {
      select: { name: true, rating: true }
    }
  },
  take: 10,
  orderBy: { pollDate: 'desc' }
})

// Use transactions for related operations
await prisma.$transaction(async (tx) => {
  const poll = await tx.poll.create({ data: pollData })
  await tx.pollResult.createMany({ data: results })
})
```

---

## 🎨 Code Style

### TypeScript

```typescript
// ✅ Use const for values that don't change
const API_URL = 'https://api.example.com'

// ✅ Use let for values that change
let count = 0

// ❌ Don't use var
var x = 10  // Never use var!

// ✅ Use arrow functions for callbacks
polls.map(poll => poll.pollster)
polls.filter(poll => poll.sampleSize > 1000)

// ✅ Use async/await instead of promises
async function fetchPoll(id: string): Promise<Poll> {
  const response = await fetch(`/api/polls/${id}`)
  return response.json()
}

// ✅ Use optional chaining and nullish coalescing
const rating = pollster?.rating ?? 'N/A'
const count = data?.polls?.length ?? 0
```

### React/JSX

```typescript
// ✅ Use fragments instead of unnecessary divs
<>
  <Header />
  <Content />
</>

// ✅ Use conditional rendering
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{data && <PollTable polls={data} />}

// ✅ Use key prop for lists
{polls.map(poll => (
  <PollCard key={poll.id} poll={poll} />
))}

// ✅ Extract complex conditions
const shouldShowWarning = poll.sampleSize < 500 || poll.marginOfError > 5
{shouldShowWarning && <Warning />}
```

### CSS/Tailwind

```typescript
// ✅ Use Tailwind utility classes
<div className="flex items-center gap-4 p-4 rounded-lg bg-white shadow">

// ✅ Use responsive prefixes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ Group related utilities
<button className="
  px-4 py-2 rounded
  bg-blue-600 hover:bg-blue-700
  text-white font-medium
  focus:outline-none focus:ring-2 focus:ring-blue-500
  disabled:opacity-50
">

// ✅ Extract common styles to components
const buttonVariants = cva('base-styles', {
  variants: { /* ... */ }
})
```

---

## 🧪 Testing Standards

### Unit Tests

```typescript
// ✅ Good test structure
describe('PollCard', () => {
  // Group related tests
  describe('rendering', () => {
    it('should display poll data correctly', () => {
      const poll = createMockPoll()
      render(<PollCard poll={poll} />)

      expect(screen.getByText(poll.pollster)).toBeInTheDocument()
      expect(screen.getByText(poll.sampleSize)).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const onClick = jest.fn()
      render(<PollCard poll={mockPoll} onClick={onClick} />)

      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })
})
```

### Integration Tests

```typescript
// ✅ Test the full flow
describe('Polls API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  it('should create and retrieve a poll', async () => {
    // Create
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/polls',
      payload: pollData,
    })
    expect(createResponse.statusCode).toBe(201)

    // Retrieve
    const id = createResponse.json().id
    const getResponse = await app.inject({
      method: 'GET',
      url: `/api/polls/${id}`,
    })
    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json()).toMatchObject(pollData)
  })
})
```

---

## 📝 Documentation

### Function Comments

```typescript
/**
 * Calculate weighted average of poll results
 *
 * @param polls - Array of polls to average
 * @param weights - Optional custom weights for each poll
 * @returns Weighted average as percentage (0-100)
 *
 * @example
 * const average = calculateWeightedAverage(polls)
 * console.log(`Average: ${average}%`)
 */
function calculateWeightedAverage(
  polls: Poll[],
  weights?: number[]
): number {
  // Implementation
}
```

### Component Documentation

```typescript
/**
 * PollCard - Display poll data in a card format
 *
 * Features:
 * - Shows pollster, date, sample size
 * - Displays candidates with percentages
 * - Color-coded by party
 * - Responsive design
 *
 * @example
 * <PollCard
 *   poll={poll}
 *   onClick={() => console.log('clicked')}
 * />
 */
export function PollCard({ poll, onClick }: PollCardProps) {
  // ...
}
```

---

## 🔒 Security Best Practices

### Input Validation

```typescript
// ✅ Always validate user input
const QuerySchema = z.object({
  page: z.coerce.number().min(1).max(1000),
  limit: z.coerce.number().min(1).max(100),
  search: z.string().max(100).optional(),
})

const query = QuerySchema.parse(request.query)
```

### SQL Injection Prevention

```typescript
// ✅ Use Prisma (parameterized queries)
const polls = await prisma.poll.findMany({
  where: { pollster: request.query.pollster }
})

// ❌ Never use raw SQL with user input
const polls = await prisma.$queryRaw`
  SELECT * FROM polls WHERE pollster = ${userInput}
` // Dangerous!
```

### XSS Prevention

```typescript
// ✅ React escapes by default
<div>{poll.pollster}</div>  // Safe

// ⚠️ Only use dangerouslySetInnerHTML if absolutely necessary
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

---

## ⚡ Performance

### Database Queries

```typescript
// ✅ Use indexes
@@index([raceId, pollDate])

// ✅ Limit results
take: 20

// ✅ Select only needed fields
select: { id: true, name: true }

// ✅ Use pagination
skip: (page - 1) * limit,
take: limit
```

### API Caching

```typescript
// ✅ Cache expensive queries
const cacheKey = `polls:${raceId}:${page}`
const cached = await redis.get(cacheKey)
if (cached) return cached

const data = await fetchData()
await redis.set(cacheKey, data, 300) // 5 min TTL
```

### React Performance

```typescript
// ✅ Use React.memo for expensive components
export const PollCard = React.memo(function PollCard({ poll }: Props) {
  // ...
})

// ✅ Use useMemo for expensive calculations
const average = useMemo(
  () => calculateAverage(polls),
  [polls]
)

// ✅ Use useCallback for event handlers passed to children
const handleClick = useCallback(
  () => onClick(poll.id),
  [poll.id, onClick]
)
```

---

## 📦 Dependencies

### Adding New Dependencies

```bash
# Before adding a dependency, ask:
# 1. Is it really needed?
# 2. Is it well-maintained?
# 3. Is it the right size?
# 4. Are there security issues?

# Check package info
npm info package-name

# Check bundle size
npx bundle-phobia package-name

# Add to correct workspace
cd apps/api
npm install package-name

# Commit package.json AND package-lock.json
git add package.json package-lock.json
git commit -m "deps: add package-name for [reason]"
```

---

## 🔍 Code Review Checklist

Before marking your work complete:

### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states implemented

### Code Quality
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code is readable and well-organized
- [ ] No console.log or debug code
- [ ] No commented-out code
- [ ] Functions are small and focused

### Testing
- [ ] Unit tests written
- [ ] Tests pass
- [ ] Coverage >80%
- [ ] Integration tests for critical paths

### Documentation
- [ ] Complex logic documented
- [ ] API endpoints documented
- [ ] Component props documented
- [ ] README updated if needed

### Performance
- [ ] No unnecessary re-renders
- [ ] Database queries optimized
- [ ] Caching implemented where appropriate
- [ ] No memory leaks

### Security
- [ ] Input validated
- [ ] No XSS vulnerabilities
- [ ] No SQL injection risks
- [ ] Secrets not committed

---

## 🎯 Commit Message Format

Use conventional commits:

```bash
# Format: <type>(<scope>): <description>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation only
style:    # Code style (formatting, etc.)
refactor: # Code refactoring
test:     # Adding tests
chore:    # Maintenance

# Examples:
git commit -m "feat(api): add polls filtering endpoint"
git commit -m "fix(ui): resolve mobile menu overflow"
git commit -m "docs: update API documentation"
git commit -m "test(scrapers): add RCP scraper tests"
git commit -m "refactor(components): extract PollCard logic"
git commit -m "chore(deps): update dependencies"
```

---

## 📚 Resources

- TypeScript: https://www.typescriptlang.org/docs/
- React: https://react.dev/
- Fastify: https://www.fastify.io/docs/
- Prisma: https://www.prisma.io/docs/
- Tailwind: https://tailwindcss.com/docs

---

**Write clean code, test thoroughly, document well! 🚀**
