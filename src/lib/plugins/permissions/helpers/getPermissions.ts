import { CommandInteraction } from 'discord.js';
import { Command } from '../../../lib/client';
import db from '../../../lib/query/db';
export default function getPermissions(
  interaction: CommandInteraction,
  command: Command
): Set<string> {
  const guild = interaction.guild;
  if (!guild) return new Set();
  const permissions = db
    .prepare(
      `
    SELECT role FROM CommandPermissions WHERE guild = ? AND command = ?
  `
    )
    .all(guild.id, command.body.command);
  const collection = new Set<string>();
  permissions.forEach(permission => {
    collection.add(permission.role);
  });
  return collection;
}
