import dotenv from "dotenv";
dotenv.config();
import client from "./lib/client";
import waifu from "./slashcommands/waifu";
import play from './slashcommands/play';
import stop from './slashcommands/stop';
import pause from "./slashcommands/pause";
import unpause from "./slashcommands/unpause";
import skip from "./slashcommands/skip";
import queue from "./slashcommands/queue";
import guildplaylist from "./slashcommands/guildplaylist";
import patchnotes from "./slashcommands/patchnotes";
const main = async () => {
  client.useCommand(waifu);
  client.useCommand(play);
  client.useCommand(stop);
  client.useCommand(pause)
  client.useCommand(unpause);
  client.useCommand(skip)
  client.useCommand(queue);
  client.useCommand(guildplaylist);
  client.useCommand(patchnotes);
  client.login(process.env.TOKEN);
}
main();
