import {
  SlashCommandBuilder,
  SlashCommandStringOption
} from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import generatePlaylist from '../../../query/generatePlaylist';
import { UsePlayer, GetActiveChannel, Queue, Track } from '../helpers/player';

const body = new SlashCommandBuilder()
  .setName('guildplaylist')
  .setDescription('plays an autogenerated guild playlist.')
  .addStringOption(
    new SlashCommandStringOption()
      .setName('songs')
      .setDescription('max number of songs to put into the playlist, max of 15')
      .setRequired(false)
  ) as SlashCommandBuilder;

export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if (
      !interaction.guild ||
      !interaction.member ||
      !interaction.channel?.isText()
    ) {
      try {
        return interaction.reply('Something went wrong.');
      } catch (error) {
        console.error(error);
      }
      return;
    }
    const channel = interaction.channel;

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

    interaction.reply('Generating guild playlist...');

    const player = UsePlayer(interaction.client);
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel
      }
    }) as Queue;
    let maxSongs = 15;

    try {
      const userMaxSongOption = interaction.options.getString('songs');
      if (userMaxSongOption) {
        maxSongs = parseInt(userMaxSongOption, 10);
      }
    } catch (error) {
      console.error(error);
    }

    maxSongs = Math.max(1, maxSongs);

    // get a playlist of songs from the sqlite database using generatePlaylist
    const playlist = (await generatePlaylist(interaction.guild)).slice(
      0,
      maxSongs
    );

    if (playlist.length === 0) {
      return channel.send(
        `not enough data to generate a guild playlist, try playing and liking songs.`
      );
    }

    try {
      if (!queue.connection) await queue.connect(voiceChannel);
    } catch {
      queue.destroy();
      return await channel.send({
        content: 'Could not join your voice channel!'
      });
    }

    // get an array of promises that resolve when the music bot lib finds a song
    const trackPromises = playlist.map(async url =>
      player
        .search(url, { requestedBy: interaction.user })
        .then(result => result.tracks[0])
    );
    const tracks = (await Promise.all(trackPromises)).filter(track => track);

    if (queue.playing) {
      queue.addTracks(tracks);
    } else {
      queue.play(tracks.pop());
      queue.addTracks(tracks);
    }

    const embed = new MessageEmbed();
    embed.setTitle('Song queue');
    const playing = queue.previousTracks[0];

    if (playing) {
      embed.addField(`Playing -- **${playing.title}**`, playing.duration);
    }
    queue.tracks.forEach((track: Track, index: number) => {
      embed.addField(`\`${index + 1}.\` **${track.title}**`, track.duration);
    });

    channel.send({
      embeds: [embed]
    });
  }
};
