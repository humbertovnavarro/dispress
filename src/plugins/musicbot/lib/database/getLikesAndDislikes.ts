import { Track } from 'discord-player';
import { Guild } from 'discord.js';
export default async function getLikesAndDislikes(guild: Guild, track: Track) {
  return {
    likes: 0,
    dislikes: 0
  };
}
