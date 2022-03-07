import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { userInBotChannel, UsePlayer } from "../lib/player";

const body = new SlashCommandBuilder()
.setName("pause")
.setDescription("pauses the song queue");

export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if(!interaction.guild) {
        return;
    }
    const player = UsePlayer(interaction.client);
    const queue: any = player.getQueue(interaction.guild);
    if(!queue) return interaction.reply("There is nothing queued.");
    if(!userInBotChannel(interaction.user, interaction.guild)) 
    return interaction.reply("You must be in the same channel as the bot.");
    queue.setPaused(true);
    return interaction.reply("ok");
  }
}