import type { Track } from 'discord-player';
import type { Guild } from 'discord.js';
const removeLike = async (track: Track, guild: Guild) => {
  const userId = track.requestedBy.id;
};
export default removeLike;
