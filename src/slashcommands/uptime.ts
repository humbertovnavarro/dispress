import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import client from '../main';
const body = new SlashCommandBuilder()
  .setName('uptime')
  .setDescription('Returns the uptime of the bot');
export default {
  name: 'uptime',
  body,
  description: 'Returns the uptime of the bot',
  handler: async (interaction: CommandInteraction) => {
    interaction.reply(
      `I've been online for ${getUptimeHumanReadable(process.uptime())}`
    );
  }
};

export function getUptimeHumanReadable(unix: number): string {
  const uptime = Math.floor(unix / 1000);
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  let output = '';
  const values = [];
  if (days) output += `${days} day`;
  if (days > 1) output += 's';
  if (output) values.push(output);
  output = '';
  if (hours) output += `${hours} hour`;
  if (hours > 1) output += 's';
  if (output) values.push(output);
  output = '';
  if (minutes) output += `${minutes} minute`;
  if (minutes > 1) output += 's';
  if (output) values.push(output);
  output = '';
  if (seconds) output += `${seconds} second`;
  if (seconds > 1) output += 's';
  if (output) values.push(output);
  return values.join(', ').trimEnd();
}
