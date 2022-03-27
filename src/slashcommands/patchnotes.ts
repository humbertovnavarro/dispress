import { Embed, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Bot } from '../lib/client';
import PatchNotes from '../patchnotes.json';
import db from '../lib/query/db';
const body = new SlashCommandBuilder()
  .setName('patchnotes')
  .setDescription('shows patchnotes for latest changes to the bot.');
const version = PatchNotes.version;
const notes = PatchNotes as any;
const patchnotes = notes[version].notes;
const embed = new Embed().setTitle(`Patchnotes for ${version}`);
let description = '';
patchnotes.forEach((entry: string) => {
  description += `\n${entry}`;
});
embed.setDescription(description);
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    interaction.reply({ embeds: [embed] });
  },
  onReady: async (bot: Bot) => {
    bot.guilds.cache.forEach(async guild => {
      const channelID = db.getKey(`${guild}:patchnotes-channel`);
      if (!channelID) return;
      const channel = await bot.channels.fetch(channelID);
      if (!channel || !channel.isText()) return;
      const patchnotesVersion = db.getKey(`${guild}:patchnotes`);
      if (patchnotesVersion === version) {
        return;
      }
      db.setKey(`${guild}:patchnotes`, version);
      channel.send({
        embeds: [embed]
      });
    });
  }
};
