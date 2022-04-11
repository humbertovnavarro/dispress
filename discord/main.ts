import dotenv from 'dotenv';
dotenv.config();
import waifu from './slashcommands/waifu';
import musicbot from './plugins/musicbot/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
import DiscordBot from './lib/dispress/DiscordBot';
import PrismaClient from '../lib/PrismaClient';
import fs from 'fs';
let bot: DiscordBot | undefined;
const uuid = Date.now().toString();
let interval: NodeJS.Timeout;
export default function useBot(): DiscordBot {
  if(bot) return bot;
  fs.writeFileSync('./discord.lock', uuid)
  bot = new DiscordBot({
    intents: [
      'GUILDS',
      'GUILD_MESSAGES',
      'GUILD_VOICE_STATES',
      'GUILD_MESSAGE_REACTIONS'
    ],
    restTimeOffset: 0,
    prefix: '/'
  });
  PrismaClient.$connect();
  bot.useCommand(anime);
  bot.useCommand(waifu);
  bot.usePlugin(musicbot);
  bot.usePlugin(uptime);
  bot.once('ready', () => {
    fs.writeFileSync('./discord.lock', uuid);
    if(process.env.MODE != 'production')
    interval = setInterval(() => {
      fs.readFile('./discord.lock', (err: any | null, data: Buffer) => {
        if(err || data.toString() != uuid) {
          console.log(`Killing orphaned bot with uuid ${uuid}`)
          bot?.destroy();
          bot = undefined;
          clearInterval(interval);
        }
      });
    }, 1000)
  })
  return bot;
}
