import {
  SlashCommandBuilder,
  SlashCommandStringOption
} from '@discordjs/builders';
import { Player, QueueFilters } from 'discord-player';
import { CommandInteraction } from 'discord.js';
import { UsePlayer } from '../helpers/player';

const body = new SlashCommandBuilder()
  .setName('filter')
  .setDescription('adds a filter to the player')
  .addStringOption(
    new SlashCommandStringOption()
      .setName('filter')
      .setDescription('Filter to apply to the queue')
      .setRequired(true)
      .addChoices([
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
    const musicPlayer: Player = UsePlayer(interaction.client);
    const queue = musicPlayer.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel
      }
    });
    const filter = interaction.options.getString('filter');
    if (!filter) {
      return interaction.reply('Please specify a filter');
    }
    const filters = queue.getFiltersEnabled() as any;
    const newFilters = { ...filters };
    newFilters[filter] = filters[filter] ? false : true;
    queue.setFilters(filters as QueueFilters);
    interaction.reply(`Filter ${filter} ${filters[filter] ? 'enabled' : 'disabled'}`);
  }
};
