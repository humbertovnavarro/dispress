import { TextChannel } from 'discord.js';
import { Track } from 'discord-player';
import { Lyrics } from '@discord-player/extractor';

interface CustomTrack extends Track {
  query: string;
}

export function TrackIsCustomTrack(track: Track): track is CustomTrack {
  const trackRef = track as CustomTrack;
  return typeof trackRef.query === 'string';
}

export default async function postLyrics(
  lyricsClient: {
    search: (query: string) => Promise<Lyrics.LyricsData>;
  },
  channel: TextChannel,
  track: Track
) {
  if (!TrackIsCustomTrack(track)) {
    try {
      return channel.send('No lyrics available');
    } catch (error) {
      console.error(error);
    }
    return;
  }
  let lyrics: string | undefined;
  try {
    let res = await lyricsClient.search(track.title);
    if (res.lyrics) lyrics = res.lyrics;
  } catch {
    try {
      let res = await lyricsClient.search(track.query);
      if (res.lyrics) lyrics = res.lyrics;
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  if (!lyrics) return;

  lyrics = '\n' + 'Lyrics: ' + '\n\n' + lyrics;

  return channel.send(lyrics.slice(0, 2000));
}
