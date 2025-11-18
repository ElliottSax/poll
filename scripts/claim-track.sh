#!/bin/bash
# Helper script to claim a work track for parallel development

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Track Claim Helper${NC}"
echo ""

# Show available tracks
echo -e "${YELLOW}Available Tracks:${NC}"
grep "^###.*Track" .claude/WORK_ASSIGNMENTS.md | grep -n "🟡 AVAILABLE" || echo "No available tracks found"
echo ""

# Ask for track number
read -p "Which track number do you want to claim? (2-8): " track_num

if [ -z "$track_num" ]; then
    echo -e "${RED}❌ No track number provided${NC}"
    exit 1
fi

# Ask for session ID
read -p "Enter your session ID (from branch name): " session_id

if [ -z "$session_id" ]; then
    echo -e "${RED}❌ No session ID provided${NC}"
    exit 1
fi

# Ask for instance name
read -p "Enter instance name (e.g., 'API Dev Instance #1'): " instance_name

if [ -z "$instance_name" ]; then
    instance_name="Claude Instance"
fi

# Get today's date
today=$(date +%Y-%m-%d)

echo ""
echo -e "${BLUE}📝 Summary:${NC}"
echo "  Track: $track_num"
echo "  Session ID: $session_id"
echo "  Instance: $instance_name"
echo "  Date: $today"
echo ""

read -p "Claim this track? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}✅ Track claimed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Manually update .claude/WORK_ASSIGNMENTS.md:"
echo "     - Change status from 🟡 AVAILABLE to 🔵 IN PROGRESS"
echo "     - Update 'Assigned To' field with: $instance_name"
echo "     - Add 'Started: $today'"
echo "  2. Commit the change:"
echo "     git add .claude/WORK_ASSIGNMENTS.md"
echo "     git commit -m \"claim: Track $track_num\""
echo "     git push"
echo "  3. Create your feature branch:"
echo "     git checkout -b claude/poll-track$track_num-$session_id"
echo ""
