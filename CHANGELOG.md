# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Configuration with `.chaas.yml`
- Ignore files config `ignore`. Run with `NEUTRAL` if commit set contains only files that are ignored.
- Return `FAILED` if no changelog is present and files are not ignored.
- Add `branches` configuration option.
- Skip check if PR is opened against a branch that is not in `branches` configuration or default branch if no `branches` is specified.

### Changed
- Move from `check_suite` events to `pull_request` + listFiles from `context.github.pulls` to process all files in PR.

## [1.0.0] - 2019-01-08
### Added
- initial support for lambdas on now
- initial work and basic changelog processing based on git status: added, modified
