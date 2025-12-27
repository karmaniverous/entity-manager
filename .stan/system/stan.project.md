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

## STAN assistant guide — creation & upkeep policy

This repository SHOULD include a “STAN assistant guide” document at `guides/stan-assistant-guide.md` (or an equivalent single, stable path if your repo uses a different docs layout). This guide exists to let STAN assistants use and integrate the library effectively without consulting external type definition files or other project documentation.

Policy

- Creation (required):
  - If `guides/stan-assistant-guide.md` is missing, create it as part of the first change set where you would otherwise rely on it (e.g., when adding/altering public APIs, adapters, configuration, or key workflows).
  - Prefer creating it in the same turn as the first relevant code changes so it cannot drift from reality.
- Maintenance (required):
  - Treat the guide as a maintained artifact, not a one-off doc.
  - Whenever a change set materially affects how an assistant should use the library (public exports, configuration shape/semantics, runtime invariants, query contracts, paging tokens, projection behavior, adapter responsibilities, or common pitfalls), update the guide in the same change set.
  - When deprecating/renaming APIs or changing semantics, update the guide and include migration guidance (old → new), but keep it concise.
- Intent (what the guide must enable):
  - Provide a self-contained description of the “mental model” (runtime behavior and invariants) and the minimum working patterns (how to configure, how to call core entrypoints, how to integrate a provider/adapter).
  - Include only the information required to use the library correctly; omit narrative or historical context.
- Constraints (how to keep it effective and reusable):
  - Keep it compact: “as short as possible, but as long as necessary.”
  - Make it self-contained: do not require readers to import or open `.d.ts` files, TypeDoc pages, or other repo docs to understand core contracts.
  - Avoid duplicating durable requirements or the dev plan:
    - Requirements belong in `stan.requirements.md`.
    - Work tracking belongs in `stan.todo.md`.
    - The assistant guide should focus on usage contracts and integration.
  - Define any acronyms locally on first use within the guide (especially if used outside generic type parameters).
