import type { Bot, Plugin } from '../../lib/client';
import channeltags from './commands/channeltags';
const plugin: Plugin = {
  name: 'channeltags',
  beforeReady: (bot: Bot) => {
    bot.useCommand(channeltags);
  }
};
export default plugin;
