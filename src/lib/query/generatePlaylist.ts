import { Guild } from 'discord.js';
import _ from 'lodash';
import db from './db';

interface Result {
  url: string;
  count: number;
  guild: string;
}

const generatePlaylist = async (guild: Guild): Promise<string[]> => {
  let mostPlayed = db
    .prepare(
      `
        SELECT * FROM SongPlayCount WHERE guild = ? order by count desc limit 15;
    `
    )
    .all(guild.id) as Result[];

  let mostLiked = db
    .prepare(
      `
        SELECT * FROM SongLikeCount WHERE guild = ? order by count desc limit 15;
    `
    )
    .all(guild.id) as Result[];

  const urls = mostPlayed
    .map(track => track.url)
    .concat(mostLiked.map(track => track.url));

  return _.shuffle(_.uniq(urls)).slice(0, 14);
};
export default generatePlaylist;
