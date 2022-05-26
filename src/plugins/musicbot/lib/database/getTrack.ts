import { Track } from 'discord-player';
import { Guild } from 'discord.js';
import getLikesAndDislikes from './getLikesAndDislikes';

export default async function getTrackStatistics(track: Track, guild: Guild) {
  const song = {
    plays: 1
  };
  const likesAndDislikes = await getLikesAndDislikes(guild, track);
  const { likes, dislikes } = likesAndDislikes;
  return {
    plays: song?.plays || 1,
    likes,
    dislikes
  };
}
