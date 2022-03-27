import {
  SlashCommandBuilder,
  SlashCommandIntegerOption
} from '@discordjs/builders';
import { Queue } from 'discord-player';
import { CommandInteraction } from 'discord.js';
import { UsePlayer, userInBotChannel } from '../helpers/player';

const body = new SlashCommandBuilder()
  .setName('skip')
  .setDescription(
    'skip the current song, or skip to a specified index using skipto'
  )
  .addIntegerOption(
    new SlashCommandIntegerOption()
      .setMinValue(1)
      .setName('skipto')
      .setDescription('skip to a specified index')
      .setRequired(false)
  );

export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if (!interaction.guild) {
      return;
    }

    const player = UsePlayer(interaction.client);
    const queue: Queue | void = player.getQueue(interaction.guild);

    if (!queue) {
      return interaction.reply('There is nothing queued.');
    }

    if (!userInBotChannel(interaction.user, interaction.guild)) {
      return interaction.reply('You must be in the same channel as the bot.');
    }

    const index = interaction.options.getInteger('skipto', false);

    if (!index) {
      queue.skip();
    } else {
      if (index >= 1) {
        queue.skipTo(index - 1);
        return interaction.reply(`Skipped to position ${index}`);
      }
    }

    return interaction.reply('Song skipped.');
  }
};
