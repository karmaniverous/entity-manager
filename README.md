# entity-manager

[![npm version](https://img.shields.io/npm/v/@karmaniverous/entity-manager.svg)](https://www.npmjs.com/package/@karmaniverous/entity-manager) ![Node Current](https://img.shields.io/node/v/@karmaniverous/entity-manager) <!-- TYPEDOC_EXCLUDE --> [![docs](https://img.shields.io/badge/docs-website-blue)](https://docs.karmanivero.us/entity-manager) [![changelog](https://img.shields.io/badge/changelog-latest-blue.svg)](https://github.com/karmaniverous/entity-manager/tree/main/CHANGELOG.md)<!-- /TYPEDOC_EXCLUDE --> [![license](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://github.com/karmaniverous/entity-manager/tree/main/LICENSE.md)

EntityManager implements rational indexing & cross-shard querying at scale in your NoSQL database so you can focus on your application logic.

If you have any questions, please [start a discussion](https://github.com/karmaniverous/entity-manager/discussions). Otherwise stay tuned!

## What is this?

Entity Manager is a TypeScript-first library that applies a provider‑agnostic, highly opinionated single‑table design to your NoSQL data. It lets you:

- Define a global hash key and range key, plus additional generated properties used by your indexes.
- Encode/decode indexable elements via transcodes so strings sort like their original types.
- Configure a time‑based sharding strategy (shard bumps) that grows as you scale.
- Query across many shards and indexes in parallel through injected “shard query” functions — results are combined, de‑duplicated, sorted, and returned with a compact, dehydrated page key for the next request.

It is designed to work with stores like DynamoDB but keeps the orchestration provider‑neutral.

Key links:

- API: https://docs.karmanivero.us/entity-manager
- Requirements: see .stan/system/stan.requirements.md (authoritative for v6.14.0)
- Example test configuration: see test/config.ts

## Features

- Global model for generated properties, indexes, and property transcodes
  - generatedProperties.sharded and generatedProperties.unsharded
  - Global indexes: indexToken → { hashKey, rangeKey, projections? }
  - Global propertyTranscodes: property → transcodeName
- Deterministic sharding
  - Time‑windowed shard bumps: { timestamp, charBits, chars }
  - Full shard space assignment per bump (uses radix\*\*chars placeholders)
  - Cross‑bump query enumeration over all applicable shards
- Page key dehydration/rehydration
  - Compact string arrays and lz‑string compression for transport
  - Rehydrate back to pageKey objects for each index+shard
- Provider‑agnostic parallel query orchestration
  - Inject shard query functions for each index
  - Parallel fan‑out with configurable throttle
  - Combine, dedupe by unique property, and sort results
- Strong typing + runtime validation
  - Zod‑validated config parsing
  - Robust TypeScript surface for config, items, keys, queries

## Install

```bash
npm install @karmaniverous/entity-manager
# optional: testing support used in the repo
npm install --save-dev @karmaniverous/mock-db
```

TypeScript is strongly recommended. The library will validate configuration at runtime for JavaScript users, but you lose compile‑time guarantees.

## Usage overview

The pattern has three parts:

1. Define your entity types and a config map

- Each entity type lists all properties that exist on your records.
- Entity‑level behaviors live in the config’s entities block (timestamp property, unique property, shard bumps).
- Generated properties, indexes, and transcodes are defined globally.

2. Create an EntityManager instance

- Pass your config (validated with Zod).
- Optionally inject a logger with debug/error methods (defaults to console).

3. Use EntityManager helpers

- addKeys / getPrimaryKey / removeKeys
- encodeGeneratedProperty / decodeGeneratedProperty
- getIndexComponents / unwrapIndex / dehydrateIndexItem / rehydrateIndexItem
- dehydratePageKeyMap / rehydratePageKeyMap
- query(options) to orchestrate cross‑shard multi‑index queries

## Quick start (TypeScript)

Below is a minimal end‑to‑end example showing shape and intent. It mirrors the current implementation’s global config model.

```ts
import {
  defaultTranscodes,
  type ConfigMap,
} from '@karmaniverous/entity-manager';
import { EntityManager } from '@karmaniverous/entity-manager';

// 1) Entity definitions (Typescript types)
interface User {
  userId: string; // unique property
  created: number; // timestamp property
  updated: number;
  firstNameCanonical: string;
  lastNameCanonical: string;
  // Generated properties exist on stored items but are configured globally:
  // e.g., firstNameRK (unsharded), lastNameRK (unsharded), userPK (sharded)
}

type MyConfigMap = ConfigMap<{
  EntityMap: { user: User };
  HashKey: 'hashKey'; // defaults are 'hashKey' / 'rangeKey' if omitted
  RangeKey: 'rangeKey';
  ShardedKeys: 'userPK'; // token(s) for sharded generated properties
  UnshardedKeys: 'firstNameRK' | 'lastNameRK';
  TranscodedProperties:
    | 'userId'
    | 'created'
    | 'updated'
    | 'firstNameCanonical'
    | 'lastNameCanonical';
}>;

// 2) Build a config with the global model
const now = Date.now();
const manager = new EntityManager<MyConfigMap>({
  // Per-entity: unique + timestamp + shard schedule (+ optional defaults)
  entities: {
    user: {
      uniqueProperty: 'userId',
      timestampProperty: 'created',
      shardBumps: [
        // records with timestamp < now → effectively unsharded
        { timestamp: now, charBits: 1, chars: 0 },
        // records with timestamp ≥ now → 1 char at radix 4 (2^2) gives 4 shards
        { timestamp: now, charBits: 2, chars: 1 },
      ],
      // optional defaults (used by query if omitted in options)
      defaultLimit: 10,
      defaultPageSize: 10,
    },
  },

  // Global generated properties (tokens → element lists)
  generatedProperties: {
    sharded: {
      userPK: ['userId'], // atomic (all required)
    },
    unsharded: {
      firstNameRK: ['firstNameCanonical', 'lastNameCanonical', 'created'],
      lastNameRK: ['lastNameCanonical', 'firstNameCanonical', 'created'],
    },
  },

  // Global key tokens
  hashKey: 'hashKey',
  rangeKey: 'rangeKey',

  // Global indexes (hashKey, rangeKey must match allowed token sets)
  indexes: {
    created: { hashKey: 'hashKey', rangeKey: 'created' },
    updated: { hashKey: 'hashKey', rangeKey: 'updated' },
    firstName: { hashKey: 'hashKey', rangeKey: 'firstNameRK' },
    lastName: { hashKey: 'hashKey', rangeKey: 'lastNameRK' },
    userCreated: { hashKey: 'userPK', rangeKey: 'created' }, // sharded alt hash
  },

  // Transcode mapping for scalar/unsharded elements and properties
  propertyTranscodes: {
    userId: 'string',
    created: 'timestamp',
    updated: 'timestamp',
    firstNameCanonical: 'string',
    lastNameCanonical: 'string',
  },

  // Transcodes (can override/extend defaultTranscodes)
  transcodes: defaultTranscodes,

  // Delimiters and query throttle (defaults shown)
  generatedKeyDelimiter: '|',
  generatedValueDelimiter: '#',
  shardKeyDelimiter: '!',
  throttle: 10,
});
```

### Generate keys on items

```ts
// A partial item (no keys yet)
const user = {
  userId: 'u123',
  created: Date.now(),
  updated: Date.now(),
  firstNameCanonical: 'lee',
  lastNameCanonical: 'zhang',
};

// Add hashKey, rangeKey, and generated properties
const record = manager.addKeys('user', user); // returns EntityRecord<...>

// Get one or more primary keys for an item
// - If the timestampProperty is present, you'll usually get exactly one key.
// - If the timestampProperty is missing but uniqueProperty is present,
//   you'll get one key per shard bump (deterministic suffix per bump).
const keys = manager.getPrimaryKey('user', user); // EntityKey[]

// Example: reading by unique id when timestamp is unknown
// (keys may include multiple candidates — one per bump):
// const keys = manager.getPrimaryKey('user', { userId: 'u123' });
// const { Items } = await entityClient.getItems(keys);
// const found = Items[0];

// Remove generated keys from a stored record
const pruned = manager.removeKeys('user', record);
```

### Encode/decode generated property strings

```ts
// Encode an unsharded generated property (always returns a string)
const fn = manager.encodeGeneratedProperty('firstNameRK', record);
// e.g. "firstNameCanonical#lee|lastNameCanonical#zhang|created#000001711234567"

// Decode back into an object fragment
import { decodeGeneratedProperty } from '@karmaniverous/entity-manager';
const decoded = decodeGeneratedProperty(manager, fn); // { firstNameCanonical: 'lee', ... }
```

### Query across shards and indexes

Entity Manager relies on injected shard query functions to perform provider‑specific queries on each shard/index page. The library orchestrates:

- page‑key rehydration → parallel shard queries → de‑duplication and sorting → page‑key dehydration.

```ts
import type {
  QueryOptions,
  ShardQueryFunction,
} from '@karmaniverous/entity-manager';

// Example shard query using a made-up client (see @karmaniverous/mock-db in repo tests)
const firstNameQuery: ShardQueryFunction<MyConfigMap> = async (
  hashKey,
  pageKey,
  pageSize,
) => {
  // Return { count, items, pageKey? } for this shard+index page
  // pageKey is a partial item object with necessary index components
  // ... perform provider-specific work here ...
  return { count: 0, items: [], pageKey };
};

// Invoke query with shardQueryMap
const result = await manager.query({
  entityToken: 'user',
  item: {}, // often used to supply elements for alternate hash keys
  shardQueryMap: { firstName: firstNameQuery },
  limit: 50,
  pageSize: 10,
  // optional: pageKeyMap: previousResult.pageKeyMap,
  // optional: timestampFrom / timestampTo for shard-space windowing
});
```

Notes:

- The result includes a compressed pageKeyMap string for the next call.
- Entity Manager enumerates the hash key space for the time window, rehydrates the prior page keys (if any), and fans out queries across all shard+index pairs in `shardQueryMap` (up to `throttle`).
- Items are deduplicated by the entity’s unique property and sorted by `sortOrder` (if provided).

## Configuration reference (current model, v6.14.0)

- entities: Record<entityToken, { timestampProperty, uniqueProperty, shardBumps?, defaultLimit?, defaultPageSize? }>
- generatedProperties:
  - sharded: Record<ShardedKey, TranscodedProperties[]>
  - unsharded: Record<UnshardedKey, TranscodedProperties[]>
- indexes: Record<indexToken, {
  - hashKey: HashKey | ShardedKey
  - rangeKey: RangeKey | UnshardedKey | TranscodedProperties
  - projections?: string[]
    }>
- propertyTranscodes: Record<TranscodedProperties, keyof TranscodeMap>
- transcodes: Record<transcodeName, { encode, decode }> (defaults to defaultTranscodes)
- hashKey: HashKey (e.g., 'hashKey')
- rangeKey: RangeKey (e.g., 'rangeKey')
- generatedKeyDelimiter: string (default '|', must match /\W+/)
- generatedValueDelimiter: string (default '#', must match /\W+/)
- shardKeyDelimiter: string (default '!', must match /\W+/)
- throttle: number (default 10)

Validation highlights:

- Delimiters must not contain each other.
- Keys and tokens must be mutually exclusive as required.
- Generated property element lists are non‑empty and have no duplicates.
- propertyTranscodes values must exist in transcodes.
- Index hashKey/rangeKey must use valid token sets.
- shardBumps are sorted, include a zero‑timestamp bump if missing, and chars must increase monotonically with timestamp.

Sharding:

- For assignment: a record always uses all placeholders for its applicable bump; suffix space is (2**charBits) ** chars.
- For queries: hash key space spans all bumps overlapping [timestampFrom, timestampTo].

## ESM / CJS

```ts
// ESM
import {
  EntityManager,
  defaultTranscodes,
} from '@karmaniverous/entity-manager';

// CJS
const {
  EntityManager,
  defaultTranscodes,
} = require('@karmaniverous/entity-manager');
```

## Logging

All helpers log debug context and error detail via the injected logger (defaults to `console`). In tests, you may supply a quiet logger:

```ts
const logger = { debug: () => undefined, error: console.error };
const manager = new EntityManager(config, logger);
```

## Delimiter safety

Generated key/value delimiters and the shard key delimiter are used when composing strings:

- generatedKeyDelimiter: '|' (between pairs)
- generatedValueDelimiter: '#' (between key and value)
- shardKeyDelimiter: '!' (between entity token and shard suffix)

Your scalar property values used in generated properties should not include these delimiters. If they must, set custom delimiters (must match /\W+/ and not contain each other).

## Types you’ll use most

- ConfigMap<M>
- EntityItem<C>, EntityRecord<C>, EntityKey<C>, EntityToken<C>
- QueryOptions<C>, QueryResult<C>
- PageKey<C>, PageKeyMap<C>
- ShardQueryFunction<C>, ShardQueryMap<C>, ShardBump

See the full API: https://docs.karmanivero.us/entity-manager

## Scripts (repo)

- build: rollup outputs ESM/CJS + .d.ts
- test: vitest with coverage
- lint: ESLint (type‑aware) + Prettier integration
- docs: TypeDoc (links to external type docs for shared utility packages)
- typecheck: tsc + tsd (type‑level tests)

## License

BSD‑3‑Clause (see package.json).

---

Built for you with ❤️ on Bali! Find more great tools & templates on [my GitHub Profile](https://github.com/karmaniverous).
