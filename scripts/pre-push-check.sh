#!/bin/bash
# Pre-push validation script for parallel development

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Pre-Push Validation${NC}"
echo ""

# Check branch name format
current_branch=$(git branch --show-current)
echo -e "${BLUE}Checking branch name...${NC}"

if [[ ! $current_branch =~ ^claude/poll-.*-[A-Za-z0-9]+$ ]]; then
    echo -e "${RED}❌ Invalid branch name format!${NC}"
    echo "   Current: $current_branch"
    echo "   Required: claude/poll-[feature]-[session-id]"
    echo ""
    echo "   Examples:"
    echo "     ✅ claude/poll-api-endpoints-ABC123"
    echo "     ✅ claude/poll-frontend-components-XYZ789"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Branch name format valid${NC}"
echo ""

# Type check
echo -e "${BLUE}Running type check...${NC}"
if npm run type-check 2>&1 | tee /tmp/typecheck.log; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${RED}❌ Type check failed${NC}"
    echo "   Fix type errors before pushing"
    exit 1
fi
echo ""

# Linting
echo -e "${BLUE}Running linter...${NC}"
if npm run lint 2>&1 | tee /tmp/lint.log; then
    echo -e "${GREEN}✅ Lint check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Lint issues found${NC}"
    echo "   Run 'npm run lint:fix' to auto-fix, or fix manually"
    read -p "Continue anyway? (y/n): " continue_lint
    if [ "$continue_lint" != "y" ]; then
        exit 1
    fi
fi
echo ""

# Check for common issues
echo -e "${BLUE}Checking for common issues...${NC}"

# Check for console.log
if git diff --cached | grep -q "console\.log"; then
    echo -e "${YELLOW}⚠️  Found console.log in staged files${NC}"
    read -p "Continue anyway? (y/n): " continue_console
    if [ "$continue_console" != "y" ]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ No console.log found${NC}"
fi

# Check for TODO comments
if git diff --cached | grep -q "TODO\|FIXME"; then
    echo -e "${YELLOW}⚠️  Found TODO/FIXME comments in staged files${NC}"
    read -p "Continue anyway? (y/n): " continue_todo
    if [ "$continue_todo" != "y" ]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ No TODO/FIXME comments found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All checks passed! Ready to push.${NC}"
echo ""
