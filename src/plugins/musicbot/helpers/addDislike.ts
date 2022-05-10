import type { Track } from 'discord-player';
import type { Guild } from 'discord.js';
import prisma from '../../../lib/PrismaClient';
const addDislike = async (track: Track, guild: Guild) => {
  const userId = track.requestedBy.id;
  try {
    const dislike = await prisma.dislikes.findFirst({
      where: {
        user: track.requestedBy.id,
        song: track.url
      }
    });
    if (dislike) return false;
    await prisma.dislikes.create({
      data: {
        user: userId,
        song: track.url,
        guild: guild.id
      }
    });
    await prisma.songs.upsert({
      where: {
        id: `${track.url}-${guild.id}`
      },
      update: {
        dislikes: {
          increment: 1
        }
      },
      create: {
        id: `${track.url}-${guild.id}`,
        song: track.url,
        guild: guild.id,
        title: track.title,
        duration: track.duration,
        dislikes: 1
      }
    });
    return true;
  } catch (error) {
    // TODO: Ignore the error if it's a conflict error
    console.error(error);
    return false;
  }
};
export default addDislike;
