# Package.json Overrides Configuration

This document describes the recommended overrides to add to your `package.json` to fix the identified vulnerabilities.

## Instructions

1. Open your `package.json` file in the root directory
2. Add the following section (or merge with existing `"overrides"`):

```json
{
  "name": "vellera-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "test": "vitest",
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "security:check": "bash ./scripts/audit-security.sh"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-quill": "^2.0.0",
    "framer-motion": "^11.16.4",
    "recharts": "^2.15.4",
    "dompurify": "^3.3.3"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.0.0"
  },
  "overrides": {
    "picomatch": ">=4.0.4",
    "socket.io-parser": ">=4.2.6"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=10.0.0"
  },
  "packageManager": "npm@10.0.0"
}
```

## What Each Override Does

### `picomatch@>=4.0.4`
- **Issue:** CVE-2026-33671 (HIGH), CVE-2026-33672 (MEDIUM)
- **Impact:** Fixes glob pattern matching vulnerabilities
- **Affected Versions:** 2.3.1, 4.0.3
- **Why:** Ensures all transitive dependencies use the patched version

### `socket.io-parser@>=4.2.6`
- **Issue:** CVE-2026-33151 (HIGH)
- **Impact:** Fixes WebSocket message parsing vulnerabilities
- **Affected Version:** 4.2.5
- **Why:** Prevents real-time protocol exploitation

## Implementation Steps

```bash
# 1. Edit package.json with the overrides above
nano package.json

# 2. Clean dependencies
rm -rf node_modules package-lock.json

# 3. Reinstall with new overrides
npm install

# 4. Verify fixes
npm audit
npm ls picomatch socket.io-parser

# 5. Commit changes
git add package.json package-lock.json
git commit -m "fix: add npm overrides for CVE-2026-33671, CVE-2026-33151"
git push
```

## Handling react-quill & Quill Vulnerability

### Option 1: Update to Latest (Recommended)

```json
{
  "dependencies": {
    "react-quill": "^2.0.0"  // Already should use quill 2.x
  }
}
```

Then:
```bash
npm install react-quill@latest
npm audit
```

### Option 2: If Quill 1.x Still Required

Add DOMPurify for protection:

```json
{
  "dependencies": {
    "react-quill": "^2.0.0",
    "dompurify": "^3.3.3"
  }
}
```

Then use the sanitization utilities from `lib/quillSecurity.js`:

```javascript
import { sanitizeQuillContent } from '@/lib/quillSecurity';

const handleChange = (content) => {
  const safe = sanitizeQuillContent(content);
  onChange(safe);
};
```

## Verification

After implementing overrides, verify:

```bash
# Check vulnerabilities are gone
npm audit --json | jq '.metadata.vulnerabilities'

# Should output:
# {
#   "total": 0,
#   "high": 0,
#   "critical": 0
# }

# List all picomatch instances
npm ls picomatch

# Should show only >=4.0.4

# List all socket.io-parser instances
npm ls socket.io-parser

# Should show only >=4.2.6
```

## Troubleshooting

### If you get version conflicts:

```bash
# Force resolution
npm install --force

# Or check what's pulling in the old versions
npm ls picomatch
npm ls socket.io-parser
```

### If a package requires an older version:

Update the package requiring it, or:

```bash
# Check which package needs the old version
npm ls picomatch:4.0.3

# That will show the dependent package
```

Then update that dependent package:

```bash
npm update package-that-depends-on-it
```

## Continuous Monitoring

After implementing these overrides:

1. **Enable Dependabot** (`.github/dependabot.yml` already created)
2. **Run security audits regularly:**
   ```bash
   npm run audit
   ```
3. **Check weekly:**
   ```bash
   npm audit --production
   ```

## Additional Resources

- [npm audit documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [npm overrides documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides)
- [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates)
- [CVE-2026-33671](https://avd.aquasec.com/nvd/cve-2026-33671)
- [CVE-2026-33151](https://avd.aquasec.com/nvd/cve-2026-33151)