import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { UsePlayer } from "../lib/player";

const body = new SlashCommandBuilder()
.setName("play")
.setDescription("adds a song to the player queue");

const query = new SlashCommandStringOption()
.setName("query")
.setDescription("The song you want to play")

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

    if(!voiceChannel) {
        interaction.reply("You must be in a voice channel.");
        return;
    }

    const query = interaction.options.getString("query");
    
    if(!query) {
        interaction.reply("could not find song. :(");
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

    await interaction.deferReply();
    const track = await player.search(query, {
        requestedBy: interaction.user
    }).then(x => x.tracks[0]);
    
    if (!track) return await interaction.followUp({ content: `❌ | Track **${query}** not found!` });

    queue.play(track);
    
    return await interaction.followUp({ content: `⏱️ | Loading track **${track.title}**!` });
  }
}