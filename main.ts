import dotenv from "dotenv";
dotenv.config();
import client from "./lib/client";
import waifu from "./slashcommands/waifu";
import restrictions from "./handlers/messages/restrictions";
import addrestriction from "./slashcommands/setrestriction";
client.useMessage(restrictions)
client.useCommand(waifu);
client.useCommand(addrestriction);
client.login(process.env.TOKEN);
