import { Queue, Track } from 'discord-player';
import { Message, MessageEmbed } from 'discord.js';
import { getConfig } from '../../../../lib/config';
import { QueueMeta, TrackEmbed } from '../../../../lib/dispress/dispress';
import { raceWithTimeout } from '../utils/promises';
import userInBotChannel from '../utils/userInBotChannel';
export const createTrackEmbed = async (
  queue: Queue<QueueMeta>,
  track: Track
): Promise<TrackEmbed | undefined> => {
  let { title, thumbnail, url, author } = track;
  const channel = queue.metadata?.channel;
  if (!channel) {
    throw new Error('No channel found for queue');
  }
  author = `Uploaded by ${author}`;
  let avatar: string =
    track.requestedBy.avatarURL() || track.requestedBy.defaultAvatarURL;
  const playerEmbedOptions = {
    title,
    avatar,
    author,
    thumbnail,
    url,
    track,
    queue,
    plays: 0,
    likes: 0,
    dislikes: 0,
    startedAt: Date.now(),
    done: false
  };
  let message: Message;
  try {
    if (channel.lastMessage?.editable) {
      message = (await channel.lastMessage.edit({
        embeds: [generateTrackEmbed(playerEmbedOptions)]
      })) as Message;
    } else {
      message = (await channel.send({
        embeds: [generateTrackEmbed(playerEmbedOptions)]
      })) as Message;
    }
  } catch (error) {
    console.error(error);
    return;
  }

  const reactions = ['⏸️', '🛑', '▶️', '⏭️'];
  await raceWithTimeout(message.react(reactions[0]), 10);
  await raceWithTimeout(message.react(reactions[1]), 10);
  await raceWithTimeout(message.react(reactions[2]), 10);
  await raceWithTimeout(message.react(reactions[3]), 10);
  const collector = message.createReactionCollector({
    time: getConfig<number>('plugins.musicbot.reactionCollectorTimeout'),
    filter: reaction => {
      return (
        reaction.emoji.name === '⏸️' ||
        reaction.emoji.name === '🛑' ||
        reaction.emoji.name === '▶️' ||
        reaction.emoji.name === '⏭️'
      );
    }
  });
  collector.on('collect', async (reaction, user) => {
    if (!message.guild || user.bot || !userInBotChannel(user, channel.guild))
      return;
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
        queue.player.deleteQueue(channel.guild);
        break;
    }
    reaction.users.remove(user);
  });
  const interval = setInterval(async () => {
    refreshTrackEmbed(playerEmbedOptions, message);
  }, 500);
  const trackEmbed = {
    message,
    interval,
    collector,
    destroy: () => {
      clearInterval(interval);
      message.reactions.removeAll();
      collector.stop();
    }
  };
  trackEmbed.destroy = trackEmbed.destroy.bind(trackEmbed);
  return trackEmbed;
};

export interface TrackEmbedOptions {
  title: string;
  avatar: string;
  author: string;
  thumbnail: string;
  url: string;
  track: Track;
  plays: number;
  likes: number;
  dislikes: number;
  startedAt: number;
  queue: Queue<QueueMeta>;
}

export function generateTrackEmbed(options: TrackEmbedOptions): MessageEmbed {
  const { title, avatar, author, thumbnail, url, track, queue } = options;
  const timestamp = queue.getPlayerTimestamp();
  const embed = new MessageEmbed()
    .setTitle(`${title}`)
    .setThumbnail(avatar)
    .setDescription(author)
    .setImage(thumbnail)
    .setURL(url)
    .setColor('DARK_RED')
    .addField('requested by', track.requestedBy.tag)
    .addField('duration', `${timestamp.current} / ${timestamp.end}`)
    .setFooter({
      text: queue.createProgressBar({
        timecodes: false,
        length: 32
      })
    });
  return embed;
}

async function refreshTrackEmbed(
  options: TrackEmbedOptions,
  message: Message
): Promise<void> {
  await message.edit({ embeds: [generateTrackEmbed(options)] });
}

const progressBarLength = 140;
export const progressBarBackgroundCharacter = ' ';
export const progressBarForegroundCharacter = '|';

export function percentageToProgressBar(percentage: number): string {
  const index = Math.floor((percentage / 100) * progressBarLength);
  const foreground = progressBarForegroundCharacter.repeat(index);
  const background = progressBarBackgroundCharacter.repeat(
    progressBarLength - index
  );
  return `${foreground}${background}`;
}
