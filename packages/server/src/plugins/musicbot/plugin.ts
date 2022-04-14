import { Plugin } from '../../lib/dispress';
import pause from './commands/pause';
import queue from './commands/queue';
import unpause from './commands/unpause';
import guildplaylist from './commands/guildplaylist';
import play from './commands/play';
import stop from './commands/stop';
import skip from './commands/skip';
import summon from './commands/summon';
import filters from './commands/filters';
import DiscordExpressBot from 'lib/dispress/DiscordExpressBot';
const plugin: Plugin = {
  name: 'musicbot',
  beforeReady: (bot: DiscordExpressBot) => {
    bot.useCommand(pause);
    bot.useCommand(play);
    bot.useCommand(stop);
    bot.useCommand(skip);
    bot.useCommand(queue);
    bot.useCommand(guildplaylist);
    bot.useCommand(unpause);
    bot.useCommand(filters);
    bot.useCommand(summon);
  }
};
export default plugin;