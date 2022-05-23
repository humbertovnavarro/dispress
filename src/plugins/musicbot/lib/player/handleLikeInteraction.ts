import prisma from '../../../../lib/PrismaClient';
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
  const user = track.requestedBy.id;
  const exists = await prisma.likes.findFirst({
    where: {
      guild: guild.id,
      song: track.url,
      user
    }
  });
  if (dislike === exists?.dislike) {
    await prisma.likes.deleteMany({
      where: {
        guild: guild.id,
        song: track.url,
        user
      }
    });
    return await getLikesAndDislikes(guild, track);
  } else if (exists) {
    await prisma.likes.updateMany({
      where: {
        guild: guild.id,
        song: track.url,
        user
      },
      data: {
        dislike
      }
    });
    return await getLikesAndDislikes(guild, track);
  }
  await prisma.likes.create({
    data: {
      guild: guild.id,
      song: track.url,
      user,
      dislike
    }
  });
  return await getLikesAndDislikes(guild, track);
}
