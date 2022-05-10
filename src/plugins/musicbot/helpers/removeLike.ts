import type { Track } from 'discord-player';
import type { Guild } from 'discord.js';
import prisma from '../../../lib/PrismaClient';
const removeLike = async (track: Track, guild: Guild) => {
  const userId = track.requestedBy.id;
  return !!prisma.likes.deleteMany({
    where: {
      song: track.url,
      user: track.requestedBy.id
    }
  });
};
export default removeLike;
