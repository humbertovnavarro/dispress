import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { Track } from "discord-player";
import { CommandInteraction } from "discord.js";
import { UsePlayer, GetActiveChannel } from "../lib/player";
import addPlay from "../lib/query/addPlay";

const body = new SlashCommandBuilder()
.setName("play")
.setDescription("adds a song to the player queue");

const query = new SlashCommandStringOption()
.setName("query")
.setDescription("The song you want to play")
.setRequired(true)
body.addStringOption(query);

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
    const botVoiceChannel = GetActiveChannel(interaction.guild);
    if(botVoiceChannel && voiceChannel?.id != botVoiceChannel?.id) {
        return interaction.reply("You must be in the same voice channel as the bot");
    } else {
        if(!voiceChannel) {
            return interaction.reply("You must be in a voice channel to use this command");
        }
    }

    const query = interaction.options.getString("query");
    if(!query) {
        return;
    }

    const player = UsePlayer(interaction.client);
    const queue = player.createQueue(interaction.guild, {
        metadata: {
            channel: interaction.channel
        }
    });

    try {
        if (!queue.connection) await queue.connect(voiceChannel);
    } catch {
        queue.destroy();
        return await interaction.reply({ content: "Could not join your voice channel!", ephemeral: true });
    }
    const track: Track = await player.search(query, {
        requestedBy: interaction.user,
    }).then(result => result.tracks[0]);
    if (!track) return await interaction.reply({ content: `❌ | Track **${query}** not found or not playable.` });
    addPlay(track, interaction.guild);
    queue.play(track);
    return await interaction.reply({ content: `Added track **${track.title}** to queue ✔️` });
  }
}
