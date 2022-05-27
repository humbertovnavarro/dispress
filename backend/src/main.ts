import { getConfig, getEnv } from './lib/config';
import DiscordBot from './lib/dispress/DiscordBot';
import { Intents } from 'discord.js';
import botFactory from './botFactory';
import express, { Response } from "express";
import path from "path";
import detectTSNode from "detect-ts-node";
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
  const staticPath: string =  detectTSNode ? path.join(path.resolve("../dist"), "public")
  : path.join(process.cwd(), "public"); 
  console.log(staticPath);
  const app = express();
  app.use(express.static(staticPath));
  const port = Number.parseInt(getEnv("EXPRESS_PORT") || "3000");
  app.get("/api/v1/ping", (_req, res: Response) => {
    res.json("Pong!")
  })
  app.listen(port, () => {
    console.log(`express listening on ${port}`);
  });
};
if (require.main === module) {
  main();
}
