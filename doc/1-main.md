# entity-manager

The DynamoDB [single-table design pattern](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/) requires highly-structured key attributes that...

- Serve as Global Secondary Index (GSI) keys supporting entity-specific queries.
- Support sharding across multiple partitions.

Entity relationships in a traditional RDBMS are expressed in a set of Foreign Key constraints that map straightforwardly into an entity-relationship diagram (ERD). Keeping implementation and design in sync is painless, and scaling is a matter of hardware and server configuration.

All of this takes place at design time. At run time, database structure is more or less fixed.

GSIs on a NoSQL platform like DynamoDB are declared as a matter of design-time configuration. Everything ELSE happens at run time, encoded into those critical key attributes at every data write.

The logic to accomplish this can be both complex and fragmented across the implementation. Unlike a set of RDBMS foreign key constraints that map one-for-one to the lines in an ERD, the structure of this logic is difficult to visualize and rarely collected in one place.

This package shifts the implementation of DynamoDB structure & scaling from logic to configuration. It features:

- A simple, declarative configuration format that permits articulation of every index key for every entity, all in one place.

- A rational approach to partition sharding that can be encoded directly into table & GSI hash keys and permits scaling over time.

- High-performance decoration of entity-specific data objects with configured, shard-aware index values.

- High-performance transformation of an entity-specific data object into a key space permitting query of related objects across all partition shards.

## Installation

```bash
npm install @karmaniverous/entity-manager
```

## Configuration

The `entity-manager` configuration object describes each entity's structured keys and sharding strategy. For broadest compatibility, express this object as a named export from an ES6 module like this:

