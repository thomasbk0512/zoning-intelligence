# Post-v1.0.0 Roadmap

## Priority Tiers

### P0: Critical (Weeks 1-2)
### P1: High (Weeks 3-4)
### P2: Medium (Weeks 5-8)
### P3: Nice-to-have (Weeks 9+)

---

## P0: Critical Foundation

### 1. Integrate Real Austin Datasets
**Owner**: Data Engineering  
**Milestone**: Replace synthetic data with real parcels/zoning layers  
**Verification**: 
- Real APNs return valid zones
- 20 golden tests updated with real data
- Data versioning in place

**Tasks**:
- [ ] Source official Austin parcel GeoJSON/Shapefile
- [ ] Source official zoning districts layer
- [ ] Validate CRS and field mappings
- [ ] Update `scripts/generate_samples.py` → `scripts/load_real_data.py`
- [ ] Update golden test fixtures

**Acceptance**: `make test` passes with real data

---

### 2. Set Up CI: Lint, Tests
**Owner**: DevOps  
**Milestone**: Automated testing on every commit  
**Verification**: CI green on PRs

**Tasks**:
- [ ] GitHub Actions workflow (`.github/workflows/ci.yml`)
- [ ] Lint: `ruff` or `black` + `flake8`
- [ ] Type checking: `mypy` (optional)
- [ ] Test matrix: Python 3.9, 3.10, 3.11
- [ ] Badge in README

**Acceptance**: PR requires green CI

---

### 3. Backup Golden Tests and Data
**Owner**: Data Engineering  
**Milestone**: Versioned test fixtures  
**Verification**: Tests reproducible across environments

**Tasks**:
- [ ] Archive golden JSONs in `tests/golden/`
- [ ] Version data files (git LFS or separate repo)
- [ ] Document data sources and versions
- [ ] Add `make backup-data` target

**Acceptance**: Fresh clone can run all tests

---

## P1: High Value

### 4. Add CLI Help and Examples
**Owner**: Documentation  
**Milestone**: Self-documenting CLI  
**Verification**: `--help` shows examples

**Tasks**:
- [ ] Rich `argparse` help text
- [ ] Example commands in docstrings
- [ ] `zoning.py --examples` flag
- [ ] Update README with usage examples

**Acceptance**: New users can run CLI without docs

---

### 5. Build YAML Rules Validator
**Owner**: Engine Team  
**Milestone**: Validate rule files before runtime  
**Verification**: Invalid YAML rejected with clear errors

**Tasks**:
- [ ] `scripts/validate_rules.py`
- [ ] Schema validation (JSON Schema or Pydantic)
- [ ] Check required fields, types, ranges
- [ ] Integrate into CI

**Acceptance**: `make validate-rules` catches errors

---

### 6. Add Telemetry and Error Logging
**Owner**: Observability  
**Milestone**: Structured logging and metrics  
**Verification**: Errors logged with context

**Tasks**:
- [ ] Structured logging (JSON format)
- [ ] Error tracking (Sentry or local files)
- [ ] Runtime metrics (prometheus or simple CSV)
- [ ] `--log-level` flag

**Acceptance**: Errors include stack traces + context

---

## P2: Medium Priority

### 7. Implement Robust PDF Anchors
**Owner**: Parsers Team  
**Milestone**: Reliable code section extraction  
**Verification**: 90%+ citation accuracy

**Tasks**:
- [ ] Improve regex patterns for § citations
- [ ] Multi-page section detection
- [ ] Table of contents parsing
- [ ] Validate extracted snippets

**Acceptance**: Golden tests include PDF citations

---

### 8. Add Additional Jurisdiction Configs
**Owner**: Product  
**Milestone**: Support 2+ jurisdictions  
**Verification**: CLI works with `--city` flag

**Tasks**:
- [ ] Template for new jurisdictions
- [ ] Add San Francisco or similar
- [ ] Document jurisdiction setup process
- [ ] Update `JURISDICTIONS` config

**Acceptance**: `--city sf` returns valid output

---

### 9. Performance Profiling; Target P95≤5s
**Owner**: Performance  
**Milestone**: Sub-5s runtime for 95th percentile  
**Verification**: Profiling report shows bottlenecks

**Tasks**:
- [ ] Add `cProfile` integration
- [ ] Benchmark with 100+ parcels
- [ ] Optimize spatial queries (indexing)
- [ ] Cache layer for repeated queries
- [ ] `--profile` flag

**Acceptance**: P95 runtime ≤5s on test dataset

---

### 10. Package pip-installable CLI
**Owner**: Distribution  
**Milestone**: `pip install zoning-intelligence`  
**Verification**: Installable from PyPI or local wheel

**Tasks**:
- [ ] `setup.py` or `pyproject.toml`
- [ ] Entry point: `zoning` command
- [ ] Package structure
- [ ] Version management
- [ ] Test installation

**Acceptance**: `pip install . && zoning --help` works

---

### 11. Dockerfile for Reproducible Runs
**Owner**: DevOps  
**Milestone**: Containerized execution  
**Verification**: Docker image runs tests

**Tasks**:
- [ ] Multi-stage Dockerfile
- [ ] Base image: Python 3.11
- [ ] Copy data and rules
- [ ] Entrypoint: `zoning.py`
- [ ] `.dockerignore`

**Acceptance**: `docker run zoning-intelligence --help` works

---

## P3: Nice-to-Have

### 12. Enable Optional LLM Parsing Mode
**Owner**: Parsers Team  
**Milestone**: `--llm` flag uses OpenAI API  
**Verification**: LLM extracts citations when enabled

**Tasks**:
- [ ] Implement `parsers/llm.py` (currently stub)
- [ ] OpenAI API integration
- [ ] Fallback to regex if LLM fails
- [ ] Cost tracking
- [ ] Rate limiting

**Acceptance**: `--llm` improves citation accuracy

---

### 13. Document Contribution and Releases
**Owner**: Documentation  
**Milestone**: CONTRIBUTING.md and release process  
**Verification**: Contributors can submit PRs

**Tasks**:
- [ ] `CONTRIBUTING.md` with guidelines
- [ ] Release process doc
- [ ] Changelog format (CHANGELOG.md)
- [ ] Code of conduct (optional)

**Acceptance**: External PR follows process

---

### 14. Secrets Management, Config Isolation
**Owner**: Security  
**Milestone**: API keys in env vars, not code  
**Verification**: No secrets in git

**Tasks**:
- [ ] `.env` file support (python-dotenv)
- [ ] Remove hardcoded paths
- [ ] Config file: `config.yaml` or `settings.toml`
- [ ] Document required env vars

**Acceptance**: `git grep` finds no API keys

---

### 15. Choose License; Add NOTICE
**Owner**: Legal/Product  
**Milestone**: License file and attributions  
**Verification**: LICENSE and NOTICE files present

**Tasks**:
- [ ] Choose license (MIT, Apache 2.0, etc.)
- [ ] Add `LICENSE` file
- [ ] `NOTICE` for third-party attributions
- [ ] Update README with license badge

**Acceptance**: License clear in repo root

---

## Success Metrics

- **Week 2**: Real data integrated, CI green
- **Week 4**: CLI improved, rules validator working
- **Week 8**: 2+ jurisdictions, performance optimized
- **Week 12**: Pip package, Docker image, docs complete

## Verification Checklist

- [ ] CI green on all PRs
- [ ] All milestones have acceptance criteria met
- [ ] Tests pass with real data
- [ ] Documentation updated
- [ ] Performance targets met

---

**Last Updated**: 2024-11-08  
**Next Review**: After P0 completion

