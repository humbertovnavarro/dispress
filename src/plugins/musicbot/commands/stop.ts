import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { UsePlayer, GetActiveChannel } from '../lib/player/player';

const body = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('stops the playback of the bot');

export default {
  body,
  handler: async (interaction: CommandInteraction) => {
    if (
      !interaction.client ||
      !interaction.client.user?.id ||
      !interaction.guild ||
      !interaction.member
    ) {
      try {
        return interaction.reply('Something went wrong.');
      } catch (error) {
        console.error(error);
      }
      return;
    }

    const player = UsePlayer(interaction.client);
    const queue = player.getQueue(interaction.guild);

    if (!queue) {
      return interaction.reply('The bot is not playing anything.');
    }

    const member = interaction.guild.members.cache.get(
      interaction.member.user.id
    );
    const voiceChannel = member?.voice.channel;
    const botVoiceChannel = GetActiveChannel(interaction.guild);

    if (voiceChannel?.id !== botVoiceChannel?.id) {
      return interaction.reply(
        'You must be in the same voice channel as the bot.'
      );
    }

    if (!voiceChannel) {
      return interaction.reply(
        'You must be in a voice channel with the bot to stop music'
      );
    }

    player.deleteQueue(interaction.guild);
    interaction.reply('ok');
  }
};