```js
// entityConfig.js

// These tagged templates are used below to simplify template literals.
// sn2e - Template literal returns empty string if any expression is nil.
// sn2u - Template literal returns undefined if any expression is nil.
import { sn2e, sn2u } from '@karmaniverous/tagged-templates';

// Entity config object named export.
export const config = {
  entities: {
    // Repeat this structure for each entity type. Valid keys match /\w+/
    transaction: {
      // Each property of the keys object defines a structured index key for
      // this entity. Each property value is a function expects an entity
      // object as its one argument. In the examples below, entity attributes
      // are destructured in the function declaration and the return value is
      // expressed as a template literal.
      keys: {
        // Table HASH key. Note the optional shardId.
        entityPK: ({ shardId }) => `transaction${sn2e`!${shardId}`}`,

        // Table RANGE key.
        entitySK: ({ timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|transactionId#${transactionId}`,

        // merchants GSI HASH key. Note the optional shardId.
        merchantPK: ({ merchantId, shardId }) =>
          sn2u`merchantId#${merchantId}|transaction${sn2e`!${shardId}`}`,

        // merchants GSI RANGE key.
        merchantSK: ({ methodId, timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|methodId#${methodId}|transactionId#${transactionId}`,

        // methods GSI HASH key. Note the optional shardId.
        methodPK: ({ methodId, shardId }) =>
          sn2u`method#${methodId}|transaction${sn2e`!${shardId}`}`,

        // methods GSI RANGE key.
        methodSK: ({ merchantId, timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|merchantId#${merchantId}|transactionId#${transactionId}`,

        // users GSI HASH key. Note the optional shardId.
        userPK: ({ shardId, userId }) =>
          sn2u`user#${userId}|transaction${sn2e`!${shardId}`}`,

        // users GSI RANGE key.
        userSK: ({ merchantId, timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|merchantId#${merchantId}|transactionId#${transactionId}`,
      },

      // The sharding configuration for this entity.
      sharding: {
        // Default number of shard key characters (0 means no shard key).
        nibbles: 0,

        // Bits represented by each shard key character. 3 bits means an octal
        // shard key, so the first character yields 8 shards and the second
        // yields 64.
        nibbleBits: 4,

        // Scheduled increases in shard key length. Keys are expressed as
        // millisecond UTC timestamps. In production, these should not be
        // updated after they go into effect.
        bumps: {
          1676874972686: 1,
          1708411134487: 2,
        },

        // Extracts entity key to be hashed for shard key.
        entityKey: ({ transactionId }) => transactionId,

        // Extracts timestamp to determine shard key length.
        timestamp: ({ timestamp }) => timestamp,
      },
    },
  },
  // Will be added to every entity object. Pick a value that won't collide with
  // entity data!
  shardKeyToken: 'shardId',
};
```

## Usage

```js
// Import an optional logger.
import { Logger } from '@karmaniverous/edge-logger';
const logger = new Logger('debug');

// Import EntityManager & config object.
import { EntityManager } from '@karmaniverous/entity-manager';
import { config } from './entityConfig.js';

// Create & configure an EntityManager (logger defaults to console object).
const entityManager = new EntityManager({ config, logger });

// Define a transaction object.
const transaction = {
  methodId: 'methodIdValue',
  merchantId: 'merchantIdValue',
  timestamp: now + 1000,
  transactionId: 'transactionIdValue',
  userId: 'userIdValue',
};

// Transform the transaction for posting to the database.
entityManager.addKeys(transaction);

// debug:    adding sharded index keys to transaction...
// debug:    {
// debug:      "methodId": "methodIdValue",
// debug:      "merchantId": "merchantIdValue",
// debug:      "timestamp": 1676869312851,
// debug:      "transactionId": "transactionIdValue",
// debug:      "userId": "userIdValue"
// debug:    }
// debug:    generated shard key '7' for transaction id 'transactionIdValue' at timestamp 1676869312851.
// debug:
// debug:    done
// debug:    {
// debug:      "methodId": "methodIdValue",
// debug:      "merchantId": "merchantIdValue",
// debug:      "timestamp": 1676869312851,
// debug:      "transactionId": "transactionIdValue",
// debug:      "userId": "userIdValue",
// debug:      "shardId": "7",
// debug:      "entityPK": "transaction!7",
// debug:      "entitySK": "timestamp#1676869312851|transactionId#transactionIdValue",
// debug:      "merchantPK": "merchantId#merchantIdValue|transaction!7",
// debug:      "merchantSK": "timestamp#1676869312851|methodId#methodIdValue|transactionId#transactionIdValue",
// debug:      "methodPK": "method#methodIdValue|transaction!7",
// debug:      "methodSK": "timestamp#1676869312851|merchantId#merchantIdValue|transactionId#transactionIdValue",
// debug:      "userPK": "user#userIdValue|transaction!7",
// debug:      "userSK": "timestamp#1676869312851|merchantId#merchantIdValue|transactionId#transactionIdValue"
// debug:    }

// Extract key space for querying across shards by related entity.
entityManager.getKeySpace('transaction', transaction, 'userPK', 1686874972686);

// debug:    getting shard key space for transaction on key 'userPK' at timestamp 1686874972686...
// debug:    {
// debug:      "methodId": "methodIdValue",
// debug:      "merchantId": "merchantIdValue",
// debug:      "timestamp": 1676876779118,
// debug:      "transactionId": "transactionIdValue",
// debug:      "userId": "userIdValue"
// debug:    }
// debug:
// debug:    done
// debug:    [
// debug:      "user#userIdValue|transaction",
// debug:      "user#userIdValue|transaction!0",
// debug:      "user#userIdValue|transaction!1",
// debug:      "user#userIdValue|transaction!2",
// debug:      "user#userIdValue|transaction!3",
// debug:      "user#userIdValue|transaction!4",
// debug:      "user#userIdValue|transaction!5",
// debug:      "user#userIdValue|transaction!6",
// debug:      "user#userIdValue|transaction!7"
// debug:    ]
```

See [unit tests](https://github.com/karmaniverous/entity-manager/blob/main/lib/EntityManager/EntityManager.test.js) for more usage examples.

## Future-Proofing

The current design provides for scaling via planned increases in shard key length. The number of shards per key character does not need to be decided until shard keys are first applied.

This design assumes that currently-defined key structures will remain stable across the life of the database, meaning new ones could be layered on but existing ones should not be changed once in use.

The same technique that provides for shard key length bumps could also be applied to such schema changes, permitting unified query across schema changes in the same manner as the package currently supports unified query across shards.

This change can be accomplished with no breaking changes to existing implementations.
