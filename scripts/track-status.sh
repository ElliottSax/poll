#!/bin/bash
# Display current status of all work tracks

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}    📋 Parallel Development Track Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Parse WORK_ASSIGNMENTS.md and display summary
if [ ! -f ".claude/WORK_ASSIGNMENTS.md" ]; then
    echo -e "${RED}❌ WORK_ASSIGNMENTS.md not found${NC}"
    exit 1
fi

# Count tracks by status
in_progress=$(grep -c "🔵 IN PROGRESS" .claude/WORK_ASSIGNMENTS.md || echo "0")
available=$(grep -c "🟡 AVAILABLE" .claude/WORK_ASSIGNMENTS.md || echo "0")
complete=$(grep -c "✅ COMPLETE" .claude/WORK_ASSIGNMENTS.md || echo "0")
review=$(grep -c "🟢 REVIEW" .claude/WORK_ASSIGNMENTS.md || echo "0")
blocked=$(grep -c "🔴 BLOCKED" .claude/WORK_ASSIGNMENTS.md || echo "0")

echo -e "${YELLOW}Status Summary:${NC}"
echo -e "  🔵 In Progress: $in_progress"
echo -e "  🟡 Available:   $available"
echo -e "  🟢 In Review:   $review"
echo -e "  ✅ Complete:    $complete"
echo -e "  🔴 Blocked:     $blocked"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Display each track
awk '
/^### / {
    if (track != "") {
        print ""
    }
    track = $0
    gsub(/^### /, "", track)
    print "  " track
}
/^\*\*Status\*\*:/ {
    status = $0
    gsub(/^\*\*Status\*\*: /, "", status)
    print "    Status:     " status
}
/^\*\*Assigned To\*\*:/ {
    assigned = $0
    gsub(/^\*\*Assigned To\*\*: /, "", assigned)
    print "    Assigned:   " assigned
}
/^\*\*Branch\*\*:/ {
    branch = $0
    gsub(/^\*\*Branch\*\*: /, "", branch)
    print "    Branch:     " branch
}
/^\*\*Started\*\*:/ {
    started = $0
    gsub(/^\*\*Started\*\*: /, "", started)
    print "    Started:    " started
}
' .claude/WORK_ASSIGNMENTS.md

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Open .claude/WORK_ASSIGNMENTS.md to see full details"
echo ""
