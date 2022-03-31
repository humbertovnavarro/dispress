import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { UsePlayer, Queue, Track } from '../helpers/player';

const body = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('shows the queue');

export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if (!interaction.guild) {
      return;
    }

    const player = UsePlayer(interaction.client);
    const queue: Queue = player.getQueue(interaction.guild) as Queue;

    if (!queue) return interaction.reply('there is no queue');

    const tracks = queue.tracks;
    const playing = queue.previousTracks[0];
    const embed = new MessageEmbed()
      .setTitle('Song queue')
      .addField(`Playing -- **${playing.title}**`, playing.duration);

    tracks.forEach((track: Track, index: number) => {
      embed.addField(`\`${index + 1}.\` **${track.title}**`, track.duration);
    });

    interaction.reply({
      embeds: [embed]
    });
  }
};
