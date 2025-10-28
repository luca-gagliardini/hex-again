/**
 * EntityManager - Core ECS implementation
 * Manages entities and their components
 */
export class EntityManager {
  constructor() {
    this.entities = new Map(); // entityId -> Map<componentType, component>
    this.nextEntityId = 1;
  }

  /**
   * Create a new entity with optional initial components
   * @param {Array} components - Array of component instances
   * @returns {number} entityId
   */
  createEntity(components = []) {
    const entityId = this.nextEntityId++;
    const componentMap = new Map();

    components.forEach(component => {
      // Use static type property instead of constructor.name (minification-safe)
      const componentType = component.constructor.type || component.constructor.name;
      componentMap.set(componentType, component);
    });

    this.entities.set(entityId, componentMap);
    return entityId;
  }

  /**
   * Destroy an entity and all its components
   * @param {number} entityId
   */
  destroyEntity(entityId) {
    this.entities.delete(entityId);
  }

  /**
   * Add a component to an entity
   * @param {number} entityId
   * @param {Object} component
   */
  addComponent(entityId, component) {
    const entity = this.entities.get(entityId);
    if (!entity) {
      throw new Error(`Entity ${entityId} does not exist`);
    }
    // Use static type property instead of constructor.name (minification-safe)
    const componentType = component.constructor.type || component.constructor.name;
    entity.set(componentType, component);
  }

  /**
   * Remove a component from an entity
   * @param {number} entityId
   * @param {string} componentType
   */
  removeComponent(entityId, componentType) {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.delete(componentType);
    }
  }

  /**
   * Get a specific component from an entity
   * @param {number} entityId
   * @param {string} componentType
   * @returns {Object|null}
   */
  getComponent(entityId, componentType) {
    const entity = this.entities.get(entityId);
    return entity ? entity.get(componentType) : null;
  }

  /**
   * Check if entity has a component
   * @param {number} entityId
   * @param {string} componentType
   * @returns {boolean}
   */
  hasComponent(entityId, componentType) {
    const entity = this.entities.get(entityId);
    return entity ? entity.has(componentType) : false;
  }

  /**
   * Query entities that have ALL specified component types
   * @param {...string} componentTypes
   * @returns {Array<{entityId: number, components: Map}>}
   */
  query(...componentTypes) {
    const results = [];

    this.entities.forEach((componentMap, entityId) => {
      const hasAll = componentTypes.every(type => componentMap.has(type));
      if (hasAll) {
        results.push({ entityId, components: componentMap });
      }
    });

    return results;
  }

  /**
   * Get all entities
   * @returns {Map}
   */
  getAllEntities() {
    return this.entities;
  }

  /**
   * Get total entity count
   * @returns {number}
   */
  getEntityCount() {
    return this.entities.size;
  }

  /**
   * Serialize all entities to JSON-compatible format
   * @returns {Array}
   */
  serialize() {
    const serialized = [];

    this.entities.forEach((componentMap, entityId) => {
      const components = [];

      componentMap.forEach((component, type) => {
        if (component.serialize) {
          components.push({
            type,
            data: component.serialize()
          });
        }
      });

      serialized.push({
        entityId,
        components
      });
    });

    return serialized;
  }

  /**
   * Deserialize entities from saved state
   * @param {Array} serialized
   * @param {Object} componentRegistry - Map of component type names to constructors
   */
  deserialize(serialized, componentRegistry) {
    this.entities.clear();
    let maxId = 0;

    serialized.forEach(entityData => {
      const componentMap = new Map();

      entityData.components.forEach(({ type, data }) => {
        const ComponentClass = componentRegistry[type];
        if (ComponentClass && ComponentClass.deserialize) {
          const component = ComponentClass.deserialize(data);
          componentMap.set(type, component);
        }
      });

      this.entities.set(entityData.entityId, componentMap);
      maxId = Math.max(maxId, entityData.entityId);
    });

    this.nextEntityId = maxId + 1;
  }

  /**
   * Clear all entities
   */
  clear() {
    this.entities.clear();
    this.nextEntityId = 1;
  }
}
