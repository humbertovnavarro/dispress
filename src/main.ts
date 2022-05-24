import './lib/customConsole';
import { assertGetEnv } from './lib/config';
import waifu from './slashcommands/waifu';
import musicbot from './plugins/musicbot/plugin';
import chatbot from './plugins/chatbot/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
import PrismaClient from './lib/PrismaClient';
import DiscordBot from './lib/dispress/DiscordBot';
import SimpleCommandParser from './plugins/simplecommandparser/plugin';
import SimpleCommand from './plugins/simplecommandparser/SimpleCommand';
import debug from './simplecommands/debug';
import admin from './plugins/admin/plugin';
import guildwhitelist from './plugins/guildwhitelist/plugin';
const botFactory = async () => {
  const discordBot = new DiscordBot({
    intents: [
      'GUILDS',
      'GUILD_MESSAGES',
      'GUILD_VOICE_STATES',
      'GUILD_MESSAGE_REACTIONS'
    ],
    restTimeOffset: 0,
    prefix: '/'
  });
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

const main = async () => {
  try {
    await PrismaClient.$connect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  const discordBot = await botFactory();
  if (require.main === module) {
    discordBot.login(assertGetEnv('DISCORD_TOKEN'));
  }
  discordBot.on('ready', () => {
    console.log(`Logged in as ${discordBot.user?.tag}`);
  });
};
if (require.main === module) {
  main();
}
export default botFactory;
