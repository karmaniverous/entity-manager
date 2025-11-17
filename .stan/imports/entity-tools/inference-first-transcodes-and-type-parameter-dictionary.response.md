# Interop — Entity Tools → Entity Manager

Response to “Inference‑first transcodes and strict type‑parameter dictionary”

Status

- Ready for release. All stan scripts are green (typecheck, lint, test, build, docs, knip).
- No runtime behavior changes from prior defaults; only DX/type-surface changes and new helper types for clearer errors.

What shipped (high‑level)

- Inference‑first transcodes
  - defineTranscodes(spec) is value‑first and inference‑first (single signature; no overloads). It derives the registry from decode() return types and enforces compile‑time encode/decode agreement per key. Explicit generics are not required.
  - DX: literals “just work”, while non‑conforming keys surface a precise type error (see branded errors below).

- Default registry via builder
  - defaultTranscodes is authored through the builder; runtime behavior is unchanged. All decode(value) parameters are typed as string and encode parameters are typed precisely (number, bigint, string, boolean, etc.) to preserve inference.

- Canonical names: TranscodeRegistry
  - TranscodeRegistry is the canonical naming across the stack. Legacy TranscodeMap aliases are not exported by entity-tools.
  - DefaultTranscodeRegistry is the canonical default registry type (no DefaultTranscodeMap alias).

- Registry/type helpers
  - TranscodeRegistryFrom<T>: derive a registry type from a literal spec (maps key → ReturnType<decode>).
  - TranscodedType<TR, TN>, TranscodeName<TR>: value/names extraction helpers.

- Branded error shapes (clearer TS diagnostics)
  - When a spec is unsatisfiable, the agreement type brands failures to improve compiler messages:
    - { __error__: 'MissingEncode'; key }
    - { __error__: 'MissingDecode'; key }
    - { __error__: 'EncodeDecodeMismatch'; key; encodeParam; decodeReturn }
  - The builder still rejects invalid specs; these error shapes exist to improve “what went wrong” clarity in TS errors.

- Sorting & selection DX
  - defineSortOrder<E> identity helper preserves property literal unions for SortOrder typing.
  - PropertiesNotOfType/UntranscodableProperties fixed to ignore undefined‑only and index‑signature properties; unions are precise (no widening to string).

- KV and sharding helpers (unchanged from interop note)
  - KV codec: encodePairs/decodePairs (no delimiter escaping; arity checked; throws on invalid pair shape).
  - Sharding math: hashString (FNV‑1a, 32‑bit), enumerateShardSuffixes(radix, chars), shardSuffixFromHash(hash, radix, chars).

- Subpath exports & acronym aliases
  - No subpath exports added. Consumers import from the package root.
  - No “acronym alias exports” added (e.g., EM/E/TR/TN). The original intent was consistency in type‑parameter names across repos, not alias exports. We’re consistently using EM/E/TR/TN in our generics/docs; no new exported type aliases were introduced.

What changed specifically in response to interop

1) Builder: inference‑first only

```ts
// signature
export function defineTranscodes<
  const T extends Record<string, { decode: (value: string) => unknown }>
>(spec: T & EncodeDecodeAgreement<T>): Transcodes<TranscodeRegistryFrom<T>>;
```

- Requires a decode function per key and matches encode(value: VK) to decode return type VK bi‑directionally.
- Works with precise encode parameter types; decode parameter must be string for correct inference.

2) Agreement + branded errors

```ts
type EncodeDecodeAgreement<T extends Record<string, { decode: (value: string) => unknown }>> = {
  [K in keyof T]-?: K extends string
    ? [EncodeParam<T[K]>] extends [never]
      ? { __error__: 'MissingEncode'; key: K }
      : [DecodeReturn<T[K]>] extends [never]
        ? { __error__: 'MissingDecode'; key: K }
        : [EncodeParam<T[K]>] extends [DecodeReturn<T[K]>]
          ? [DecodeReturn<T[K]>] extends [EncodeParam<T[K]>]
            ? T[K] // valid
            : { __error__: 'EncodeDecodeMismatch'; key: K; encodeParam: EncodeParam<T[K]>; decodeReturn: DecodeReturn<T[K]> }
          : { __error__: 'EncodeDecodeMismatch'; key: K; encodeParam: EncodeParam<T[K]>; decodeReturn: DecodeReturn<T[K]> }
    : T[K];
};
```

- TS errors point at the offending key with a clear tag and both encode/decode types in view.

3) Migration of canonical names

