import dotenv from 'dotenv';
dotenv.config();
import waifu from './slashcommands/waifu';
import musicbot from './plugins/musicbot/plugin';
import minecraft from './plugins/minecraft/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
import PrismaClient from './lib/PrismaClient';
import DiscordBotRestApi from './rest/api';
import DiscordBot from './lib/dispress/DiscordBot';
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
  try {
    await PrismaClient.$connect();
  } catch(error) {
    console.error(error);
    process.exit(1);
  }

  discordBot.useCommand(anime);
  discordBot.useCommand(waifu);
  discordBot.usePlugin(musicbot);
  discordBot.usePlugin(minecraft);
  discordBot.usePlugin(uptime);

  const discordBotRestApi = DiscordBotRestApi(discordBot);
  const port = process.env.API_PORT || 3000;
  discordBotRestApi.listen(port, () => {
    console.log("Rest api listening on port 3000")
  });

  if (require.main === module) {
    discordBot.login(process.env.DISCORD_TOKEN);
  }

}
main();
export default discordBot;
