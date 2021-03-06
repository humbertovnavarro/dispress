import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "@discordjs/builders";
import axios from "axios";
import { CommandInteraction, TextChannel, User } from "discord.js";
const choices = [
  "bully",
  "cry",
  "hug",
  "awoo",
  "yeet",
  "cringe",
  "dance",
  "slap",
  "wink",
  "kill",
  "nom",
  "bonk",
  "pat",
  "lick",
  "cuddle",
].sort();
const body = new SlashCommandBuilder()
  .setName("waifu")
  .setDescription("Get a random waifu")
  .addStringOption(
    new SlashCommandStringOption()
      .setDescription("type of waifu")
      .setName("category")
      .addChoices(choices.map((choice) => [choice, choice]))
  )
  .addUserOption(
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("@mention a user with waifu")
  )
  .addBooleanOption(
    new SlashCommandBooleanOption()
      .setName("nsfw")
      .setDescription("Posts a nsfw waifu in a nsfw channel.")
  );
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    const category =
      interaction.options.getString("category", false) || "waifu";
    const user = interaction.options.getUser("user", false);
    const channel = (await interaction.channel?.fetch()) as
      | TextChannel
      | undefined;
    if (!channel || !channel.isText()) {
      return interaction.reply("Command must be used in a text channel");
    }
    try {
      const nsfw = interaction.options.getBoolean("nsfw", false);
      if (!channel.nsfw && nsfw) {
        return interaction.reply(
          "You cannot send a nsfw waifu in a sfw channel!"
        );
      }
      const resp = await axios.get(
        `https://api.waifu.pics/${nsfw ? "nsfw" : "sfw"}/${category}`
      );
      if (!resp.data.url) {
        throw new Error("No url in response while trying to get a waifu");
      }
      await interaction.reply(resp.data.url);
      if (user) {
        channel?.send(getResponse(user, category));
      }
    } catch (err) {
      await interaction.reply("waifu.pics is down :(");
    }
  },
};

export function getResponse(user: User, category: string): string {
  let terminator = "!";
  let adverb;
  let verb = category;
  switch (category) {
    case "dance":
      adverb = "s with";
      break;
    case "bully":
      verb = "bullies";
      adverb = "";
      break;
    case "cry":
      terminator = " :'(";
      verb = "cries";
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
  return `<@${user.id}> ${verb}${adverb} <@${user.id}>${terminator}`;
}
