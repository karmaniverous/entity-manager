# Entity Manager — Requirements (authoritative)

Scope

- This document is extracted from the current implementation (v6.14.0) and is the source of truth for behavior and configuration.
- Imported narrative documentation informs intent (single-table pattern, provider-agnostic design, shard/query behavior), but when conflicts arise, this specification prevails.

Overview

- Entity Manager provides a provider-agnostic, highly opinionated approach to single-table NoSQL data modeling, sharding, and cross-shard, multi-index querying.
- Core responsibilities:
  - Generate and maintain database-facing keys (global hashKey and rangeKey) and other generated properties used by indexes.
  - Encode/decode generated property elements via transcodes.
  - Dehydrate/rehydrate page keys for multi-index, cross-shard paging.
  - Execute provider-agnostic, parallel shard queries through injected shard query functions, combining, deduping, and sorting results.

Key concepts and terminology

- Entity: application data type; accepts unknown keys (record-like).
- Generated properties:
  - Sharded: include the hashKey value and one or more property=value elements; require all elements to be present (atomic), otherwise undefined.
  - Unsharded: one or more property=value elements; missing element values are encoded as empty strings.
- Keys:
  - Global hashKey (shared name across entities) with shard suffix.
  - Global rangeKey (shared name across entities) in the form "uniqueProperty#value".
- Shard bump: a time-windowed rule (timestamp, charBits, chars) defining shard key width and radix for records created within/after that timestamp.
- Index components: tokens defining index hashKey and rangeKey. Tokens may be:
  - Global hashKey or rangeKey.
  - A sharded generated property (hashKey side only).
  - An unsharded generated property or a transcodable scalar property (rangeKey side).

Configuration model (global-centric)

- Configuration type: Config<C> where C is a ConfigMap describing:
  - EntityMap: map of entities.
  - HashKey/RangeKey: string tokens for global key property names (default 'hashKey' and 'rangeKey').
  - ShardedKeys/UnshardedKeys: tokens for generated properties (optional sets).
  - TranscodedProperties: tokens for properties subject to transcoding.
  - TranscodeMap: mapping of transcode names to types (defaults to DefaultTranscodeMap).
- ParsedConfig (runtime shape; validated with Zod v4):
  - entities: Record<entityToken, {
    timestampProperty: TranscodedProperties;
    uniqueProperty: TranscodedProperties;
    shardBumps?: ShardBump[];
    defaultLimit?: number (default 10);
    defaultPageSize?: number (default 10);
    }>
  - generatedProperties:
    - sharded: Record<ShardedKey, TranscodedProperties[]>
    - unsharded: Record<UnshardedKey, TranscodedProperties[]>
  - indexes: Record<indexToken, {
    hashKey: HashKey | ShardedKey;
    rangeKey: RangeKey | UnshardedKey | TranscodedProperties;
    projections?: string[]; // must be unique and must not include any keys
    }>
  - propertyTranscodes: Record<TranscodedProperties, keyof TranscodeMap>
  - transcodes: Record<transcodeName, { encode: (unknown) => string; decode: (string) => unknown }>, defaults to defaultTranscodes
  - hashKey: HashKey
  - rangeKey: RangeKey
  - generatedKeyDelimiter: string (default '|', must match /\W+/)
  - generatedValueDelimiter: string (default '#', must match /\W+/)
  - shardKeyDelimiter: string (default '!', must match /\W+/)
  - throttle: number (default 10)

Runtime config validation (excerpt of mandatory checks)

- Delimiters:
  - Each delimiter must match /\W+/.
  - No delimiter may contain another (check both directions for: generatedKeyDelimiter, generatedValueDelimiter, shardKeyDelimiter).
- Key exclusivity:
  - hashKey must not collide with rangeKey, sharded/unsharded generated keys, or transcoded properties.
  - rangeKey must not collide with sharded/unsharded generated keys or transcoded properties.
  - sharded and unsharded generated keys must be mutually exclusive; neither may collide with transcoded properties.
- propertyTranscodes:
  - Values must be valid transcode keys present in transcodes.
- Generated property elements:
  - All elements listed under sharded/unsharded must be covered by propertyTranscodes (i.e., are transcodable properties).
  - Arrays must be non-empty and must not contain duplicates.
