import { Guild } from 'discord.js';
import _ from 'lodash';
import db from '../../../../lib/PrismaClient';
import dotenv from 'dotenv';
import { getKey } from '../../../../lib/config';
dotenv.config();
let dislikeThreshold: number | undefined;
const generatePlaylist = async (guild: Guild): Promise<string[]> => {
  if(!dislikeThreshold)
  dislikeThreshold = Number.parseInt(await getKey('config.musicbot.dislikeThreshold'));
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
  return _.shuffle(playlist);
};
export default generatePlaylist;
