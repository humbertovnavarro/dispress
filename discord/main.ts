import dotenv from 'dotenv';
dotenv.config();
import waifu from './slashcommands/waifu';
import musicbot from './plugins/musicbot/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
import DiscordBot from './lib/dispress/DiscordBot';
import PrismaClient from '../lib/PrismaClient';
import fs from 'fs';
let start: number = Date.now();
let interval: NodeJS.Timer;
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
  if(bot.isReady()) return bot;
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
  generateLockFile(start);
  setInterval(() => {
    if(!isValidLock) {
      bot.destroy();
      PrismaClient
      return;
    }
  })
  return bot;
}


function generateLockFile(startTime: number) {
  fs.writeFileSync("discordbot.lock", start.toString(), { encoding: 'utf-8'});
}

const isValidLock = () => {
  const time = fs.readFileSync('discordbot.lock', { encoding: 'utf-8'});
  return time === start.toString();
}