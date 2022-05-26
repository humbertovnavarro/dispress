import { Track } from 'discord-player';
import { Guild } from 'discord.js';
import getLikesAndDislikes from '../database/getLikesAndDislikes';
/**
 *
 * @param guild
 * @param track
 * @returns An object containing the delta between front and backend likes/dislikes
 */
export default async function handleLikeInteraction(
  guild: Guild,
  track: Track,
  dislike: boolean
): Promise<{
  likes: number;
  dislikes: number;
}> {
  return await getLikesAndDislikes(guild, track);
}
