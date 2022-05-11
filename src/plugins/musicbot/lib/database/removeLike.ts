import type { Track } from 'discord-player';
import type { Guild } from 'discord.js';
import prisma from "../../../../lib/PrismaClient";
const removeLike = async (track: Track, guild: Guild) => {
  const userId = track.requestedBy.id;
  return !!(await prisma.likes.deleteMany({
    where: {
      song: track.url,
      user: track.requestedBy.id,
      guild: guild.id
    }
  }));
};
export default removeLike;
