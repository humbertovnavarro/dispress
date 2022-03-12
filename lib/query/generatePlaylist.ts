import { Guild } from "discord.js";
import _ from "lodash";
import db from '../query/db';
interface Result {
    url: string;
    count: number;
    guild: string;
}

const generatePlaylist = async (guild: Guild): Promise<string[]> => {
    console.log(guild.id)
    let mostPlayed = db.prepare(`
        SELECT * FROM SongPlayCount WHERE guild = ? order by count desc limit 20;
    `).all(guild.id) as Result[];
    let mostLiked = db.prepare(`
        SELECT * FROM SongLikeCount WHERE guild = ? order by count desc limit 20;
    `).all(guild.id) as Result[];
    let results = _.uniq(mostPlayed.concat(mostLiked)).map(result => result.url);
    return  _.shuffle(results);
}
export default generatePlaylist;