- Use TranscodeRegistry as canonical. Replace residual TranscodeMap occurrences in entity‑manager types/docs.
- Use DefaultTranscodeRegistry when referencing the canonical defaults type.

4) Selection & sort helpers (unchanged API, improved typing)

- defineSortOrder<E> is the intended helper for preserving literal property unions in SortOrder code in EM’s public surface.
- PropertiesNotOfType/UntranscodableProperties are precise (no index signature leaks, undefined‑only excluded). This may slightly narrow unions vs previous behavior (intended).

Downstream impact & migration notes (entity‑manager)

- Replace type names
  - TranscodeMap → TranscodeRegistry
  - DefaultTranscodeMap → DefaultTranscodeRegistry

- Authoring transcodes (if EM defines any registries/transcodes)
  - Prefer value‑first, inference‑first builder usage:
    ```ts
    const mySpec = {
      foo: { encode: (v: Foo) => stringValue, decode: (s: string) => FooValue },
    } as const;
    const myTranscodes = defineTranscodes(mySpec);
    // typeof myTranscodes === Transcodes<TranscodeRegistryFrom<typeof mySpec>>
    ```
  - Use TranscodeRegistryFrom<typeof mySpec> to derive the registry type where needed without building a runtime value.
  - If a typed registry is required locally (rare for EM), keep encode parameters precise and annotate decode(s: string) for correct inference; the builder enforces agreement.

- Sorting
  - Use defineSortOrder<E>(…) to preserve literal unions in EM’s configured sort descriptors. No runtime change.

- Selection types
  - TranscodableProperties/UntranscodableProperties precision improvements may narrow unions vs older behavior when index signatures or undefined‑only props were present. This is usually a net DX improvement; adjust expectations accordingly.

- Error messages (type errors)
  - When a transcodes spec is unsatisfiable, TS errors will include branded shapes (MissingEncode, MissingDecode, EncodeDecodeMismatch) pointing at the offending key. This should make failures easier to interpret in EM’s codebase.

DX clarifications

- “Strict acronym dictionary” is honored in generics/docs (EM/E/TR/TN/PK/V). No alias exports were added — the original intent was naming consistency across repos, not to export alias types. Continue to use these parameter names in EM for consistency.
- No subpath exports were added; import from the package root.

Test status and stability

- entity-tools CI: all green (unit tests for default transcodes, KV codec, sharding; type tests for builder inference, agreement/mismatch, sort helper typing).
- No runtime changes to default transcodes; encoding/decoding behavior is unchanged; only typing/DX improvements.

Examples (for convenience)

Define a registry (inference‑first):

```ts
import { defineTranscodes } from '@karmaniverous/entity-tools';
import type { TranscodeRegistryFrom } from '@karmaniverous/entity-tools';

const spec = {
  int: {
    encode: (v: number) => v.toString(),
    decode: (s: string) => Number(s),
  },
  bool: {
    encode: (v: boolean) => (v ? 't' : 'f'),
    decode: (s: string) => s === 't',
  },
} as const;

const tr = defineTranscodes(spec);
type R = TranscodeRegistryFrom<typeof spec>; // { int: number; bool: boolean }
```

Mismatch shows a branded error at the offending key:

```ts
import { defineTranscodes } from '@karmaniverous/entity-tools';

defineTranscodes({
  // @ts-expect-error encode/decode types do not agree
  bad: { encode: (_: unknown) => '', decode: (_s: string) => 'oops' },
} as const);
```

Action items for entity‑manager

1) Replace TranscodeMap/DefaultTranscodeMap with TranscodeRegistry/DefaultTranscodeRegistry in EM’s public types and docs.
2) If EM authors custom transcodes (beyond defaults), prefer `defineTranscodes` with literal inference; annotate decode(s: string) and keep encode parameter precise for better inference and error clarity.
3) Use `TranscodeRegistryFrom<typeof spec>` for derived registry types where you don’t need a runtime value.
4) Adopt `defineSortOrder<E>` when building typed sort descriptors to preserve property literal unions.
5) Adjust any type‑dependent tests that relied on older selection behavior (index signatures/undefined‑only fields). The new behavior is precise and intended.

Release recommendation

- Yes — entity-tools is ready to publish. Recommend a minor version bump (0.7.0) since there are type-surface improvements (branded errors, inference-first builder consolidation) and canonical naming is fixed on TranscodeRegistry (as agreed). Runtime defaults remain stable.

Support

- If EM runs into a typing nuance or needs an adapter, open an issue or PR with a minimal repro. We’ll iterate quickly. 
