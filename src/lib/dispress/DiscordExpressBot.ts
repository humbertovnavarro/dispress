import DiscordBot from "./DiscordBot";
import express, { Application } from "express";
import { BotOptions } from "lib/dispress";
export default class DiscordExpressBot extends DiscordBot {
  router = express() as Application | undefined;
  constructor(options: BotOptions) {
    super(options);
    this.on("ready", () => {
      const port = process.env.PORT || 3001;
      try {
        this.router?.listen(port, () => {
          console.log(`started express server on ${port}`)
        });
      }
      catch(error) {
        console.error(error);
      }
    })
  }
}
