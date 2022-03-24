import { CommandInteraction, GuildMemberRoleManager } from "discord.js"
import type { Bot, Command, Plugin } from "../../lib/client"
import getPermissions from "./helpers/getPermissions";
import initializeDatabase from "./helpers/initializeDatabase";
import setpermissions from "./commands/setpermissions";
const plugin: Plugin = {
  name: "permissions",
  version: "1.0.0",
  author: "Humberto Navarro",
  beforeReady: (bot: Bot) => {
    bot.useCommand(setpermissions);
    initializeDatabase();
  },
  beforeCommand: async (command: Command, interaction: CommandInteraction, cancel: () => void) => {
    // Base permissions are the permissions that are granted by default to users in a guild e.g. "ADMINISTRATOR" or "MANAGE_GUILD"
    const basePermissions = command.data?.permissions || [];
    if(Array.isArray(basePermissions)) {
      basePermissions.forEach((permission) => {
        if(!interaction.memberPermissions?.has(permission)) {
          return cancel();
        }
      });
    }

    const permissions = getPermissions(interaction, command);
    if (permissions.size === 0) return;
    const userRoles = interaction.member?.roles as GuildMemberRoleManager;
    userRoles.cache.forEach((role) => {
      if(permissions.has(role.id)) {
        return;
      }
    });

    interaction.reply("You don't have permission to use this command");
    cancel();
  },
}
export default plugin;
