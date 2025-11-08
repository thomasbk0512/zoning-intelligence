# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Real Austin dataset integration
- CI/CD pipeline
- Additional jurisdictions
- Performance optimizations

## [1.0.1-dev] - TBD

### Added
- CI workflow for automated testing
- Rules validator script
- Data backup script
- Execution checklist

### Changed
- Improved geometry handling in spatial queries
- Enhanced error messages

## [1.0.0] - 2024-11-08

### Added
- Initial MVP release
- CLI with APN/lat-lng input support
- GeoJSON/Shapefile parsing
- YAML rule engine
- PDF code section extraction
- Schema validation
- Unit tests (16) and golden tests (20)
- Synthetic data for Austin, TX

### Performance
- Runtime: 129-306ms per parcel (target: ≤60s)

