import dotenv from 'dotenv';
dotenv.config();
import waifu from './slashcommands/waifu';
import musicbot from './plugins/musicbot/plugin';
import minecraft from './plugins/minecraft/plugin';
import anime from './slashcommands/anime';
import uptime from './slashcommands/uptime';
import DiscordExpressBot from './lib/dispress/DiscordExpressBot';
const client = new DiscordExpressBot({
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_VOICE_STATES',
    'GUILD_MESSAGE_REACTIONS'
  ],
  restTimeOffset: 0,
  prefix: '/'
});
client.useCommand(anime);
client.useCommand(waifu);
client.usePlugin(musicbot);
client.usePlugin(minecraft);
client.usePlugin(uptime);
if (require.main === module) {
  client.login(process.env.TOKEN);
}

export default client;
