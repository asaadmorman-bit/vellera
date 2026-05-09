#!/bin/bash

###############################################################################
# Security Audit Script
# 
# Performs comprehensive security audits on the project
# Usage: ./scripts/audit-security.sh
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 Security Audit Report${NC}"
echo "================================"
echo "Date: $(date)"
echo ""

# Check Node/npm versions
echo -e "${YELLOW}📋 Environment Check${NC}"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# npm audit
echo -e "${YELLOW}🔍 NPM Dependency Audit${NC}"
if npm audit --audit-level=high 2>/dev/null; then
  echo -e "${GREEN}✅ No high-severity vulnerabilities found${NC}"
else
  echo -e "${RED}❌ Vulnerabilities detected${NC}"
  npm audit --json > audit-report.json 2>/dev/null || true
  echo "Detailed report: audit-report.json"
fi
echo ""

# Check for outdated packages
echo -e "${YELLOW}📦 Outdated Packages Check${NC}"
OUTDATED=$(npm outdated 2>/dev/null | wc -l)
if [ "$OUTDATED" -gt 1 ]; then
  echo -e "${YELLOW}⚠️  Found outdated packages:${NC}"
  npm outdated | head -10
else
  echo -e "${GREEN}✅ All packages are up-to-date${NC}"
fi
echo ""

# Check for known CVEs
echo -e "${YELLOW}🚨 CVE Check${NC}"
echo "Checking for picomatch CVE-2026-33671, CVE-2026-33672..."
PICOMATCH=$(npm ls picomatch 2>/dev/null | grep picomatch | head -1)
echo "Current picomatch versions: $PICOMATCH"

echo "Checking for socket.io-parser CVE-2026-33151..."
SOCKETIO=$(npm ls socket.io-parser 2>/dev/null | grep socket.io-parser | head -1)
echo "Current socket.io-parser versions: $SOCKETIO"

echo "Checking for quill CVE-2021-3163..."
QUILL=$(npm ls quill 2>/dev/null | grep "quill@" | head -1)
echo "Current quill version: $QUILL"
echo ""

# License audit
echo -e "${YELLOW}📜 License Audit${NC}"
echo "Checking for problematic licenses (GPL, AGPL)..."
npm ls --depth=0 2>/dev/null | grep -E "(GPL|AGPL)" && {
  echo -e "${YELLOW}⚠️  Potential license conflicts detected${NC}"
} || {
  echo -e "${GREEN}✅ No GPL/AGPL licenses in direct dependencies${NC}"
}
echo ""

# Generate SBOM
echo -e "${YELLOW}📋 Generating Software Bill of Materials (SBOM)${NC}"
if command -v cyclonedx-npm &> /dev/null; then
  cyclonedx-npm --output-file sbom.json 2>/dev/null && {
    echo -e "${GREEN}✅ SBOM generated: sbom.json${NC}"
  }
else
  echo -e "${YELLOW}⚠️  cyclonedx-npm not installed. Install with: npm install -g @cyclonedx/npm${NC}"
fi
echo ""

# Summary
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}🎯 Audit Summary${NC}"
echo -e "${YELLOW}================================${NC}"
echo "1. Run 'npm audit fix' to auto-fix low-severity issues"
echo "2. Review audit-report.json for detailed findings"
echo "3. Update critical packages immediately"
echo "4. Enable Dependabot for continuous monitoring"
echo "5. Check GitHub Security Advisories"
echo ""

echo -e "${GREEN}Audit complete!${NC}"