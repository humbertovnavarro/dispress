import { Guild } from 'discord.js';
import _ from 'lodash';
import db from '../../../lib/PrismaClient';
import dotenv from 'dotenv';
dotenv.config();
const dislikeThreshold: number = Number.parseInt(
  process.env.DISLIKE_THRESHOLD || '1'
);
const generatePlaylist = async (guild: Guild): Promise<string[]> => {
  const mostPlayed = (
    await db.songs.findMany({
      where: {
        guild: guild.id,
        dislikes: {
          lt: dislikeThreshold
        }
      },
      orderBy: {
        plays: 'desc'
      },
      select: {
        song: true,
        likes: true
      },
      take: 15
    })
  )
    .sort((a, b) => b.likes - a.likes)
    .map(song => song.song);
  const mostLiked = (
    await db.songs.findMany({
      where: {
        guild: guild.id,
        dislikes: {
          lt: dislikeThreshold
        }
      },
      orderBy: {
        likes: 'desc'
      },
      select: {
        song: true
      },
      take: 15
    })
  ).map(song => song.song);
  const mostPlayedAndLiked = _.intersection(mostPlayed, mostLiked);
  const playlist = _.uniq(mostPlayedAndLiked.concat(mostPlayed, mostLiked));
  return playlist;
};
export default generatePlaylist;
