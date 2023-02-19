# entity-manager

Configurably decorate entity objects with sharded index keys..

To install:

```bash
npm install @veterancrowd/entity-manager
```

# API Documentation

<a name="module_EntityManager"></a>

## EntityManager

* [EntityManager](#module_EntityManager)
    * [.EntityManager](#module_EntityManager.EntityManager)
        * [new exports.EntityManager(options)](#new_module_EntityManager.EntityManager_new)

<a name="module_EntityManager.EntityManager"></a>

### EntityManager.EntityManager
Manage DynamoDb entities.

**Kind**: static class of [<code>EntityManager</code>](#module_EntityManager)  
<a name="new_module_EntityManager.EntityManager_new"></a>

#### new exports.EntityManager(options)
Create an EntityManager instance.

**Throws**:

- <code>Error</code> If config is invalid.
- <code>Error</code> If logger is invalid.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | Options object. |
| [options.config] | <code>object</code> | EntityManager configuration object. |
| [options.logger] | <code>object</code> | Logger instance (defaults to console, must support error & debug methods). |


---

See more great templates and other tools on
[my GitHub Profile](https://github.com/karmaniverous)!
