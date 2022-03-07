import dotenv from "dotenv";
dotenv.config();
import client from "./lib/client";
import waifu from "./slashcommands/waifu";
import play from './slashcommands/play';
import stop from './slashcommands/stop';
import restrictions from "./handlers/messages/restrictions";
import addrestriction from "./slashcommands/setrestriction";
client.useMessage(restrictions)
client.useCommand(waifu);
client.useCommand(addrestriction);
client.useCommand(play);
client.useCommand(stop);
client.login(process.env.TOKEN);