- Indexes:
  - hashKey must be either the global hashKey or a sharded generated property.
  - rangeKey must be one of: global rangeKey, an unsharded generated property, or a transcodable scalar property.
  - projections (if present) must be unique; must not include any key (global hash/range, index hash/range, sharded/unsharded keys).
  - (Note) No duplicate (hashKey, rangeKey) pairs are currently enforced, but may be validated in future.
- Entities:
  - timestampProperty and uniqueProperty must be TranscodedProperties.
  - shardBumps:
    - Each bump is { timestamp: int >=0, charBits: int in [1..5], chars: int in [0..40] }.
    - Bumps are sorted by timestamp ascending; a zero-timestamp bump { charBits: 1, chars: 0 } is ensured (prepended if missing).
    - chars must increase monotonically with timestamp (strictly).

Transcodes and property transcoding

- defaultTranscodes: provided by @karmaniverous/entity-tools (e.g., bigint, bigint20, boolean, fix6, int, number, string, timestamp).
- Each property listed in propertyTranscodes is encoded/decoded using transcodes[propertyTranscodes[property]].encode/decode.
- encodeElement/decodeElement:
  - For non-key elements: uses the property transcode functions.
  - For global hashKey/rangeKey tokens: values are returned as-is (bypassing transcodes).

Generated property encoding

- encodeGeneratedProperty(entityManager, propertyToken, item):
  - propertyToken must be defined under generatedProperties.sharded or .unsharded.
  - Sharded behavior (atomic):
    - If any element is null/undefined, result is undefined (atomicity).
    - Output format: "<hashKey>|k#v|k#v..." where <hashKey> is the item's current global hashKey value.
  - Unsharded behavior (not atomic):
    - Missing element values are rendered as empty strings.
    - Output format: "k#v|k#v..."
  - Elements are encoded using generatedValueDelimiter ('#') and joined by generatedKeyDelimiter ('|').
- decodeGeneratedProperty(entityManager, encoded):
  - Parses sharded vs unsharded form; rebuilds an EntityItem patch:
    - If first segment contains shardKeyDelimiter, it is interpreted as the global hashKey.
    - Each "k#v" pair is decoded back to the original property types via decodeElement.
  - Throws on malformed pairs (missing or repeated value delimiters).

Global key updates

- updateItemHashKey(entityManager, entityToken, item, overwrite=false):
  - Computes hashKey suffix based on the shard bump applicable to the entity’s timestampProperty:
    - Determine bump by timestamp; compute radix = 2\*\*charBits.
    - Compute space = radix \*\* chars (full shard space).
    - Compute suffix = (stringHash(uniquePropertyValue) % space).toString(radix).padStart(chars, '0').
    - Prefix = entityToken + shardKeyDelimiter; final hashKey = prefix + suffix.
    - If chars == 0, suffix is empty (unsharded: "<entity>!").
  - If hashKey exists and overwrite=false, returns a shallow copy without changes.
  - Validates presence of timestampProperty and uniqueProperty.
- updateItemRangeKey(entityManager, entityToken, item, overwrite=false):
  - Sets the global rangeKey to "<uniqueProperty>#<value>" using generatedValueDelimiter.
  - If rangeKey exists and overwrite=false, returns a shallow copy without changes.
- addKeys(entityManager, entityToken, item, overwrite=false):
  - Validates entityToken; updates hashKey, then rangeKey, then all generatedProperties (sharded and unsharded) based on overwrite rules.
  - Returns an EntityRecord (i.e., EntityItem with required hashKey and rangeKey present).
- removeKeys(entityManager, entityToken, item):
  - Returns a shallow clone with global keys and generatedProperties removed (hashKey, rangeKey, and all generated property tokens).
- getPrimaryKey(entityManager, entityToken, item, overwrite=false):
  - Returns only the global hashKey and rangeKey from a shallow clone (using addKeys if needed).

Indexes and index helpers

- Index definition is global:
  - indexes[indexToken] = { hashKey: <HashKey|ShardedKey>, rangeKey: <RangeKey|UnshardedKey|TranscodedProp>, projections? }.
- getIndexComponents(entityManager, indexToken):
  - Returns a unique array of tokens including global hashKey and rangeKey plus the index’s own hashKey/rangeKey tokens, deduped.
