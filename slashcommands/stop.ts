import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { UsePlayer } from "../lib/player";

const body = new SlashCommandBuilder()
.setName("stop")
.setDescription("stops the playback of the bot");

export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if(!interaction.guild) {
        return;
    }

    if(!interaction.member) {
        return;
    }

    const member = interaction.guild.members.cache.get(interaction.member.user.id);
    const voiceChannel = member?.voice.channel;

    if(!voiceChannel) {
        interaction.reply("You must be in a voice channel.");
        return;
    }

    const player = UsePlayer(interaction.client);
    player.deleteQueue(interaction.guild);
  }
}