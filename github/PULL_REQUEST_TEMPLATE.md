<!-- Pull Request template -->

## Summary
Describe the purpose of this PR and the changes included.

## What I changed
- Added consolidated CI workflow that runs format checks, linting, tests and the optimize script.
- Updated package.json engines to Node >=18 and added a `ci` script.

## How to test
1. Review the GitHub Actions run on this branch.
2. Ensure CI passes: format check, lint, tests and optimize step.

## Notes
- This PR is part of the auto-upgrade initiative. Do not merge until CI green and reviewers approve.