- unwrapIndex(entityManager, entityToken, indexToken, omit: string[] = []):
  - Produces a sorted, deduped list of ungenerated component elements for the index:
    - If component === global hashKey → timestampProperty is substituted (to support queries that need an ordering basis).
    - If component === global rangeKey → uniqueProperty is substituted (to support rehydration and pagination).
    - If component is a generated property → expands to its element list.
    - If component is ungenerated and transcodable → included as-is.
  - Omit list can exclude tokens/elements from the result (e.g., omit generated hashKey tokens in certain contexts).
- dehydrateIndexItem(entityManager, entityToken, indexToken, item):
  - Omits the index hashKey token, unwraps the index into elements, encodes each element from the provided item via encodeElement, and joins with generatedKeyDelimiter.
  - Returns empty string if item is undefined.
- rehydrateIndexItem(entityManager, entityToken, indexToken, dehydrated):
  - Splits on generatedKeyDelimiter; validates value count equals expected elements.
  - Decodes each string and reconstructs an EntityItem fragment (using decodeElement).

Page key map dehydration/rehydration

- PageKeyMap<C>:
  - A two-layer structure: { [indexToken]: { [hashKeyValue]: PageKey<C> | undefined } }.
  - Inner PageKey<C> is a partial EntityItem restricted to tokens allowed in PageKey: global hashKey/rangeKey, sharded/unsharded keys, and TranscodedProperties.
- dehydratePageKeyMap(entityManager, entityToken, pageKeyMap):
  - Validates entityToken; if pageKeyMap is empty, returns [].
  - Sorts indexTokens and enumerates hashKey values from the first index; for each index/hashKey pair:
    - If undefined → emits '' (empty string).
    - Else → composes an EntityItem from the pageKey, decoding any encoded generated keys, refreshes rangeKey via updateItemRangeKey, and dehydrates the index fragment (dehydrateIndexItem).
  - If all entries are '', returns [] (empty array).
- rehydratePageKeyMap(entityManager, entityToken, indexTokens, item, dehydrated, timestampFrom=0, timestampTo=Date.now()):
  - Validates entityToken and non-empty indexTokens; validates all indexTokens exist and share the same hashKey token; returns [hashKeyToken, PageKeyMap].
  - Enumerates hash key space for [timestampFrom, timestampTo] using getHashKeySpace.
  - If dehydrated is undefined → returns a PageKeyMap with all hashKeys mapped to undefined.
  - Else → validates dehydrated length equals (indexTokens.length \* hashKeySpace.length); clusters strings by index, aligns by hashKey; for non-empty entries, combines:
    - Decoded hashKey (from segment if sharded) + rehydrateIndexItem(...).
    - Sets rangeKey in the pageKey to "<uniqueProperty>#<value>" format.
    - Encodes any generated properties in the pageKey to strings via encodeGeneratedProperty (for storage in the map).
- de/serialization in queries:
  - Query returns a compressed JSON string (lz-string’s compressToEncodedURIComponent) representing the dehydrated page key array.
  - Query accepts a previous pageKeyMap string, which it decompresses and parses into a string[] for rehydration.

Shard space enumeration

- getHashKeySpace(entityManager, entityToken, hashKeyToken, item, timestampFrom=0, timestampTo=Date.now()):
  - hashKeyToken must be either the global hashKey or a sharded generated property.
  - For each shard bump that overlaps the [timestampFrom, timestampTo] window:
    - Compute radix = 2**charBits and all shard keys for chars ('' if chars=0 else 0..(radix**chars - 1), base=radix, padded to chars).
    - For global hashKey: value = "<entityToken>!<shardSuffix>".
    - For a sharded generated hashKey token: value = encodeGeneratedProperty(property, { ...item, [hashKey]: "<entityToken>!<shardSuffix>" }).
  - Returns ordered list of hash key values across relevant bumps; throws if item lacks the elements needed to encode the alternate sharded hash key.

Query orchestration

