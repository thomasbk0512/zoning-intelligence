# Install Auth Tooling & Run Release Script

**Version**: ui-v1.0.1  
**Date**: 2024-11-08

---

## Step 1: Install GitHub CLI (gh)

### macOS (Homebrew)
```bash
brew install gh
```

### Ubuntu/Debian
```bash
type -p curl >/dev/null || sudo apt-get install -y curl
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
  sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh -y
```

### Fedora
```bash
sudo dnf install 'dnf-command(config-manager)' -y
sudo dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
sudo dnf install gh -y
```

### Windows (Winget PowerShell)
```powershell
winget install --id GitHub.cli
```

### Quick Check
```bash
gh --version
```

---

## Step 2: Authenticate Once

```bash
gh auth login
# Choose: GitHub.com → HTTPS or SSH → authenticate via browser/SSH
```

Verify authentication:
```bash
gh auth status
```

### (Optional) Signed Tags

If you use signed tags:
```bash
# List GPG keys
gpg --list-secret-keys

# Configure signing key
git config user.signingkey <YOUR_GPG_KEY_ID>

# Modify script to use signed tags:
# Replace: git tag "${REL_TAG}"
# With: git tag -s "${REL_TAG}" -m "${REL_TAG}"
```

---

## Step 3: Run the Release

```bash
./EXECUTE_WITH_URL.sh <repo-url>
```

**Example:**
```bash
./EXECUTE_WITH_URL.sh https://github.com/username/zoning-intelligence.git
# OR
./EXECUTE_WITH_URL.sh git@github.com:username/zoning-intelligence.git
```

---

## Step 4: Post-Merge Validation

### Integration Tests (5 cases)
1. **APN success** → 11 fields render
2. **Lat/Lng success** → 11 fields render
3. **500 error** → error UI + Retry recovers
4. **Timeout** → skeletons → results
5. **Invalid input** → ARIA feedback works

### Lighthouse Audit (target ≥90)
```bash
cd ui
npm run build
npm run preview
# In another terminal:
npx lighthouse http://localhost:4173 \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=./lighthouse-report.html
```

**Target**: ≥90 in all categories

---

## Fallback: Manual Path (No gh CLI)

If GitHub CLI is not available:

```bash
# Configure remote
git remote remove origin 2>/dev/null || true
git remote add origin <repo-url>

# Push tags and branch
git push origin --tags
git push -u origin ui/v1.0.1

# Open a PR on GitHub UI from branch ui/v1.0.1 → main
# After CI passes and PR merges:

# Tag and push
git tag ui-v1.0.1
git push origin ui-v1.0.1

# Create the GitHub Release in the UI using ui/RELEASE_NOTES_v1.0.1.md
```

---

## Verification Checklist

After execution, verify:
- [ ] `gh --version` shows installed version
- [ ] `gh auth status` shows authenticated
- [ ] Tags visible on remote: `git ls-remote --tags origin | grep ui-v1.0.1`
- [ ] PR created and visible
- [ ] CI checks passing (all green)
- [ ] PR merged successfully
- [ ] Tag pushed: `git ls-remote --tags origin | grep ui-v1.0.1`
- [ ] Release published on GitHub
- [ ] 5/5 integration tests pass
- [ ] Lighthouse ≥90 (all categories)

---

## Done When

- [x] Remote configured & pushed
- [ ] PR merged with CI green
- [ ] ui-v1.0.1 tag + release live
- [ ] 5/5 integration cases pass
- [ ] Lighthouse ≥90

---

**Status**: Ready for Execution

**Last Updated**: 2024-11-08

