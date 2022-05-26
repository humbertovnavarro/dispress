import './lib/customConsole';
import { getConfig, getEnv } from './lib/config';
import DiscordBot from './lib/dispress/DiscordBot';
import { Intents } from 'discord.js';
import botFactory from './botFactory';

const main = async () => {
  const discordBot = botFactory(
    new DiscordBot({
      intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_VOICE_STATES',
        'GUILD_MESSAGE_REACTIONS',
        Intents.FLAGS.GUILD_VOICE_STATES
      ],
      restTimeOffset: 0,
      prefix: '/'
    })
  );
  if (require.main === module) {
    discordBot.login(getEnv('DISCORD_TOKEN') || getConfig('dispress.token'));
  }
  discordBot.on('ready', () => {
    console.log(`Logged in as ${discordBot.user?.tag}`);
  });
};
if (require.main === module) {
  main();
}
