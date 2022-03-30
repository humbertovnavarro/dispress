import dotenv from 'dotenv';
dotenv.config();
import client from './lib/client';
import waifu from './slashcommands/waifu';
import musicbot from './lib/plugins/musicbot/plugin';
import minecraft from './lib/plugins/minecraft/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
const main = async () => {
  client.prefix = process.env.PREFIX || '!';
  client.useCommand(waifu);
  client.useCommand(anime);
  client.useCommand(uptime);
  client.usePlugin(musicbot);
  client.usePlugin(minecraft);
  client.login(process.env.TOKEN);
};
main();
export default client;
