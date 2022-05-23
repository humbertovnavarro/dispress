import 'discord-player/smoothVolume';
import { Player, Queue, Track } from 'discord-player';
import {
  Client,
  Guild,
  Message,
  MessageEmbed,
  ReactionCollector,
  VoiceBasedChannel
} from 'discord.js';
import { Reverbnation, Lyrics } from '@discord-player/extractor';
import _ from 'lodash';
import { QueueMeta } from '../../../../lib/dispress/dispress';
import getTrackStatistics from '../database/getTrack';
import handleLikeInteraction from './handleLikeInteraction';
import postLyrics from './postLyrics';
import userInBotChannel from '../utils/userInBotChannel';
import { raceWithTimeout } from '../utils/promises';

let lyricsClient: {
  search: (query: string) => Promise<Lyrics.LyricsData>;
};

let player: Player | undefined;

const activeCollectors: ReactionCollector[] = [];

const cleanupCollectors = () =>
  activeCollectors.forEach(collector => collector.stop());

export function UsePlayer(client: Client): Player {
  if (player) return player;
  player = new Player(client);
  lyricsClient = Lyrics.init();
  player.use('reverbnation', Reverbnation);

  player.on('trackStart', (queue, track) => {
    cleanupCollectors();
    trackStart(queue as Queue<QueueMeta>, track);
  });

  player.on('botDisconnect', (queue: Queue) => {
    cleanupCollectors();
    queue.destroy();
  });

  player.on('channelEmpty', (queue: Queue) => {
    cleanupCollectors();
    queue.destroy();
  });

  player.on('queueEnd', (queue: Queue) => {
    cleanupCollectors();
    queue.connection.disconnect();
  });

  player.on('botDisconnect', cleanupCollectors);

  player.on('connectionError', cleanupCollectors);

  return player;
}

export function UseQueue(guild: Guild): Queue<QueueMeta> {
  return UsePlayer(guild.client).createQueue(guild) as Queue<QueueMeta>;
}

export function GetActiveChannel(guild: Guild): VoiceBasedChannel | undefined {
  const id = player?.client.user?.id;
  if (!id) return;
  const member = guild.members.cache.get(id);
  if (!member) return;
  return member.voice.channel || undefined;
}

export const trackStart = async (queue: Queue<QueueMeta>, track: Track) => {
  if (!queue.metadata) return;
  const channel = queue.metadata?.channel;
  if (!channel) return;
  let { title, thumbnail, url, author } = track;
  author = `uploaded by ${author}`;
  let avatar: string =
    track.requestedBy.avatarURL() || track.requestedBy.defaultAvatarURL;
  const playerEmbedOptions = {
    title,
    avatar,
    author,
    thumbnail,
    url,
    track,
    plays: 0,
    likes: 0,
    dislikes: 0
  };
  try {
    let trackStats = await getTrackStatistics(track, channel.guild);
    if (!trackStats)
      throw new Error('song that was just added, not in database?');
    const { likes, dislikes, plays } = trackStats;
    playerEmbedOptions.plays = plays;
    playerEmbedOptions.likes = likes;
    playerEmbedOptions.dislikes = dislikes;
  } catch (error) {
    console.error(error);
  }

  let message: Message;
  try {
    message = (await channel.send({
      embeds: [generateTrackEmbed(playerEmbedOptions)]
    })) as Message;
    queue.metadata.embed = message;
  } catch (error) {
    console.warn(error);
    return;
  }

  const reactions = ['⏸️', '🛑', '▶️', '⏭️', '❤️', '💩', '📖'];
  await raceWithTimeout(message.react(reactions[0]), 10);
  await raceWithTimeout(message.react(reactions[1]), 10);
  await raceWithTimeout(message.react(reactions[2]), 10);
  await raceWithTimeout(message.react(reactions[3]), 10);
  await raceWithTimeout(message.react(reactions[4]), 10);
  await raceWithTimeout(message.react(reactions[5]), 10);
  const collector = message.createReactionCollector({
    time: 3600000,
    filter: reaction => {
      return (
        reaction.emoji.name === '⏸️' ||
        reaction.emoji.name === '🛑' ||
        reaction.emoji.name === '▶️' ||
        reaction.emoji.name === '⏭️' ||
        reaction.emoji.name === '❤️' ||
        reaction.emoji.name === '💩' ||
        reaction.emoji.name === '📖'
      );
    }
  });
  activeCollectors.push(collector);
  let didOpenLyrics = false;
  collector.on('collect', async (reaction, user) => {
    if (!message.guild || user.bot || !userInBotChannel(user, channel.guild))
      return;
    let likeDeltas: {
      likes: number;
      dislikes: number;
    };
    switch (reaction.emoji.name) {
      case '⏸️':
        queue.setPaused(true);
        break;
      case '▶️':
        queue.setPaused(false);
        break;
      case '⏭️':
        queue.skip();
        break;
      case '🛑':
        player?.deleteQueue(channel.guild);
        break;
      case '❤️':
        try {
          likeDeltas = await handleLikeInteraction(channel.guild, track, false);
        } catch (error) {
          console.error(error);
          break;
        }
        playerEmbedOptions.likes = likeDeltas.likes;
        playerEmbedOptions.dislikes = likeDeltas.dislikes;
        await refreshTrackEmbed(playerEmbedOptions, message);
        break;
      case '💩':
        try {
          likeDeltas = await handleLikeInteraction(channel.guild, track, true);
        } catch (error) {
          console.error(error);
          break;
        }
        playerEmbedOptions.likes = likeDeltas.likes;
        playerEmbedOptions.dislikes = likeDeltas.dislikes;
        await refreshTrackEmbed(playerEmbedOptions, message);
        break;
      case '📖':
        if (didOpenLyrics) return;
        postLyrics(lyricsClient, channel, track);
        didOpenLyrics = true;
        break;
    }
    reaction.users.remove(user);
  });
};

interface TrackEmbedOptions {
  title: string;
  avatar: string;
  author: string;
  thumbnail: string;
  url: string;
  track: Track;
  plays: Number;
  likes: Number;
  dislikes: Number;
}

async function refreshTrackEmbed(
  options: TrackEmbedOptions,
  message: Message
): Promise<void> {
  await message.edit({ embeds: [generateTrackEmbed(options)] });
}

function generateTrackEmbed(options: TrackEmbedOptions): MessageEmbed {
  const {
    title,
    avatar,
    author,
    thumbnail,
    url,
    track,
    likes,
    dislikes,
    plays
  } = options;
  const embed = new MessageEmbed()
    .setTitle(`${title}`)
    .setThumbnail(avatar)
    .setDescription(author)
    .setImage(thumbnail)
    .setURL(url)
    .setColor('DARK_RED')
    .setFooter({
      text: track.duration
    })
    .addField('requested by', track.requestedBy.tag)
    .addField('stats', `\`❤️ ${likes} | 💩 ${dislikes} | ▶️ ${plays} \``);
  return embed;
}
