import { Track } from 'discord-player';
import { Guild } from 'discord.js';
import prisma from '../../../../lib/PrismaClient';
import getLikesAndDislikes from './getLikesAndDislikes';

export default async function getTrackStatistics(track: Track, guild: Guild) {
  const song = await prisma.songs.findFirst({
    where: {
      id: `${track.url}-${guild.id}`
    }
  });
  const likesAndDislikes = await getLikesAndDislikes(guild, track);
  const { likes, dislikes } = likesAndDislikes;
  return {
    plays: song?.plays || 1,
    likes,
    dislikes
  }
}
