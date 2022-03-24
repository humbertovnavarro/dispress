import dotenv from "dotenv";
dotenv.config();
import client from "./lib/client";
import waifu from "./slashcommands/waifu";
import patchnotes from "./slashcommands/patchnotes";
import musicbot from "./plugins/musicbot/plugin";
import channeltags from "./plugins/channeltags/plugin";
const main = async () => {
  client.useCommand(waifu);
  client.useCommand(patchnotes);
  client.usePlugin(musicbot);
  client.usePlugin(channeltags);
  client.login(process.env.TOKEN);
};
main();
