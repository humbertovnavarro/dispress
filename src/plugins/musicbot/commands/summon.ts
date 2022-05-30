import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { UsePlayer, GetActiveChannel } from "../lib/player/player";

const body = new SlashCommandBuilder()
  .setName("summon")
  .setDescription("Summon the bot to your channel.");
export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if (!interaction.guild || !interaction.member) {
      return;
    }
    const member = interaction.guild.members.cache.get(
      interaction.member.user.id
    );
    const voiceChannel = member?.voice.channel;
    const botVoiceChannel = GetActiveChannel(interaction.guild);
    if (botVoiceChannel && voiceChannel?.id != botVoiceChannel?.id) {
      return interaction.reply(
        "You must be in the same voice channel as the bot"
      );
    } else {
      if (!voiceChannel) {
        return interaction.reply(
          "You must be in a voice channel to use this command"
        );
      }
    }
    const musicPlayer = UsePlayer(interaction.client);
    const queue = musicPlayer.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply("The bot is not playing anything.");
    }
    try {
      await queue.connect(voiceChannel);
    } catch (error) {
      console.error(error);
    }
    interaction.reply("Bot moved");
  },
};
