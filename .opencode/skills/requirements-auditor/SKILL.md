---
name: requirements-auditor
description: Audit project requirements, documentation, architecture, existing code and tests to find missing, contradictory, incomplete, risky or unverified requirements before implementation or release.
---

# Requirements Auditor

Use this skill before major implementation and before production release.

## Workflow
1. Read the project overview and applicable docs before judging the code.
2. Inspect the actual implementation, tests, configuration and routes.
3. Build a requirement -> evidence matrix.
4. Mark each item:
   - PASS: implemented and verified
   - PARTIAL: partly implemented or insufficiently verified
   - GAP: missing
   - CONFLICT: documentation/code disagree
   - UNKNOWN: cannot verify in current environment
5. Prioritize findings:
   - P0: security, data loss, release blocker
   - P1: critical user flow/functionality
   - P2: important quality/UX/maintainability
   - P3: polish
6. Do not invent requirements. Cite the project document/file that created the requirement.
7. For each GAP, propose the smallest implementation that closes it.
8. Hand implementation to the appropriate existing specialist instead of creating a duplicate agent.
9. After implementation, re-run the affected audit and tests.

## Required output
- Requirement
- Source document
- Code evidence
- Test evidence
- Status
- Risk
- Recommended smallest fix
- Verification command
