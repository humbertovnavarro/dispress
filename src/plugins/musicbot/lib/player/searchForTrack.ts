import { Player, Track } from 'discord-player';
import { Guild, User } from 'discord.js';
import addPlay from '../database/addPlay';
export default async function searchForTrack(
  player: Player,
  guild: Guild,
  user: User,
  query: string
) {
  let track: Track | undefined = undefined;
  try {
    track = await new Promise<Track | undefined>((resolve, reject) => {
      setTimeout(() => {
        reject('timed out.');
      }, 10000);
      player
        .search(query, { requestedBy: user })
        .then(result => {
          for (const track of result.tracks) {
            if (track.durationMS < 60 * 1000 * 20) {
              resolve(track);
              return;
            }
          }
          return undefined;
        })
        .catch(error => {
          reject(error);
        });
    });
  } catch (error) {
    console.error(error);
  }
  if (track) {
    await addPlay(track, guild);
  }
  return track;
}
