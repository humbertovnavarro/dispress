import { Track } from 'discord-player';
import { Guild } from 'discord.js';
import prisma from '../../../lib/PrismaClient';

export default async function getTrackStatistics(track: Track, guild: Guild) {
  return prisma.songs.findFirst({
    where: {
      id: `${track.url}-${guild.id}`
    }
  });
}
