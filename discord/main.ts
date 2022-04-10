import dotenv from 'dotenv';
dotenv.config();
import waifu from './slashcommands/waifu';
import musicbot from './plugins/musicbot/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
import DiscordBot from './lib/dispress/DiscordBot';
import PrismaClient from '../lib/PrismaClient';
let ready: boolean = false;
const bot = new DiscordBot({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
    'GUILD_MESSAGE_REACTIONS'
  ],
  restTimeOffset: 0,
  prefix: '/'
});
export default async function client(): Promise<DiscordBot> {
  if(ready) return bot;
  try {
    await PrismaClient.$connect();
  } catch(error) {
    console.error(error);
  }
  bot.useCommand(anime);
  bot.useCommand(waifu);
  bot.usePlugin(musicbot);
  bot.usePlugin(uptime);
  await bot.login(process.env.TOKEN);
  ready = true;
  return bot;
}
