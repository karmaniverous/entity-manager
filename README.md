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

# API Documentation

<a name="module_ShardKeyManager"></a>

## ShardKeyManager

* [ShardKeyManager](#module_ShardKeyManager)
    * _static_
        * [.ShardKeyManager](#module_ShardKeyManager.ShardKeyManager)
            * [new exports.ShardKeyManager(options)](#new_module_ShardKeyManager.ShardKeyManager_new)
            * _instance_
                * [.config](#module_ShardKeyManager.ShardKeyManager+config) ⇒ <code>ShardKeyManagerConfig</code>
                * [.bump(entityToken, timestamp, value)](#module_ShardKeyManager.ShardKeyManager+bump)
                * [.getNibbles(entityToken, [timestamp])](#module_ShardKeyManager.ShardKeyManager+getNibbles) ⇒ <code>number</code>
                * [.getShardKey(entityToken, entityKey, [timestamp])](#module_ShardKeyManager.ShardKeyManager+getShardKey) ⇒ <code>string</code>
                * [.getShardKeySpace(entityToken, [timestamp])](#module_ShardKeyManager.ShardKeyManager+getShardKeySpace) ⇒ <code>Array.&lt;string&gt;</code>
            * _static_
                * [.conformConfig([options])](#module_ShardKeyManager.ShardKeyManager.conformConfig) ⇒ <code>ShardKeyManagerConfig</code>
    * _inner_
        * [~ShardEntityConfig](#module_ShardKeyManager..ShardEntityConfig) : <code>object</code>
        * [~ShardKeyManagerConfig](#module_ShardKeyManager..ShardKeyManagerConfig) : <code>Object.&lt;string, ShardEntityConfig&gt;</code>

<a name="module_ShardKeyManager.ShardKeyManager"></a>

### ShardKeyManager.ShardKeyManager
Configurably generate and scale partition shards over time.

**Kind**: static class of [<code>ShardKeyManager</code>](#module_ShardKeyManager)  

* [.ShardKeyManager](#module_ShardKeyManager.ShardKeyManager)
    * [new exports.ShardKeyManager(options)](#new_module_ShardKeyManager.ShardKeyManager_new)
    * _instance_
        * [.config](#module_ShardKeyManager.ShardKeyManager+config) ⇒ <code>ShardKeyManagerConfig</code>
        * [.bump(entityToken, timestamp, value)](#module_ShardKeyManager.ShardKeyManager+bump)
        * [.getNibbles(entityToken, [timestamp])](#module_ShardKeyManager.ShardKeyManager+getNibbles) ⇒ <code>number</code>
        * [.getShardKey(entityToken, entityKey, [timestamp])](#module_ShardKeyManager.ShardKeyManager+getShardKey) ⇒ <code>string</code>
        * [.getShardKeySpace(entityToken, [timestamp])](#module_ShardKeyManager.ShardKeyManager+getShardKeySpace) ⇒ <code>Array.&lt;string&gt;</code>
    * _static_
        * [.conformConfig([options])](#module_ShardKeyManager.ShardKeyManager.conformConfig) ⇒ <code>ShardKeyManagerConfig</code>

<a name="new_module_ShardKeyManager.ShardKeyManager_new"></a>

#### new exports.ShardKeyManager(options)
Create a ShardKeyManager instance.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options object. |
| [options.config] | <code>ShardKeyManagerConfig</code> | ShardKeyManager configuration object. |
| [options.logger] | <code>object</code> | Logger instance (defaults to console, must support error & debug methods). |

<a name="module_ShardKeyManager.ShardKeyManager+config"></a>

#### shardKeyManager.config ⇒ <code>ShardKeyManagerConfig</code>
Get config.

**Kind**: instance property of [<code>ShardKeyManager</code>](#module_ShardKeyManager.ShardKeyManager)  
**Returns**: <code>ShardKeyManagerConfig</code> - ShardKeyManager configuration object.  
<a name="module_ShardKeyManager.ShardKeyManager+bump"></a>

#### shardKeyManager.bump(entityToken, timestamp, value)
Bump nibbles for a given entityToken.

**Kind**: instance method of [<code>ShardKeyManager</code>](#module_ShardKeyManager.ShardKeyManager)  

| Param | Type | Description |
| --- | --- | --- |
| entityToken | <code>string</code> | Entity token. |
| timestamp | <code>number</code> | Timestamp in milliseconds. Must be after current timestamp. |
| value | <code>number</code> | Number of nibbles to bump (defaults to 1). |

<a name="module_ShardKeyManager.ShardKeyManager+getNibbles"></a>

#### shardKeyManager.getNibbles(entityToken, [timestamp]) ⇒ <code>number</code>
Get the number of nibbles for a given entityToken at a given timestamp.

**Kind**: instance method of [<code>ShardKeyManager</code>](#module_ShardKeyManager.ShardKeyManager)  
**Returns**: <code>number</code> - Nibbles for entity token at timestamp.  

| Param | Type | Description |
| --- | --- | --- |
| entityToken | <code>string</code> | Entity token. |
| [timestamp] | <code>number</code> | Timestamp in milliseconds (defaults to current time). |

<a name="module_ShardKeyManager.ShardKeyManager+getShardKey"></a>

#### shardKeyManager.getShardKey(entityToken, entityKey, [timestamp]) ⇒ <code>string</code>
Return a shard key for a given entity token, entity id & timestamp.

**Kind**: instance method of [<code>ShardKeyManager</code>](#module_ShardKeyManager.ShardKeyManager)  
**Returns**: <code>string</code> - shard key.  

| Param | Type | Description |
| --- | --- | --- |
| entityToken | <code>string</code> | Entity token. |
| entityKey | <code>string</code> | Entity id. |
| [timestamp] | <code>number</code> | Timestamp in milliseconds (defaults to current time). |

<a name="module_ShardKeyManager.ShardKeyManager+getShardKeySpace"></a>

#### shardKeyManager.getShardKeySpace(entityToken, [timestamp]) ⇒ <code>Array.&lt;string&gt;</code>
Return an array of shard keys valid for a given entity token & timestamp.

**Kind**: instance method of [<code>ShardKeyManager</code>](#module_ShardKeyManager.ShardKeyManager)  
**Returns**: <code>Array.&lt;string&gt;</code> - shard key space.  

| Param | Type | Description |
| --- | --- | --- |
| entityToken | <code>string</code> | Entity token. |
| [timestamp] | <code>number</code> | Timestamp in milliseconds (defaults to current time). |

<a name="module_ShardKeyManager.ShardKeyManager.conformConfig"></a>

#### ShardKeyManager.conformConfig([options]) ⇒ <code>ShardKeyManagerConfig</code>
Conform & validate config to schema.

**Kind**: static method of [<code>ShardKeyManager</code>](#module_ShardKeyManager.ShardKeyManager)  
**Returns**: <code>ShardKeyManagerConfig</code> - Conformed & validated config.  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | Options object. |
| [options.config] | <code>ShardKeyManagerConfig</code> | ShardKeyManager configuration object. |
| [options.logger] | <code>object</code> | ShardKeyManager configuration object. |

<a name="module_ShardKeyManager..ShardEntityConfig"></a>

### ShardKeyManager~ShardEntityConfig : <code>object</code>
Configuration object for a single sharded entity

**Kind**: inner typedef of [<code>ShardKeyManager</code>](#module_ShardKeyManager)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [nibbles] | <code>number</code> | Hex digits in initial shard key. |
| [bumps] | <code>Object.&lt;number, number&gt;</code> | Timestamp-keyed increases in nibbles. |

<a name="module_ShardKeyManager..ShardKeyManagerConfig"></a>

### ShardKeyManager~ShardKeyManagerConfig : <code>Object.&lt;string, ShardEntityConfig&gt;</code>
ShardKeyManager configuration object.

**Kind**: inner typedef of [<code>ShardKeyManager</code>](#module_ShardKeyManager)  

---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!
