import { getEnv } from "./lib/config";
import waifu from './slashcommands/waifu';
import musicbot from './plugins/musicbot/plugin';
import chatbot from './plugins/chatbot/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
import PrismaClient from './lib/PrismaClient';
import DiscordBot from './lib/dispress/DiscordBot';
import SimpleCommandParser from "./plugins/simplecommandparser/plugin";
import SimpleCommand from './plugins/simplecommandparser/SimpleCommand';
import debug from "./simplecommands/debug";
import admin from "./plugins/admin/plugin";
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

const main = async () => {
  init();
  // Dereferencing and binding for readability
  let { useCommand, usePlugin } = discordBot;
  useCommand = useCommand.bind(discordBot);
  usePlugin = usePlugin.bind(discordBot);

  const useSimpleCommand = SimpleCommandParser.context?.useCommand as (command: SimpleCommand) => void;
  //#region Simple Commands
  useSimpleCommand(debug)
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
  //#endregion
  listen();
};

/**
 * Initialise the database and other components
 */
const init = async () => {
  try {
    await PrismaClient.$connect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
/**
 * Start the bot and any other sockets
 */
const listen = async () => {
  if (require.main === module) {
    discordBot.login(getEnv("DISCORD_TOKEN"));
  }
  discordBot.on("ready", () => {
    console.log("Logged in")
  })
}

main();
export default discordBot;
