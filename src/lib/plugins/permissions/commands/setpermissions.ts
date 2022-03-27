import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandRoleOption,
  SlashCommandStringOption
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Bot, Command } from '../../../lib/client';
import addPermission from '../helpers/addPermission';
import deletePermission from '../helpers/deletePermission';
const body = new SlashCommandBuilder()
  .setName('setpermissions')
  .setDescription('Sets permissions for a command')
  .addRoleOption(
    new SlashCommandRoleOption()
      .setName('role')
      .setDescription('The role to set permissions for')
      .setRequired(true)
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName('command')
      .setDescription('The command to set permissions for')
      .setRequired(true)
  )
  .addBooleanOption(
    new SlashCommandBooleanOption()
      .setName('remove')
      .setDescription('Removes the role from the command permissions')
  );
const command: Command = {
  body,
  data: {
    permissions: ['ADMINISTRATOR']
  },
  handler: (interaction: CommandInteraction) => {
    if (!interaction.guild) {
      return interaction.reply('This command can only be used in a guild');
    }
    const role = interaction.options.getRole('role');
    if (!role) {
      return interaction.reply('You must provide a role');
    }
    const command = interaction.options.getString('command');
    if (!command) {
      return interaction.reply('You must provide a command');
    }
    const bot = interaction.client as Bot;
    const hasCommand = bot.commands.has(command);
    if (!hasCommand) {
      return interaction.reply("That command doesn't exist");
    }
    const remove = interaction.options.getBoolean('remove') || false;
    if (!remove) {
      interaction.reply(`Added ${role.name} to ${command} permissions`);
      addPermission(interaction.guild.id, command, role.id);
    } else {
      interaction.reply(`Removed ${role.name} from ${command} permissions`);
      deletePermission(interaction.guild.id, command, role.id);
    }
  }
};
export default command;
