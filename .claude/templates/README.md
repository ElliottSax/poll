# 📝 Code Templates

This directory contains starter templates for common development tasks in the polling dashboard project.

## Available Templates

### 1. API Route Template (`api-route-template.ts`)

**For**: Track 2 - API Development
**Purpose**: Create new REST API endpoints with proper validation

**Features**:
- Request/response schema validation with Zod
- TypeScript type safety
- Pagination support
- Error handling
- Swagger/OpenAPI documentation
- Example CRUD operations

**Usage**:
```bash
# Copy template to your route file
cp .claude/templates/api-route-template.ts apps/api/src/routes/my-route.ts

# Customize the schemas and logic
# Register the route in apps/api/src/index.ts
```

**What to modify**:
- Schema definitions (QuerySchema, ParamsSchema, ResponseSchema)
- Route paths and methods
- Database queries
- Response data structures

---

### 2. React Component Template (`react-component-template.tsx`)

**For**: Track 3 - Frontend Components
**Purpose**: Create new React components with best practices

**Features**:
- TypeScript props interface
- State management with hooks
- Loading and error states
- Data fetching with React Query (commented example)
- Tailwind CSS styling
- JSDoc documentation
- Usage examples

**Usage**:
```bash
# Copy template to your component file
cp .claude/templates/react-component-template.tsx apps/web/components/features/MyComponent.tsx

# Customize props, logic, and styling
```

**What to modify**:
- Props interface
- Component logic
- Styling classes
- Data fetching queries
- Event handlers

---

### 3. Data Scraper Template (`scraper-template.ts`)

**For**: Track 4 - Data Scrapers
**Purpose**: Create web scrapers for polling data sources

**Features**:
- Base scraper class with common utilities
- Retry logic and error handling
- Rate limiting
- Data validation
- Duplicate detection
- Cheerio HTML parsing
- Example implementation

**Usage**:
```bash
# Copy template to your scraper file
cp .claude/templates/scraper-template.ts apps/api/src/scrapers/my-source-scraper.ts

# Extend BaseScraper class for your data source
```

**What to modify**:
- Base URL and configuration
- HTML parsing selectors
- Data extraction logic
- Validation rules
- Database save logic

---

## Template Best Practices

### General Guidelines

1. **Always copy, never modify templates directly**
   ```bash
   cp .claude/templates/template.ts your-new-file.ts
   ```

2. **Keep templates up-to-date**
   - If you find a better pattern, update the template
   - Commit template improvements separately

3. **Follow naming conventions**
   - API routes: `kebab-case.ts` (e.g., `poll-results.ts`)
   - Components: `PascalCase.tsx` (e.g., `PollChart.tsx`)
   - Scrapers: `source-scraper.ts` (e.g., `realclearpolitics-scraper.ts`)

4. **Document as you go**
   - Update JSDoc comments
   - Add usage examples
   - Explain complex logic

### Customization Checklist

When using a template, ensure you:

- [ ] Rename the file appropriately
- [ ] Update all interface/type names
- [ ] Modify schema/props definitions
- [ ] Implement actual business logic
- [ ] Remove example/placeholder code
- [ ] Update comments and documentation
- [ ] Add appropriate error handling
- [ ] Write tests (if applicable)
- [ ] Register/import in parent files

### TypeScript Tips

**Prefer type safety**:
```typescript
// Good
const result: PollData = await fetchPoll(id)

// Avoid
const result: any = await fetchPoll(id)
```

**Use Zod for runtime validation**:
```typescript
import { z } from 'zod'

const PollSchema = z.object({
  pollster: z.string().min(1),
  date: z.date(),
  // ... more fields
})

// Parse and validate
const poll = PollSchema.parse(rawData)
```

**Leverage inference**:
```typescript
const Schema = z.object({ ... })
type InferredType = z.infer<typeof Schema>
```

### React Component Tips

**Use composition**:
```tsx
// Good - composable
<Card>
  <CardHeader title="Poll Results" />
  <CardContent>{children}</CardContent>
</Card>

// Avoid - monolithic
<PollResultsCard data={data} title="..." content={...} />
```

**Extract custom hooks**:
```tsx
// Custom hook
function usePollData(pollId: string) {
  return useQuery(['poll', pollId], () => fetchPoll(pollId))
}

// In component
function PollDetail({ pollId }: Props) {
  const { data, isLoading } = usePollData(pollId)
  // ...
}
```

### Scraper Tips

**Handle edge cases**:
- Missing data
- Format changes
- Rate limiting (429 errors)
- Network timeouts
- Invalid data

**Log extensively**:
```typescript
console.log('Scraping started:', new Date())
console.log('Polls found:', pollCount)
console.error('Parsing failed:', error)
```

**Test with sample data**:
```typescript
// Save HTML samples for testing
const sampleHtml = await fs.readFile('test-data/sample.html')
const parsed = scraper.parseHtml(sampleHtml)
```

---

## Adding New Templates

Found a useful pattern? Add a new template!

1. Create the template file in `.claude/templates/`
2. Add comprehensive comments and examples
3. Update this README with:
   - Template description
   - Use case
   - Features
   - Usage instructions
   - Customization guidance
4. Commit with clear message:
   ```bash
   git add .claude/templates/
   git commit -m "feat: add [template name] template"
   ```

---

## Template Maintenance

### When to Update Templates

- Bug fixes in template code
- Better patterns discovered
- New best practices
- Dependency updates
- User feedback

### How to Update

1. Discuss in PR/issue first
2. Update template file
3. Update this README
4. Notify active developers
5. Consider migrating existing code

---

## Questions?

- Check main docs: `../PARALLEL_DEV_GUIDE.md`
- Review existing implementations in codebase
- Ask in PR comments or issues

---

**Happy coding with templates! 🚀**
