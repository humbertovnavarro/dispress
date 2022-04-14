import type { Track } from 'discord-player';
import type { Guild } from 'discord.js';
import prisma from '../../../lib/PrismaClient';
const addLike = async (track: Track, guild: Guild) => {
  const userId = track.requestedBy.id;
  try {
    await prisma.likes.create({
      data: {
        user: userId,
        song: track.url,
        guild: guild.id,
      }
    });
    await prisma.songs.upsert({
      where: {
        id: `${track.url}-${guild.id}`,
      },
      update: {
        likes: {
          increment: 1,
        }
      },
      create: {
        id: `${track.url}-${guild.id}`,
        song: track.url,
        guild: guild.id,
        title: track.title,
        duration: track.duration,
        likes: 1,
      }
    });
  } catch(error){
    // TODO: Ignore the error if it's a conflict error
    console.error(error);
  }
};
export default addLike;