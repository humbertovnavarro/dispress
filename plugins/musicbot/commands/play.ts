import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandStringOption
} from '@discordjs/builders';
import { Track } from 'discord-player';
import { CommandInteraction } from 'discord.js';
import { UsePlayer, GetActiveChannel } from '../helpers/player';
import addPlay from '../../../lib/query/addPlay';

const body = new SlashCommandBuilder()
  .setName('play')
  .setDescription('adds a song to the player queue')
  .addStringOption(
    new SlashCommandStringOption()
      .setName('query')
      .setDescription('The song you want to play')
      .setRequired(true)
  )
  .addBooleanOption(
    new SlashCommandBooleanOption()
      .setName('next')
      .setDescription('plays the song after the current song ends')
      .setRequired(false)
  );
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
        'You must be in the same voice channel as the bot'
      );
    } else {
      if (!voiceChannel) {
        return interaction.reply(
          'You must be in a voice channel to use this command'
        );
      }
    }

    const query = interaction.options.getString('query');

    if (!query) {
      return;
    }
    const musicPlayer = UsePlayer(interaction.client);
    const queue = musicPlayer.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel
      }
    });

    try {
      if (!queue.connection) await queue.connect(voiceChannel);
    } catch {
      queue.destroy();
      return await interaction.reply({
        content: 'Could not join your voice channel!',
        ephemeral: true
      });
    }

    const track: Track | void = await musicPlayer
      .search(query, {
        requestedBy: interaction.user
      })
      .then(result => result.tracks[0])
      .catch(error => {
        console.error(error);
      });

    if (!track)
      return await interaction.reply({
        content: `❌ | Track **${query}** not found or not playable.`
      });

    addPlay(track, interaction.guild);

    interaction.reply({
      content: `Added track **${track.title}** to queue ✔️`
    });

    if (!queue.playing) {
      queue.play(track);
    }

    const next = interaction.options.getBoolean('next');

    if (next) {
      queue.insert(track, 0);
    }

    queue.addTrack(track);
  }
};
