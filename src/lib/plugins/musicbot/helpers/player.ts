import {
  Player,
  Queue as DiscordPlayerQueue,
  Track as DiscordPlayerTrack
} from 'discord-player';
import {
  Client,
  Collection,
  Guild,
  Message,
  MessageEmbed,
  ReactionCollector,
  TextChannel,
  User,
  VoiceBasedChannel
} from 'discord.js';
import { Reverbnation, Lyrics } from '@discord-player/extractor';
import _ from 'lodash';
import addLike from './addLike';

export interface Track extends DiscordPlayerTrack {
  query: string;
}

export interface Queue extends DiscordPlayerQueue {
  tracks: Track[];
  metadata?: {
    channel?: TextChannel;
  };
}

let lyricsClient: {
  search: (query: string) => Promise<Lyrics.LyricsData>;
};

let player: Player | undefined;
const activeCollectors: ReactionCollector[] = [];
const cleanupCollectors = () => {
  activeCollectors.forEach(collector => collector.stop());
};

export function UsePlayer(client: Client): Player {
  if (player) return player;
  player = new Player(client);
  lyricsClient = Lyrics.init();
  player.use('reverbnation', Reverbnation);
  player.on('trackStart', cleanupCollectors);
  player.on('trackEnd', cleanupCollectors);
  player.on('queueEnd', cleanupCollectors);
  player.on('botDisconnect', cleanupCollectors);
  player.on('connectionError', cleanupCollectors);
  return player;
}

export function UseQueue(guild: Guild): Queue {
  return UsePlayer(guild.client).createQueue(guild) as Queue;
}

export function GetActiveChannel(guild: Guild): VoiceBasedChannel | undefined {
  const id = player?.client.user?.id;
  if (!id) return;
  const member = guild.members.cache.get(id);
  if (!member) return;
  return member.voice.channel || undefined;
}

export const trackStart = async (queue: Queue, track: Track) => {
  const channel = queue.metadata?.channel;
  if (!channel) return;
  let { title, thumbnail, url, author } = track;
  author = `uploaded by ${author}`;
  let avatar: string =
    track.requestedBy.avatarURL() || track.requestedBy.defaultAvatarURL;
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
    .addField('requested by', track.requestedBy.tag);
  let message: Message;

  try {
    message = (await channel.send({ embeds: [embed] })) as Message;
  } catch(error) {
    console.warn(error);
    return;
  }

  await Promise.all([
    message.react('⏸️'),
    message.react('▶️'),
    message.react('⏭️'),
    message.react('🛑'),
    message.react('❤️'),
    message.react('📖'),
  ]);

  const collector = message.createReactionCollector({ time: 3600000, filter: (reaction) => {
    return reaction.emoji.name === '⏸️' ||
        reaction.emoji.name === '🛑' ||
        reaction.emoji.name === '▶️' ||
        reaction.emoji.name === '⏭️' ||
        reaction.emoji.name === '❤️' ||
        reaction.emoji.name === '😒' ||
        reaction.emoji.name === '📖'
  } });
  activeCollectors.push(collector);
  const likeMap = new Collection();
  let didOpenLyrics = false;
  collector.on('collect', (reaction, user) => {
    if (!message.guild || user.bot || !userInBotChannel(user, channel.guild)) return;
    switch(reaction.emoji.name) {
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
        if (likeMap.has(user.id)) break;
        likeMap.set(user.id, true);
        addLike(track, message.guild);
        break;
      case '📖':
        if (didOpenLyrics) return;
        postLyrics(channel, track);
        didOpenLyrics = true;
      break;
    }
    reaction.users.remove(user);
  });
};

export function userInBotChannel(user: User, guild: Guild): boolean {
  const channel = GetActiveChannel(guild);
  let match = false;

  channel?.members.forEach(member => {
    if (member.id === user.id) {
      match = true;
    }
  });

  return match;
}

async function postLyrics(channel: TextChannel, track: Track) {
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
