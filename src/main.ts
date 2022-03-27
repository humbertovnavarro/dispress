import dotenv from 'dotenv';
dotenv.config();
import client from './lib/client';
import waifu from './slashcommands/waifu';
import musicbot from './lib/plugins/musicbot/plugin';
import linkreflector from './lib/plugins/linkreflector/plugin';
import anime from './slashcommands/anime';
const main = async () => {
  client.prefix = process.env.PREFIX || '!';
  client.useCommand(waifu);
  client.useCommand(anime);
  client.usePlugin(musicbot);
  client.usePlugin(linkreflector);
  client.login(process.env.TOKEN);
};
main();
