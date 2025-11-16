# Interop — Inference‑first transcodes and strict type-parameter dictionary (entity-tools)

Purpose

- Enable entity-manager and entity-client-dynamodb to adopt inference‑first configuration and strict, capitalized type-parameter acronyms across the stack.
- Provide value‑first builders that preserve literal keys and signatures (no widening) and require minimal ceremony.
- Keep runtime behavior unchanged.

Strict acronyms (apply in entity-tools)

- EM — EntityMap
- E — Entity
- TR — TranscodeRegistry
- TN — TranscodeName
- PK — PropertyKey (utility)
- V — Value (utility)

Ordering (for public APIs in entity-tools)

1. EM (when relevant)
2. TR (and TN only if necessary)
3. PK, V (utilities last)

Required exports and changes

1. Value‑first transcode registry

- defineTranscodes<TR extends TranscodeRegistry>(reg: TR): TR
  - Preserves literal keys and validates encode/decode signatures via “satisfies” on call sites.
  - Example:
    ```ts
    const myTranscodes = defineTranscodes({
      string: { encode: (v: string) => v, decode: (s: string) => s },
      timestamp: {
        encode: (v: number) => v.toString().padStart(13, '0'),
        decode: (s: string) => Number(s),
      },
    } as const);
    ```
- Keep defaultTranscodes defined through defineTranscodes for consistency.

2. Transcode typing helpers

- TranscodedType<TR extends TranscodeRegistry, TN extends keyof TR> = TR[TN]
- Optional convenience:
  - TranscodeName<TR> = keyof TR

3. Entity/Map utilities (strict acronyms)

- PropertiesOfType<E extends Entity, V>()
- PropertiesOfTypeInMap<EM extends EntityMap, V>()
- UntranscodablePropertiesForEntity<E extends Entity, TR extends TranscodeRegistry>()
- UntranscodablePropertiesForMap<EM extends EntityMap, TR extends TranscodeRegistry>()
- FlattenEntityMap<EM extends EntityMap>() — unchanged, but ensure TSDoc uses “EM”.

4. Sort helpers (stable typing)

- defineSortOrder<E extends Entity>(so: SortOrder<E>): SortOrder<E>
  - Preserves property names and enforces progressive sort constraints.

5. Guidance and DX

- Recommend “value‑first + satisfies” in docs:
  - Use “as const” on transcode registries, and “satisfies” to validate structure without widening.
  - Keep examples minimal and aligned with the strict acronyms.

Non-goals (entity-tools)

- Do not add runtime behavior or change semantics of existing helpers — this is a typing/DX improvement only.

Acceptance criteria (for entity-tools)

- New defineTranscodes helper published and used to define defaultTranscodes.
- Strict acronyms adopted in all public @template and type parameters in TSDoc/d.ts (EM, E, TR, TN, PK, V only).
- TSD tests:
  - defineTranscodes preserves literal keys and validates encode/decode signatures.
  - TranscodedType resolves correct value type per key.
- No runtime changes required by entity-manager/client; this is a typing surface upgrade that enables inference‑first downstream.

Coordination

- entity-manager will consume defineTranscodes via propertyTranscodes and infer scalar property types from TR (and config propertyTranscodes).
- entity-client-dynamodb requires no direct change in entity-tools aside from relying on the strict acronyms in shared utility types.

Notes

- Keep the types shallow and fast (avoid complex distributive conditionals).
- Ensure generated .d.ts files reflect the strict acronyms exactly; we will lint against deviations downstream.

