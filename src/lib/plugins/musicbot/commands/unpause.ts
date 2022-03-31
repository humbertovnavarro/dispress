import { SlashCommandBuilder } from '@discordjs/builders';
import { Queue } from 'discord-player';
import { CommandInteraction } from 'discord.js';
import { UsePlayer, userInBotChannel } from '../helpers/player';

const body = new SlashCommandBuilder()
  .setName('unpause')
  .setDescription('unpauses the song queue');

export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if (!interaction.guild) {
      return;
    }

    const player = UsePlayer(interaction.client);
    const queue: Queue = player.getQueue(interaction.guild);

    if (!queue) {
      return interaction.reply('There is nothing queued.');
    } else if (!userInBotChannel(interaction.user, interaction.guild)) {
      return interaction.reply('You must be in the same channel as the bot.');
    }

    queue.setPaused(false);
    return interaction.reply('ok');
  }
};
