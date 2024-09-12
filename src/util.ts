/**
 * Return an array of shard keys valid for a given shardBumps array & timestamp
 * range.
 *
 * @param shardBumps - Array of ShardBump.
 * @param timestampFrom - Lower timestamp limit of shard key space. Defaults to `0`.
 * @param timestampTo - Upper timestamp limit of shard key space Defaults to `Date.now()`.
 * @returns Shard key space.
 */
export const getShardKeySpace = (
  shardBumps: ShardBump[],
  timestampFrom = 0,
  timestampTo = Date.now(),
) => {
  if (!shardBumps.length) throw new Error('no shardBumps defined');

  validateTimestamp(timestampFrom);
  validateTimestamp(timestampTo);

  const lastBump = shardBumps.length - 1;

  return shardBumps
    .filter(
      (bump, i) =>
        (i === lastBump || shardBumps[i + 1].timestamp > timestampFrom) &&
        bump.timestamp <= timestampTo,
    )
    .flatMap(({ nibbleBits, nibbles }) => {
      const radix = 2 ** nibbleBits;

      return nibbles
        ? [...range(0, radix ** nibbles - 1)].map((nibble) =>
            nibble.toString(radix).padStart(nibbles, '0'),
          )
        : undefined;
    });
};
