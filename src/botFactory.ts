import waifu from './slashcommands/waifu';
import musicbot from './plugins/musicbot/plugin';
import chatbot from './plugins/chatbot/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
import SimpleCommandParser from './plugins/simplecommandparser/plugin';
import SimpleCommand from './plugins/simplecommandparser/SimpleCommand';
import debug from './simplecommands/debug';
import admin from './plugins/admin/plugin';
import guildwhitelist from './plugins/guildwhitelist/plugin';
import DiscordBot from './lib/dispress/DiscordBot';
const botFactory = (discordBot: DiscordBot) => {
  // Dereferencing and binding for readability
  const useSimpleCommand = SimpleCommandParser.context?.useCommand as (
    command: SimpleCommand
  ) => void;
  let { useCommand, usePlugin } = discordBot;
  useCommand = useCommand.bind(discordBot);
  usePlugin = usePlugin.bind(discordBot);
  //#region Simple Commands
  useSimpleCommand(debug);
  //#endregion
  //#region Slash Commands
  useCommand(anime);
  useCommand(waifu);
  //#endregion
  //#region Plugins
  usePlugin(musicbot);
  usePlugin(uptime);
  usePlugin(chatbot);
  usePlugin(SimpleCommandParser);
  usePlugin(admin);
  usePlugin(guildwhitelist);
  //#endregion
  return discordBot;
};
export default botFactory;
