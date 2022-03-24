import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

const body = new SlashCommandBuilder()
  .setName("obama")
  .setDescription("shows a picture of obama.");
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    interaction.reply("https://www.whitehouse.gov/wp-content/uploads/2021/01/44_barack_obama.jpg");
  },
};
