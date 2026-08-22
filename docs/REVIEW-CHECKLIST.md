# Code Review Checklist (Over-Engineering Focus)

Review diffs for unnecessary complexity. One line per finding.

## Format

`L<line>: <tag> <what>. <replacement>.`

## Tags

| Tag | Meaning | Action |
|---|---|---|
| `delete:` | Dead code, unused flexibility, speculative feature | Remove it |
| `stdlib:` | Hand-rolled thing standard library ships | Use stdlib |
| `native:` | Dependency doing what platform already does | Remove dependency |
| `yagni:` | Abstraction with one implementation, config nobody sets | Inline it |
| `shrink:` | Same logic, fewer lines | Rewrite shorter |

## Examples

```
L12-38: stdlib: 27-line validator class. "@" check, 1 line.
L4: native: moment.js for one format call. Intl.DateTimeFormat, 0 deps.
repo.py:L88: yagni: AbstractRepository with one implementation. Inline until second exists.
L52-71: delete: retry wrapper around idempotent local call. Nothing replaces it.
L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.
```

## Scoring

End with: `net: -<N> lines possible.`

If nothing to cut: `Lean already. Ship.`

## What's OUT of scope

- Correctness bugs → normal review
- Security holes → security review
- Performance → performance review
- Tests (one assert-based self-check is minimum, not bloat)

---

*Source: [Ponytail](https://github.com/DietrichGebert/ponytail) by Dietrich Gebert (MIT License)*
