import { Player, PlayerSearchResult, Track } from "discord-player";
import { User } from "discord.js";

export default async function searchForTrack(query: string, user: User, player: Player): Promise<Track | undefined> {
  const track: Track | undefined = (await player
  .search(query, {
    requestedBy: user
  })
  .then((result: PlayerSearchResult) => {
    if(query.startsWith("https://")) {
      return result.tracks[0];
    }
    for (const track of result.tracks) {
      if (track.durationMS !== 0 && track.durationMS < 60 * 1000 * 20) {
        return track;
      }
    }
  })
  .catch((error: any) => {
    console.error(error);
  })) as Track | undefined;
  return track;
}
