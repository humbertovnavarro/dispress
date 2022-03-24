import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot } from "../lib/client";
import db from "../lib/query/db";
const body = new SlashCommandBuilder()
  .setName("channeltags")
  .setDescription("sets tags for a channel")
  .addStringOption(
    new SlashCommandStringOption()
    .setName("tags")
    .setDescription("the tags to set, comma separated")
    .setRequired(true)
  );
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    const channelName = interaction.options.getString("channel");
    const guild = interaction.guild;
    if (!guild) {
      interaction.reply("This command can only be used in a guild");
      return;
    }
    const channel = interaction.channel;
    if (!channel) {
      interaction.reply(`Could not find channel ${channelName}`);
      return;
    }
    if(!channel.isText()) {
      interaction.reply(`Channel ${channelName} not a text channel`);
      return;
    }
    const tagsRaw = interaction.options.getString("tags");
    if (!tagsRaw) {
      interaction.reply("No tags provided");
      return;
    }
    const tags = tagsRaw.split(",").map((tag) => tag.trim());
    if(!tags || tags.length === 0) {
      interaction.reply("No tags provided");
      return;
    }
    for (const tag of tags) {
      db.setKey(`${channel.id}:tag:${tag}`, "1");
    }
    db.setKey(`${channel.id}:tags`, tags.join(","));
    interaction.reply(`Set tags ${tags.join(", ")} for channel ${channel}`);
  },
  onReady: async (bot: Bot) => {
  },
};
