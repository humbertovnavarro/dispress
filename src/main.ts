import { getEnv } from "./lib/config";
import DiscordBot from "./lib/dispress/DiscordBot";
import { Intents } from "discord.js";
import botFactory from "./botFactory";
import path from "path";
import detectTSNode from "detect-ts-node";
const main = async () => {
  const discordBot = botFactory(
    new DiscordBot({
      intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_VOICE_STATES",
        "GUILD_MESSAGE_REACTIONS",
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
      restTimeOffset: 0,
      prefix: "/",
    })
  );
  let staticPath: string = detectTSNode
    ? path.join(path.resolve("../out"), "public")
    : path.join(process.cwd(), "public");
  const pathEnv = getEnv("STATIC_PATH");
  if (pathEnv) staticPath = pathEnv;
  discordBot.login(getEnv("DISCORD_TOKEN"));
};
if (require.main === module) {
  main();
}
