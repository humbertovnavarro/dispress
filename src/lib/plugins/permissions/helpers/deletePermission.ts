import db from '../../../lib/query/db';
export default function deletePermission(
  guild: string,
  command: string,
  role: string
) {
  db.prepare(
    `
    DELETE FROM CommandPermissions
    WHERE guild = ? AND command = ? AND role = ?
  `
  ).run(guild, command, role);
}
