# Contributing to Polling Dashboard

First off, thank you for considering contributing to the Polling Dashboard! It's people like you that make this project a valuable resource for understanding election polling data.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

---

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- **Node.js** 20+ ([Install](https://nodejs.org/))
- **Python** 3.11+ ([Install](https://www.python.org/downloads/))
- **Docker Desktop** ([Install](https://www.docker.com/products/docker-desktop/))
- **Git** ([Install](https://git-scm.com/))

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/poll.git
   cd poll
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ElliottSax/poll.git
   ```

4. **Install dependencies:**
   ```bash
   # Install Node.js dependencies
   npm install

   # Install Python dependencies
   cd backend/ml-service
   pip install poetry
   poetry install
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

6. **Start local development environment:**
   ```bash
   docker-compose up -d
   npm run dev
   ```

7. **Verify setup:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Database GUI: http://localhost:8080

---

## Development Workflow

### Branch Strategy

We use **Git Flow** branching model:

```
main          Production-ready code
  ↓
develop       Integration branch for features
  ↓
feature/*     New features
bugfix/*      Bug fixes
hotfix/*      Critical production fixes
```

### Creating a Feature Branch

```bash
# Ensure you're on develop branch
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/add-demographic-filter

# Make changes and commit
git add .
git commit -m "feat: add demographic filter to race page"

# Push to your fork
git push origin feature/add-demographic-filter
```

### Commit Message Convention

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code restructuring (no feature/bug changes)
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Build process, dependencies, tooling

**Examples:**

```bash
# Feature
git commit -m "feat(forecast): add Monte Carlo simulation with 50K iterations"

# Bug fix
git commit -m "fix(api): resolve race condition in poll aggregation"

# Documentation
git commit -m "docs(readme): update quick start guide with Docker steps"

# Breaking change
git commit -m "feat(api)!: change forecast endpoint to return probabilities

BREAKING CHANGE: Forecast endpoint now returns win probabilities instead of margins."
```

### Keeping Your Fork Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream develop into your develop
git checkout develop
git merge upstream/develop

# Update your feature branch
git checkout feature/your-feature
git rebase develop
```

---

## Code Style

### TypeScript/JavaScript

We use **Prettier** (formatting) + **ESLint** (linting).

**Auto-format on save:**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**Run manually:**
```bash
npm run format      # Auto-fix formatting
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix linting issues
```

**Style Guidelines:**
- Use **functional components** with hooks (not class components)
- Prefer **named exports** over default exports
- Use **TypeScript strict mode** (no `any` types)
- **Arrow functions** for callbacks
- **Async/await** over promises (when possible)

**Example:**

```typescript
// ✅ Good
export function RaceCard({ race }: RaceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return <div onClick={handleClick}>...</div>;
}

// ❌ Bad
export default class RaceCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isExpanded: false };
  }

  handleClick() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  render() {
    return <div onClick={this.handleClick.bind(this)}>...</div>;
  }
}
```

---

### Python

We use **Black** (formatting) + **Ruff** (linting) + **Mypy** (type checking).

**Run manually:**
```bash
black .                # Auto-format
ruff check .           # Check for issues
ruff check --fix .     # Auto-fix issues
mypy .                 # Type checking
```

**Style Guidelines:**
- Follow **PEP 8** style guide
- Use **type hints** for all function signatures
- **Docstrings** for all public functions (Google style)
- **Max line length**: 100 characters
- Prefer **f-strings** over `.format()` or `%`

**Example:**

```python
# ✅ Good
def calculate_weighted_average(
    polls: list[Poll],
    weighting_method: str = "standard"
) -> float:
    """
    Calculate weighted average of poll results.

    Args:
        polls: List of Poll objects to aggregate
        weighting_method: Method for weighting polls ('standard' or 'bayesian')

    Returns:
        Weighted average percentage

    Raises:
        ValueError: If polls list is empty
    """
    if not polls:
        raise ValueError("Cannot calculate average of empty polls list")

    total_weight = sum(poll.weight for poll in polls)
    weighted_sum = sum(poll.pct * poll.weight for poll in polls)

    return weighted_sum / total_weight

# ❌ Bad
def calc_avg(polls, method="standard"):
    if not polls:
        raise ValueError("empty list")
    tw = sum([p.weight for p in polls])
    ws = sum([p.pct * p.weight for p in polls])
    return ws / tw
```

---

## Testing

### Write Tests for All New Code

**Test Coverage Requirements:**
- **Critical paths**: 95%+ coverage
- **Overall codebase**: 70%+ coverage
- **New features**: Must include tests

### Running Tests

```bash
# Backend (Python)
cd backend/ml-service
poetry run pytest                    # All tests
poetry run pytest tests/unit         # Unit tests only
poetry run pytest --cov=app          # With coverage

# Frontend (TypeScript)
npm run test                         # All tests
npm run test:unit                    # Unit tests only
npm run test:e2e                     # E2E tests
npm run test:coverage                # With coverage
```

### Test Structure

```typescript
// tests/unit/aggregation.test.ts
describe('Poll Aggregation', () => {
  describe('weighted average calculation', () => {
    it('weights recent polls more heavily', () => {
      // Arrange
      const polls = [
        { pct: 50, days_old: 1 },
        { pct: 40, days_old: 30 },
      ];

      // Act
      const result = calculateWeightedAverage(polls);

      // Assert
      expect(result).toBeGreaterThan(45);  // Closer to recent poll
      expect(result).toBeLessThan(50);
    });

    it('throws error for empty polls array', () => {
      expect(() => calculateWeightedAverage([])).toThrow();
    });
  });
});
```

---

## Pull Request Process

### Before Submitting

1. **Run tests locally:**
   ```bash
   npm run test
   npm run lint
   ```

2. **Update documentation** if needed

3. **Add changeset** for version tracking:
   ```bash
   npx changeset
   # Select packages changed
   # Choose version bump type (major/minor/patch)
   # Write summary of changes
   ```

4. **Self-review your code:**
   - Are variable names clear?
   - Is the logic easy to follow?
   - Are there any console.logs or debugger statements?
   - Is error handling comprehensive?

### Submitting Pull Request

1. **Push to your fork:**
   ```bash
   git push origin feature/your-feature
   ```

2. **Open PR on GitHub:**
   - Use descriptive title (follows conventional commits)
   - Fill out PR template completely
   - Link related issues (`Closes #123`)
   - Add screenshots/GIFs for UI changes
   - Mark as draft if work in progress

3. **PR Template:**

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran to verify your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
```

### Code Review Process

1. **Automated checks** must pass:
   - CI/CD pipeline (tests, linting)
   - Code coverage threshold (70%+)
   - No merge conflicts

2. **Human review** from maintainer:
   - Code quality and style
   - Logic correctness
   - Performance considerations
   - Security implications

3. **Address feedback:**
   - Make requested changes
   - Push updates to same branch
   - Respond to comments

4. **Approval & merge:**
   - Requires 1 approval from maintainer
   - Squash and merge into `develop`
   - Delete branch after merge

---

## Issue Guidelines

### Reporting Bugs

**Before submitting:**
- Search existing issues to avoid duplicates
- Try latest version to see if already fixed
- Collect reproduction steps

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g., macOS 14.1]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.2.3]

**Additional context**
Add any other context about the problem here.
```

---

### Suggesting Features

**Feature Request Template:**

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Would you like to work on this feature?**
- [ ] Yes, I'd like to implement this feature
- [ ] No, just suggesting
```

---

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `feature` | New feature or request |
| `documentation` | Improvements or additions to documentation |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention is needed |
| `priority: high` | Critical issue, needs immediate attention |
| `priority: low` | Nice to have, not urgent |
| `wontfix` | This will not be worked on |
| `duplicate` | This issue or pull request already exists |

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Discord** (Future): Real-time chat (planned for Month 6)
- **Twitter/X**: [@pollviz](https://twitter.com/pollviz) - Updates and announcements

### Getting Help

**For questions:**
1. Check [documentation](https://docs.pollviz.com)
2. Search [GitHub Discussions](https://github.com/ElliottSax/poll/discussions)
3. Ask in GitHub Discussions (don't open issue for questions)

**For bugs:**
1. Search existing issues
2. If not found, open new issue with bug report template

---

## Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for their contributions
- **About page** on the website (planned)

Top contributors may be invited as maintainers with commit access.

---

## Development Tips

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-playwright.playwright"
  ]
}
```

### Debugging

**Frontend (Next.js):**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

**Backend (Python):**
```json
{
  "name": "Python: FastAPI",
  "type": "python",
  "request": "launch",
  "module": "uvicorn",
  "args": ["app.main:app", "--reload"],
  "jinja": true
}
```

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_demographic_fields

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Common Workflows

**Adding new API endpoint:**

1. Define tRPC router in `apps/api/src/trpc/routers/`
2. Add input/output schemas with Zod
3. Implement handler logic
4. Write unit tests
5. Update API documentation
6. Add to frontend tRPC client

**Adding new component:**

1. Create component in `apps/web/components/`
2. Write component with TypeScript props
3. Add unit tests with React Testing Library
4. Add to Storybook (if UI component)
5. Use in page/feature

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

Reach out:
- **Email**: hello@pollviz.com
- **GitHub Discussions**: [Ask a question](https://github.com/ElliottSax/poll/discussions)

Thank you for contributing to Polling Dashboard! 🎉
