import { Bot, Plugin } from "../../lib/client"
import pause from "./commands/pause"
import queue from "./commands/queue";
import unpause from "./commands/unpause";
import guildplaylist from "./commands/guildplaylist";
import play from "./commands/play";
import stop from "./commands/stop";
import skip from "./commands/skip";
const plugin: Plugin = {
  name: "musicbot",
  version: "1.0.0",
  description: "A music bot for discord",
  beforeReady: (bot: Bot) => {
    bot.useCommand(pause);
    bot.useCommand(play);
    bot.useCommand(stop);
    bot.useCommand(skip);
    bot.useCommand(queue);
    bot.useCommand(guildplaylist);
    bot.useCommand(unpause)
  },
}
export default plugin;