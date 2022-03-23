import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../lib/client";
import PatchNotes from "../patchnotes.json";
import db from "../lib/query/db";
const body = new SlashCommandBuilder()
  .setName("patchnotes")
  .setDescription("shows patchnotes for latest changes to the bot.");
const version = PatchNotes.version;
const notes = PatchNotes as any;
const patchnotes = notes[version];
const embed = new Embed();
patchnotes.forEach((entry: string) => {
  embed.description += `Patchnotes for ${version}`;
  embed.description += `\n${entry}`;
});
export default {
  body,
  handler: async (interaction: CommandInteraction) => {},
  onReady: (bot: Bot) => {
    bot.guilds.cache.forEach((guild) => {
      const patchnotesVersion = db.getKey(`${guild}:patchnotes`);
      if (patchnotesVersion === version) {
        return;
      }
      db.setKey(`${guild}:patchnotes`, version);
      guild.systemChannel?.send({
        embeds: [embed],
      });
    });
  },
};
