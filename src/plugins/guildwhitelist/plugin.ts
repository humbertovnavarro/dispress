import { Guild } from "discord.js";
import DiscordBot from "../../lib/dispress/DiscordBot";
import type { Plugin } from "../../lib/dispress/dispress";
import { getConfig } from "../../lib/config";

const guildIdToWhitelist = new Map<string, boolean>();

const plugin: Plugin = {
  name: "guildwhitelist",
  beforeReady(bot: DiscordBot) {
    const whitelist =
      getConfig<string[]>("plugins.guildwhitelist.whitelist") || [];
    if (!Array.isArray(whitelist)) {
      console.error(`guildwhitelist is not an array!`);
      return;
    } else if (whitelist.length === 0) {
      return;
    }

    whitelist.forEach((guildId) => {
      if (typeof guildId !== "string") {
        throw new Error(`guildwhitelist: ${guildId} is not a valid guild id`);
      }
      guildIdToWhitelist.set(guildId, true);
    });

    bot.on("guildCreate", async (guild: Guild) => {
      if (!(await isWhitelisted(guild, bot))) {
        console.warn(
          `${guild.name} (${guild.id}) is not whitelisted, leaving...`
        );
        await guild.leave();
      }
    });
  },
  onReady(bot: DiscordBot) {
    bot.guilds.cache.forEach(async (guild: Guild) => {
      if (!(await isWhitelisted(guild, bot))) {
        console.warn(
          `${guild.name} (${guild.id}) is not whitelisted, leaving...`
        );
        guild.leave();
      }
    });
  },
};

const isWhitelisted = async (
  guild: Guild,
  bot: DiscordBot
): Promise<boolean> => {
  if (guild.ownerId === bot.user?.id) {
    return true;
  }
  return guildIdToWhitelist.has(guild.id);
};
export default plugin;
