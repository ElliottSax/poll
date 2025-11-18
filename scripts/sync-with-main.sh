#!/bin/bash
# Sync feature branch with main branch

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Sync with Main Branch${NC}"
echo ""

# Get current branch
current_branch=$(git branch --show-current)

if [ "$current_branch" == "main" ] || [ "$current_branch" == "master" ]; then
    echo -e "${RED}❌ You are on the main branch!${NC}"
    echo "   Switch to your feature branch first"
    exit 1
fi

echo "Current branch: $current_branch"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ You have uncommitted changes!${NC}"
    echo "   Commit or stash your changes first"
    exit 1
fi

echo -e "${BLUE}Fetching latest changes...${NC}"
git fetch origin main

echo ""
echo -e "${BLUE}Rebasing on main...${NC}"
if git rebase origin/main; then
    echo -e "${GREEN}✅ Successfully synced with main${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Test your changes still work"
    echo "  2. Force push if needed: git push --force-with-lease"
else
    echo -e "${RED}❌ Rebase failed - conflicts detected${NC}"
    echo ""
    echo -e "${YELLOW}To resolve:${NC}"
    echo "  1. Fix conflicts in the affected files"
    echo "  2. Run: git add <resolved-files>"
    echo "  3. Run: git rebase --continue"
    echo "  4. Or abort: git rebase --abort"
fi
