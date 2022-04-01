import dotenv from 'dotenv';
dotenv.config();
import Bot from './lib/client';
import waifu from './slashcommands/waifu';
// import musicbot from './lib/plugins/musicbot/plugin';
// import minecraft from './lib/plugins/minecraft/plugin';
import anime from './slashcommands/anime';
// import uptime from './slashcommands/uptime';
const client = new Bot({
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
if (require.main === module) {
  client.login(process.env.TOKEN);
}

export default client;
