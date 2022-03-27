import {
  SlashCommandBuilder,
  SlashCommandStringOption
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import db from '../../../lib/query/db';
const body = new SlashCommandBuilder()
  .setName('channeltags')
  .setDescription('sets tags for a channel')
  .addStringOption(
    new SlashCommandStringOption()
      .setName('tags')
      .setDescription('the tags to set, comma separated')
      .setRequired(false)
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName('data')
      .setDescription('values to set, comma separated')
      .setRequired(false)
  );
export default {
  body,
  data: {
    permissions: ['ADMINISTRATOR']
  },
  handler: async (interaction: CommandInteraction) => {
    const channelName = interaction.options.getString('channel');
    const guild = interaction.guild;
    if (!guild) {
      interaction.reply('This command can only be used in a guild');
      return;
    }
    const channel = interaction.channel;
    if (!channel) {
      interaction.reply(`Could not find channel ${channelName}`);
      return;
    }
    if (!channel.isText()) {
      interaction.reply(`Channel ${channelName} not a text channel`);
      return;
    }
    const existingTags = db.getKey(`${channel.id}:tags`);
    const tagsRaw = interaction.options.getString('tags');
    if (!tagsRaw) {
      if (!existingTags) {
        interaction.reply('No tags set for this channel');
        return;
      } else {
        return interaction.reply(`Tags for channel: ${existingTags}`);
      }
    }
    const tags = tagsRaw?.split(',').map(tag => tag.trim());

    const valuesRaw = interaction.options.getString('data');
    const values = valuesRaw?.split(',').map(value => value.trim());

    if (values && values.length !== tags?.length) {
      interaction.reply('The number of tags and values must match');
      return;
    }
    const oldTags = existingTags?.split(',').map(tag => tag.trim());
    oldTags?.forEach(tag => {
      db.deleteKey(`${channel.id}:tag:${tag}`);
    });
    for (const tag of tags) {
      if (values) {
        db.setKey(`${channel.id}:tag:${tag}`, values.shift() || '1');
      } else {
        db.setKey(`${channel.id}:tag:${tag}`, '1');
      }
    }
    db.setKey(`${channel.id}:tags`, tags.join(','));
    interaction.reply(`Set tags ${tags.join(', ')} for channel ${channel}`);
  }
};
