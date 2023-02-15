# shard-key-manager

Configurably generate & scale partition shard keys over time.

## Installation

```bash
npm install @veterancrowd/shard-key-manager
```

## Usage

```js
// import package
import { ShardKeyManager } from '@veterancrowd/shard-key-manager';

// import config file
import shardKeyConfig from './shardKeyConfig.json' assert { type: 'json' };

// {
//    transaction: {        // entity token
//      nibbles: 1,         // default hex shard key length
//      bumps: {            // timestamped shard key length increases
//        1676354948256: 2,
//        1676554948256: 3
//      }
//    }
// }

// create ShardKeyManager instance
const shardKeyManager = new ShardKeyManager({ config: shardKeyConfig });

// generate a current shard key (current timestamp: 1676454948256)
let shardKey = shardKeyManager.getShardKey(
  'transaction',
  'some_transaction_key'
);

// 'ca'

// generate a shard key for some other timestamp
shardKey = shardKeyManager.getShardKey(
  'transaction',
  'some_transaction_key',
  1676554948256
);

// 'ca6'

// generate the space of all valid shard keys for an entity as of a timestamp
const shardKeySpace = shardKeyManager.getShardKeySpace(
  'transaction',
  1676254948256
);

// [
//   '0', '1', '2', '3', '4', '5', '6', '7',
//   '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
// ]
```
