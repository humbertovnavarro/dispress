import { getEnv } from './lib/config';
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
  let staticPath: string =  detectTSNode ? path.join(path.resolve("../out"), "public")
  : path.join(process.cwd(), "public"); 
  const pathEnv = getEnv("STATIC_PATH");
  if(pathEnv) staticPath = pathEnv;
  const app = express();
  app.use(express.static(staticPath));
  const port = Number.parseInt(getEnv("EXPRESS_PORT") || "3033");
  app.get("/api/v1/ping", (_req, res: Response) => {
    res.json("Pong!")
  })
  app.listen(port, () => {
    console.log(`express listening on ${port}`);
  });
  discordBot.login(getEnv('DISCORD_TOKEN'));
};
if (require.main === module) {
  main();
}