import { Guild, Message, User } from "discord.js";
import path from "path";
import type DiscordBot from "../../lib/dispress/DiscordBot";
import type { Plugin } from "../../lib/dispress/dispress";
import { addPhrase, deletePhrase, handler } from "./KeyWords";

type UserPhraseMap = Map<string, User[]>;
const guildToUserPhraseMapMap: Map<Guild, UserPhraseMap> = new Map();
const storageLocation = path.resolve(__dirname, "keywords.json");

const plugin: Plugin = {
  name: "keywords",
  beforeReady(bot: DiscordBot) {
    bot.on("messageCreate", async (message: Message) => {
      handler(message);
    });
    bot.useCommand(addPhrase);
    bot.useCommand(deletePhrase);
  },
};

export default plugin;
