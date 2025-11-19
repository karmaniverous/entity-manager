# Entity Manager — Project Prompt

This document augments the system prompt with repository‑specific practices that guide documentation and assistant behavior. Product/runtime requirements remain in `stan.requirements.md`.

## Documentation and comments — acronym usage policy

Purpose
- Maintain high readability in public docs and comments while preserving a consistent, inference‑first generic parameter vocabulary in code examples.

Policy
- Dictionary acronyms MUST be used as type parameters (e.g., function\<CC, ET, ITS, CF, K\>).
- Acronyms MAY be used elsewhere (README, API docs, comments) only if they are defined locally on first mention in that document/section.
  - Examples: “Captured Config (CC)”, “values‑first config literal (CF)”.
  - Prefer descriptive terms over acronyms when clarity would otherwise suffer.
- Never export abbreviated type aliases. Public type names remain fully spelled out (e.g., EntityItemByToken), while acronyms are reserved for type parameter identifiers and occasional local shorthand.

Rationale
- Uninitiated readers should not need to infer acronyms. Local definitions or descriptive names maintain clarity while allowing brevity in typed examples.
- The strict, shared acronym dictionary for generics keeps examples consistent across the stack without forcing acronyms into prose.

Scope and enforcement
- Applies to: README, API docs, TSDoc/JSDoc comments, and code comments.
- Code examples may use the acronym dictionary in generic parameters without redefining each time if the section already introduced the terms or links to a glossary line within the doc.
- Assistants refactoring docs should introduce acronyms on first local use or expand to full terms where appropriate.

Notes
- The canonical acronym dictionary and its meanings are recorded in `stan.requirements.md` under “Strict capitalized type‑parameter dictionary”. This project prompt governs where and how those acronyms appear in documentation and comments.
