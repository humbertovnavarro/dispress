import type { Track } from 'discord-player';
import type { Guild } from 'discord.js';
import prisma from '../../../../lib/PrismaClient';
export default async function (track: Track, guild: Guild) {
  try {
    await prisma.songs.upsert({
      where: {
        id: `${track.url}-${guild.id}`,
      },
      update: {
        title: track.title,
        plays: {
          increment: 1,
        }
      },
      create: {
        id: `${track.url}-${guild.id}`,
        song: track.url,
        guild: guild.id,
        title: track.title,
        duration: track.duration,
        plays: 1,
      }
    });
    await prisma.plays.create({
      data: {
        user: track.requestedBy.id,
        song: track.url,
        guild: guild.id,
      }
    });
  } catch(error) {
    console.error(error);
  }
};
