import { Player, Queue, Track } from 'discord-player';
import { Client, Guild, VoiceBasedChannel } from 'discord.js';
import { Reverbnation } from '@discord-player/extractor';
import _ from 'lodash';
import { QueueMeta } from '../../../../lib/dispress/dispress';
import { createTrackEmbed } from './TrackEmbed';

let player: Player | undefined;

const cleanupEmbed = (queue: Queue<QueueMeta>) => {
  queue.metadata?.embed?.destroy();
};

export function UsePlayer(client: Client): Player {
  if (player) return player;
  player = new Player(client);
  player.use('reverbnation', Reverbnation);

  player.on('trackStart', (queue, track) => {
    cleanupEmbed(queue as Queue<QueueMeta>);
    trackStart(queue as Queue<QueueMeta>, track);
  });

  player.on('botDisconnect', (queue: Queue) => {
    cleanupEmbed(queue as Queue<QueueMeta>);
    queue.connection.disconnect();
    queue.destroy();
  });

  player.on('channelEmpty', (queue: Queue) => {
    cleanupEmbed(queue as Queue<QueueMeta>);
    queue.connection.disconnect();
    queue.destroy();
  });

  player.on('queueEnd', (queue: Queue) => {
    cleanupEmbed(queue as Queue<QueueMeta>);
    queue.connection.disconnect();
  });

  player.on('botDisconnect', (queue: Queue) => {
    cleanupEmbed(queue as Queue<QueueMeta>);
    queue.connection.disconnect();
  });

  player.on('connectionError', (queue: Queue) => {
    cleanupEmbed(queue as Queue<QueueMeta>);
    queue.connection.disconnect();
  });

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
  const trackEmbed = await createTrackEmbed(queue, track);
  if (!trackEmbed)
    return queue.metadata.channel.send(
      'An error occured while trying to create the embed'
    );
  queue.metadata.embed = trackEmbed;
};
