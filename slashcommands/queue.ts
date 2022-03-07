import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { Track } from "discord-player";
import { CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { userInBotChannel, UsePlayer } from "../lib/player";

const body = new SlashCommandBuilder()
.setName("queue")
.setDescription("shows the queue");

export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if(!interaction.guild) {
        return;
    }
    const player = UsePlayer(interaction.client);
    const queue: any = player.getQueue(interaction.guild);
    if(!queue) return interaction.reply("there is no queue");
    const tracks = queue.tracks;
    const playing = queue.previousTracks[0];
    const embed = new MessageEmbed();
    embed.setTitle('Song queue')
    embed.addField(`\`${0}.\` **${playing.title}**`, playing.duration);
    tracks.forEach((track: Track, index: number) => {
        embed.addField(`\`${index + 1}.\` **${track.title}**`, track.duration);
    })
    interaction.reply({
        embeds: [embed]
    })
  }
}
