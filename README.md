# entity-manager

Configurably decorate entity objects with sharded index keys..

To install:

```bash
npm install @veterancrowd/entity-manager
```

See [unit tests](https://github.com/VeteranCrowd/entity-manager/blob/main/lib/EntityManager/EntityManager.test.js) for usage examples.

# API Documentation

<a name="module_EntityManager"></a>

## EntityManager

* [EntityManager](#module_EntityManager)
    * [.EntityManager](#module_EntityManager.EntityManager)
        * [new exports.EntityManager(options)](#new_module_EntityManager.EntityManager_new)
        * [.addKeys(entityToken, item, [overwrite])](#module_EntityManager.EntityManager+addKeys) ⇒ <code>object</code>
        * [.getKeySpace(entityToken, item, keyToken, timestamp)](#module_EntityManager.EntityManager+getKeySpace) ⇒ <code>Array.&lt;string&gt;</code>

<a name="module_EntityManager.EntityManager"></a>

### EntityManager.EntityManager
Manage DynamoDb entities.

**Kind**: static class of [<code>EntityManager</code>](#module_EntityManager)  

* [.EntityManager](#module_EntityManager.EntityManager)
    * [new exports.EntityManager(options)](#new_module_EntityManager.EntityManager_new)
    * [.addKeys(entityToken, item, [overwrite])](#module_EntityManager.EntityManager+addKeys) ⇒ <code>object</code>
    * [.getKeySpace(entityToken, item, keyToken, timestamp)](#module_EntityManager.EntityManager+getKeySpace) ⇒ <code>Array.&lt;string&gt;</code>

<a name="new_module_EntityManager.EntityManager_new"></a>

#### new exports.EntityManager(options)
Create an EntityManager instance.

**Throws**:

- <code>Error</code> If config is invalid.
- <code>Error</code> If logger is invalid.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options object. |
| [options.config] | <code>object</code> | EntityManager configuration object (see [unit tests](https://github.com/VeteranCrowd/entity-manager/blob/369d6bc22512cf58916551569cd2c8312077a038/lib/EntityManager/EntityManager.test.js#L17-L55) for an example). |
| [options.logger] | <code>object</code> | Logger instance (defaults to console, must support error & debug methods). |

<a name="module_EntityManager.EntityManager+addKeys"></a>

#### entityManager.addKeys(entityToken, item, [overwrite]) ⇒ <code>object</code>
Decorate an entity item with keys.

**Kind**: instance method of [<code>EntityManager</code>](#module_EntityManager.EntityManager)  
**Returns**: <code>object</code> - Decorated entity item.  
**Throws**:

- <code>Error</code> If entityToken is invalid.
- <code>Error</code> If item is invalid.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entityToken | <code>string</code> |  | Entity token. |
| item | <code>object</code> |  | Entity item. |
| [overwrite] | <code>boolean</code> | <code>false</code> | Overwrite existing properties. |

<a name="module_EntityManager.EntityManager+getKeySpace"></a>

#### entityManager.getKeySpace(entityToken, item, keyToken, timestamp) ⇒ <code>Array.&lt;string&gt;</code>
Return an array of sharded keys valid for a given entity token & timestamp.

**Kind**: instance method of [<code>EntityManager</code>](#module_EntityManager.EntityManager)  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of keys.  
**Throws**:

- <code>Error</code> If entityToken is invalid.
- <code>Error</code> If item is invalid.
- <code>Error</code> If keyToken is invalid.
- <code>Error</code> If timestamp is invalid.


| Param | Type | Description |
| --- | --- | --- |
| entityToken | <code>string</code> | Entity token. |
| item | <code>object</code> | Entity item. |
| keyToken | <code>string</code> | Key token. |
| timestamp | <code>number</code> | Timestamp. |


---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!
