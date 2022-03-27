import db from '../../../lib/query/db';
export default function addPermission(
  guild: string,
  command: string,
  role: string
) {
  db.prepare(
    `
    INSERT INTO CommandPermissions (guild, command, role)
    VALUES (?, ?, ?)
  `
  ).run(guild, command, role);
}
