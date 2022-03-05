import dotenv from "dotenv";
dotenv.config();
import client from "./lib/client";
import waifu from "./slashcommands/waifu";
import starboard from "./handlers/messages/starboard";
client.useMessage(starboard);
client.useCommand(waifu);
client.login(process.env.TOKEN);