- QueryOptions<C>:
  - entityToken: the entity to query.
  - item: partial EntityItem sufficient to generate alternate hash keys as needed.
  - shardQueryMap: Record<indexToken, ShardQueryFunction<C>>; each function queries a single shard/index page: (hashKey, pageKey?, pageSize?) => Promise<{ count, items, pageKey? }>
  - pageKeyMap?: string — compressed dehydrated page key array from prior query iteration.
  - limit?: number — target maximum total records across all shards; must be positive integer or Infinity; default = entity defaultLimit.
  - pageSize?: number — max records per individual shard query; must be positive integer; default = entity defaultPageSize.
  - sortOrder?: SortOrder<EntityItem<C>> — array of { property, desc? } for progressive sort; defaults to [].
  - timestampFrom?: number, timestampTo?: number — shard window; defaults 0..Date.now().
  - throttle?: number — max number of shard queries in parallel; default = config.throttle.
- Query behavior:
  - Rehydrate pageKeyMap (or initialize with undefined keys) over the index set provided by shardQueryMap and enumerated shard keys for [timestampFrom, timestampTo].
  - If rehydration yields no shards/indexes (empty map), return { count: 0, items: [], pageKeyMap: compressed '[]' }.
  - Iterate:
    - Execute shardQueryFunction in parallel for every (indexToken, hashKey) with pageKey !== undefined, up to throttle concurrency.
    - Update in-memory pageKeyMap with returned pageKey for each shard.
    - Accumulate items; repeat while any pageKey remains defined AND item count < limit.
  - Dedupe by entity uniqueProperty (stringified) and sort by sortOrder.
  - Dehydrate the new pageKeyMap to a string[]; compress to pageKeyMap string; return { count, items, pageKeyMap }.
  - Notes:
    - No built-in fan-out reduction relative to remaining limit in the query loop.
    - Only validates that rehydratePageKeyMap succeeds; shardQueryMap keys must correspond to valid index tokens.

Logging and errors

- The EntityManager accepts an injected logger implementing { debug, error } (console by default).
- All helper functions attempt to log debug details on success and error details on failure; errors are rethrown.

Type surface (selected)

- Exported from src/EntityManager/index.ts via src/index.ts:
  - BaseConfigMap, Config, ConfigMap, ParsedConfig, ValidateConfigMap
  - EntityItem, EntityRecord, EntityKey, EntityToken
  - PageKey, PageKeyMap
  - ShardBump, ShardQueryFunction, ShardQueryMap, ShardQueryResult
  - QueryOptions, QueryResult
  - EntityManager class with:
    - encodeGeneratedProperty(property, item)
    - addKeys(entityToken, item|items, overwrite?)
    - getPrimaryKey(entityToken, item|items, overwrite?)
    - removeKeys(entityToken, item|items)
    - findIndexToken(hashKeyToken, rangeKeyToken, suppressError?)
    - query(options)

Delimiters (defaults and constraints)

