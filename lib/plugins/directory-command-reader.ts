import DiscordBot, { DiscordBotPlugin, Command } from "../client";
import path from "path";
import fs from 'fs';
export default function directoryCommandReader(directory: string): DiscordBotPlugin {
  let files: any[];
  try {
    files = fs.readdirSync(directory).filter(file => {
      return process.release.name === 'node' && file.startsWith(".js") ||
      process.release.name === 'ts-node' && file.startsWith(".ts")
    }).map(file => {
      path.resolve(directory + "/file");
    });
  } catch (err) {
    console.error(err);
  }
  return (bot: DiscordBot) => {
    const commands = files.map(file => {
      import(file).then((module) => {
        bot.use(module);
      });
    });
  }
}
