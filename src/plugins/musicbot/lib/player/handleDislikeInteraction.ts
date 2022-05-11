import { Track } from 'discord-player';
import { Guild } from 'discord.js';

/**
 *
 * @param guild
 * @param track
 * @returns An object containing the delta between front and backend likes/dislikes
 */
export default async function handleDislikeInteraction(
  guild: Guild,
  track: Track
): Promise<{
  dislikeDelta: number;
  likeDelta: number;
}> {
  return {
    dislikeDelta: 0,
    likeDelta: 0
  };
}
