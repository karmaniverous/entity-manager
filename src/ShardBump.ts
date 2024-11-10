/**
 * Defines a single time period in an entity sharding strategy.
 *
 * @category Config
 * @protected
 */
export interface ShardBump {
  /**
   * The timestamp marking the beginning of the time period. Must be a non-negative integer.
   *
   * This value must be unique across all {@link ShardBump | `ShardBumps`} for the entity.
   */
  timestamp: number;

  /**
   * The number of bits per character in the bump's shard space. For example, `0` yields a single shard per character, and a value of `2` would yield 4 shards per character.
   *
   * This value must be an integer between `1` and `5` inclusive.
   */
  charBits: number;

  /**
   * The number of characters used to represent the bump's shard key.
   *
   * This value must be an integer between `0` and `40` inclusive. Note that more than a few characters will result in an impossibly large shard space!   *
   * A ShardBump with `chars` of `2` and `charBits` of `3` would yield a two-character shard key with a space of 16 shards.
   */
  chars: number;
}
