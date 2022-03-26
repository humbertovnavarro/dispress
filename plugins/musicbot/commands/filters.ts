import {
  SlashCommandBuilder,
  SlashCommandStringOption
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { UsePlayer, UseQueue, userInBotChannel } from '../helpers/player';
const guildFilters = new Map<string, { [key: string]: boolean }>();
const body = new SlashCommandBuilder()
  .setName('filter')
  .setDescription('adds a filter to the player')
  .addStringOption(
    new SlashCommandStringOption()
      .setName('filter')
      .setDescription('Filter to apply to the queue')
      .setRequired(true)
      .addChoices([
        ['clear all filters', 'clear'],
        ['bassboost', 'bassboost'],
        ['8D', '8D'],
        ['vaporwave', 'vaporwave'],
        ['nightcore', 'nightcore'],
        ['phaser', 'phaser'],
        ['tremolo', 'tremolo'],
        ['reverse', 'reverse'],
        ['treble', 'treble'],
        ['normalizer', 'normalizer'],
        ['pulsator', 'pulsator'],
        ['subboost', 'subboost'],
        ['karaoke', 'karaoke'],
        ['mono', 'mono'],
        ['compressor', 'compressor'],
        ['expander', 'expander']
      ])
  );
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if (!interaction.guild) {
      return;
    }
    const selectedFilter = interaction.options.getString('filter');
    if (!selectedFilter) {
      return;
    }
    const player = UsePlayer(interaction.client);
    const queue = player.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply('No queue playing');
    }
    if (!userInBotChannel(interaction.user, interaction.guild)) {
      return interaction.reply(
        'You must be in the same voice channel as the bot'
      );
    }
    if (selectedFilter === 'clear') {
      queue.setFilters({});
      return interaction.reply('All filters cleared');
    }
    const newFilters: any = {};
    const enabled: Array<string> = queue.getFiltersEnabled();
    enabled.forEach((filter: string) => {
      newFilters[filter] = true;
    });
    newFilters[selectedFilter] = !newFilters[selectedFilter];
    const finalFilters = Object.keys(newFilters).filter(key => newFilters[key]);
    if (finalFilters.length === 0) {
      interaction.reply('No filters enabled');
    } else {
      interaction.reply(`Enabled filters: ${finalFilters.join(', ')}`);
    }
    queue.setFilters(newFilters);
  }
};
