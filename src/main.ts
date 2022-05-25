import './lib/customConsole';
import { assertGetEnv } from './lib/config';
import PrismaClient from './lib/PrismaClient';
import DiscordBot from './lib/dispress/DiscordBot';
import { Intents } from 'discord.js';
import botFactory from './botFactory';

const main = async () => {
  try {
    await PrismaClient.$connect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  const discordBot = await botFactory(
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
    discordBot.login(assertGetEnv('DISCORD_TOKEN'));
  }
  discordBot.on('ready', () => {
    console.log(`Logged in as ${discordBot.user?.tag}`);
  });
};
if (require.main === module) {
  main();
}
