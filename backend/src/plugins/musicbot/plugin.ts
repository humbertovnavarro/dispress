import type { Plugin } from '../../lib/dispress/dispress';
import pause from './commands/pause';
import queue from './commands/queue';
import unpause from './commands/unpause';
import play from './commands/play';
import stop from './commands/stop';
import skip from './commands/skip';
import summon from './commands/summon';
import filters from './commands/filters';
import DiscordBot from '../../lib/dispress/DiscordBot';
import { UsePlayer } from './lib/player/player';
import type { Player } from 'discord-player';

let player: Player | undefined;

export interface MusicBotContext {
  getPlayer: () => Player | undefined;
}

export type MusicBotPlugin = Plugin<MusicBotContext>;

const plugin: MusicBotPlugin = {
  name: 'musicbot',
  beforeReady: (bot: DiscordBot) => {
    bot.useCommand(pause);
    bot.useCommand(play);
    bot.useCommand(stop);
    bot.useCommand(skip);
    bot.useCommand(queue);
    bot.useCommand(unpause);
    bot.useCommand(filters);
    bot.useCommand(summon);
    player = UsePlayer(bot);
  },
  // Expose the player through the context api
  context: {
    getPlayer: () => player
  }
};

export default plugin;
