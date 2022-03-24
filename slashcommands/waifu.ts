import {
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "@discordjs/builders";
import axios from "axios";
import { CommandInteraction } from "discord.js";
const body = new SlashCommandBuilder()
  .setName("waifu")
  .setDescription("get a waifu pic uwu")
  .addStringOption(
    new SlashCommandStringOption()
      .setDescription("type of waifu")
      .setName("category")
      .addChoice("bully", "bully")
      .addChoice("cry", "cry")
      .addChoice("hug", "hug")
      .addChoice("awoo", "awoo")
      .addChoice("yeet", "yeet")
      .addChoice("cringe", "cringe")
      .addChoice("dance", "dance")
      .addChoice("slap", "slap")
      .addChoice("wink", "wink")
      .addChoice("kill", "kill")
      .addChoice("nom", "nom")
      .addChoice("bonk", "bonk")
      .addChoice("pat", "pat")
      .addChoice("lick", "lick")
      .addChoice("cuddle", "cuddle")
  )
  .addUserOption(
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("@mention a user with waifu")
  );
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    let category = "waifu";
    const option = interaction.options.getString("category", false);

    if (option) {
      category = option;
    }

    const user = interaction.options.getUser("user", false);

    try {
      const resp = await axios.get(`https://api.waifu.pics/sfw/${category}`);

      if (!resp.data.url) {
        throw new Error("No url in response");
      }

      await interaction.reply(resp.data.url);
      const callerId = interaction.user.id;

      if (user) {
        let terminator = "!";
        let adverb;

        switch (category) {
          case "dance":
            adverb = "s with";
            break;
          case "bully":
            category = "bullies";
            adverb = "";
            break;
          case "cry":
            terminator = " :'(";
            category = "cries";
            adverb = " on";
            break;
          case "wink":
            adverb = "s at";
            terminator = " ;)";
            break;
          case "cringe":
            adverb = "s at";
            terminator = " :|";
            break;
          case "awoo":
            adverb = "s at";
            terminator = " :O";
            break;
          case "cuddle":
            terminator = " :)";
          default:
            adverb = "s";
            break;
        }

        interaction.channel?.send(
          `<@${callerId}> ${category}${adverb} <@${user.id}>${terminator}`
        );
      }
    } catch (err) {
      await interaction.reply("waifu.pics is down :(");
    }
  },
};
