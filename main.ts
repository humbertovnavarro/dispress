import dotenv from "dotenv";
dotenv.config();
import client from "./lib/client";
import waifu from "./slashcommands/waifu";
import play from './slashcommands/play';
import stop from './slashcommands/stop';
import restrictions from "./handlers/messages/restrictions";
import addrestriction from "./slashcommands/setrestriction";
import pause from "./slashcommands/pause";
import unpause from "./slashcommands/unpause";
import skip from "./slashcommands/skip";
import queue from "./slashcommands/queue";
client.useMessage(restrictions)
client.useCommand(waifu);
client.useCommand(addrestriction);
client.useCommand(play);
client.useCommand(stop);
client.useCommand(pause)
client.useCommand(unpause);
client.useCommand(skip)
client.useCommand(queue);
client.login(process.env.TOKEN);