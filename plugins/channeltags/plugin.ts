import type { Bot, Plugin } from '../../lib/client';
import channeltags from './commands/channeltags';
const plugin: Plugin = {
  name: 'channeltags',
  version: '1.0.0',
  description:
    'An admin tool that lets you to set tags as key value pairs for channels',
  beforeReady: (bot: Bot) => {
    bot.useCommand(channeltags);
  }
};
export default plugin;