- generatedKeyDelimiter: '|' — separates generated property pairs (k#v|k#v).
- generatedValueDelimiter: '#' — separates key and value inside a pair (k#v).
- shardKeyDelimiter: '!' — separates entity token from shard suffix in global hashKey ("entity!xx").
- Each delimiter must be a non-word string (/\W+/); no delimiter may contain another.

Sharding requirements summary

- Assignment (records):
  - Within the applicable bump, all placeholders must be used; shard suffix space = radix \*\* chars; suffix is base-radix, padded to length chars.
  - For chars == 0, hashKey is "entity!" (unsharded).
- Query (enumeration):
  - Hash key space must cover all shard bumps overlapping the requested time window.
  - Alternate sharded hash keys (for sharded generated properties) must be encodable from provided item (or throw).

Compatibility and assumptions

- Provider-agnostic orchestration; intended to work over platforms like DynamoDB (page keys will typically include both global hash and range keys).
- Canonicalization (e.g., name search fields) is application responsibility; Entity Manager treats such strings as opaque values and provides transcodes for ordering/encoding.

Non-requirements (current behavior)

- No automatic fan-out reduction relative to remaining limit in the query loop.
- No enforcement of globally unique (hashKey, rangeKey) pairs across separate index tokens.

Inference-first typing (refactor) — strict acronyms and API requirements

Goals

- Inference-first configuration: callers pass a literal config value; Entity Manager captures tokens and index names directly from the value (no ConfigMap required for most users).
- Token-aware and index-aware types end-to-end: entity token (ET) and index token (IT/ITS) narrow items, records, page keys, low-level helpers, shard query contracts, and query results without casts.
- Value-first helpers ensure literal keys are preserved across module boundaries (use “as const” and “satisfies” patterns).
- Runtime remains unchanged: keep Zod-based validation; intersect parsed output with captured literal types at the type level only.

Strict capitalized type-parameter dictionary (apply repo-wide; no deviations)

- EM — EntityMap
- E — Entity (single entity shape)
- ET — EntityToken (keys of EM)
- EOT — EntityOfToken (Exactify<EM[ET]>)
- TR — TranscodeRegistry (name → value type)
- TN — TranscodeName (keys of TR)
- CC — CapturedConfig (inference-first config type captured from the literal)
- HKT — HashKeyToken
- RKT — RangeKeyToken
- SGKT — ShardedGeneratedKeyToken
- UGKT — UnshardedGeneratedKeyToken
- PT — PropertyToken (transcodable scalar property token)
- IT — IndexToken (keys of config.indexes)
- ITS — IndexTokenSubset (subset of IT valid for ET in context)
- EIBT — EntityItemByToken (partial EOT + key/generated tokens as strings)
- ERBT — EntityRecordByToken (EIBT + required HKT/RKT)
- PKBI — PageKeyByIndex
- PKMBIS — PageKeyMapByIndexSet
- SQFBI — ShardQueryFunctionByIndex
- QO — QueryOptions
- QR — QueryResult
- PK — PropertyKey (utility)
- V — Value (utility)

Type-parameter ordering (public APIs)

1. CC (when config-derived tokens are needed)
2. EM
3. TR (and TN only if necessary)
4. ET (and EOT only if necessary)
5. IT / ITS
6. PK / V (utility generics last)

Inference-first API and typing (entity-manager)

- Factory
  - createEntityManager<const CC extends ConfigInput, EM extends EntityMap = MinimalEntityMapFrom<CC>>(config: CC, logger?) → EntityManager<CC, EM>.
  - Captures literal tokens and index names from the value; parses with Zod; intersects parsed result with captured literal types at the type level (no runtime change).
- Items/records
  - EIBT<CC, EM, ET>, ERBT<CC, EM, ET>.
- Core methods (token-aware)
  - addKeys<CC, EM, ET>(em, entityToken: ET, item: EIBT<CC, EM, ET>, overwrite?) → ERBT<CC, EM, ET>.
  - removeKeys<CC, EM, ET>(em, entityToken: ET, item: ERBT<CC, EM, ET>) → EIBT<CC, EM, ET>.
  - getPrimaryKey<CC, EM, ET>(em, entityToken: ET, item: EIBT<CC, EM, ET>, overwrite?) → Array<Record<HKT<CC> | RKT<CC>, string>>.
- Query (entity + index aware)
  - Page keys: PKBI<CC, EM, ET, IT> and PKMBIS<CC, EM, ET, ITS>.
  - Shard queries: SQFBI<CC, EM, ET, IT> = (hashKey: string, pageKey?: PKBI<…>, pageSize?: number) → Promise<{ count; items: EIBT<…>[]; pageKey?: PKBI<…> }>.
  - Options and results: QO<CC, EM, ET, ITS>, QR<CC, EM, ET, ITS>.
  - query<CC, EM, ET, ITS>(em, options: QO<…>) → Promise<QR<…>>.
- Low-level helpers (thread ET and IT where applicable)
  - getIndexComponents, unwrapIndex, encodeElement, decodeElement, dehydrateIndexItem, rehydrateIndexItem, dehydratePageKeyMap, rehydratePageKeyMap.
  - decodeGeneratedProperty requires (em, entityToken: ET, encoded) and returns EIBT<…>.
- IndexTokenByEntity
  - Computed from CC (and optionally EM) using config semantics:
    - Global HKT → all entities.
    - Sharded generated hashKey → entity must contain all elements of the sharded generated property.
    - RangeKey = global RKT → entity must have uniqueProperty.
    - RangeKey = unsharded generated → entity must contain its elements.
    - RangeKey = scalar PT → entity must have that property and it must be present in propertyTranscodes.

DX guidance

- Prefer “value-first” patterns: use “as const” for generated/index records and “satisfies” for structural conformance without widening.
- Provide tiny builders (defineConfig/defineIndexes/defineGenerated) that preserve literal keys where complex composition is common.
- Accept graceful degradation: if a caller widens keys (e.g., dynamic spreads), the system still works; they can opt back into inference later by adopting the helpers.
