import { Queue, Track } from 'discord-player';
import { Message, MessageEmbed } from 'discord.js';
import { QueueMeta, TrackEmbed } from '../../../../lib/dispress/dispress';
import getTrackStatistics from '../database/getTrack';
import { raceWithTimeout } from '../utils/promises';
import userInBotChannel from '../utils/userInBotChannel';
import handleLikeInteraction from './handleLikeInteraction';
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
    plays: 0,
    likes: 0,
    dislikes: 0,
    startedAt: Date.now(),
    done: false
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
  } catch (error) {
    console.error(error);
    return;
  }

  const reactions = ['⏸️', '🛑', '▶️', '⏭️', '❤️', '💩'];
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
        reaction.emoji.name === '💩'
      );
    }
  });
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
        queue.player.deleteQueue(channel.guild);
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
    }
    reaction.users.remove(user);
  });
  const interval = setInterval(async () => {
    refreshTrackEmbed(playerEmbedOptions, message);
  }, 5000);
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
}

export function generateTrackEmbed(options: TrackEmbedOptions): MessageEmbed {
  const {
    title,
    avatar,
    author,
    thumbnail,
    url,
    track,
    likes,
    dislikes,
    plays,
    startedAt
  } = options;
  const deltaTime = Date.now() - startedAt;
  const progress = Math.floor((deltaTime / track.durationMS) * 100);
  const embed = new MessageEmbed()
    .setTitle(`${title}`)
    .setThumbnail(avatar)
    .setDescription(author)
    .setImage(thumbnail)
    .setURL(url)
    .setColor('DARK_RED')
    .setFooter({
      text: `${percentageToProgressBar(progress)}`
    })
    .addField('requested by', track.requestedBy.tag)
    .addField(
      `${track.duration}\``,
      `\`❤️ ${likes} | 💩 ${dislikes} | ▶️ ${plays} \``
    );
  return embed;
}

async function refreshTrackEmbed(
  options: TrackEmbedOptions,
  message: Message
): Promise<void> {
  await message.edit({ embeds: [generateTrackEmbed(options)] });
}

const progressBarLength = 24;
export const progressBarBackgroundCharacter = '⬛';
export const progressBarForegroundCharacter = '🟩';

export function percentageToProgressBar(percentage: number): string {
  const index = Math.floor((percentage / 100) * progressBarLength);
  const foreground = progressBarForegroundCharacter.repeat(index);
  const background = progressBarBackgroundCharacter.repeat(
    progressBarLength - index
  );
  return `${foreground}${background}`;
}
