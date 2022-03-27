import type { Track } from 'discord-player';
import type { Guild } from 'discord.js';
import db from '../../../query/db';
const addPlay = (track: Track, guild: Guild) => {
  try {
    db.prepare(
      `
            INSERT INTO SongPlay (url, player, guild)
            VALUES (?,?,?);
        `
    ).run(track.url, track.requestedBy.id, guild.id);
    db.prepare(
      `
            INSERT INTO SongPlayCount (url, guild, count)
            VALUES (?, ?, 1)
            ON CONFLICT (url)
            DO UPDATE SET count = count + 1;
        `
    ).run(track.url, guild.id);
  } catch (error) {
    console.error(error);
  }
};
export default addPlay;
