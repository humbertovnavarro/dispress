import { Message } from "discord.js";
import SimpleCommand from "../plugins/simplecommandparser/SimpleCommand";
import { getConfig, getKey } from "../lib/config";
import os from "os";
import path from "path";
import { promises as fs } from "fs";
const MAX_DISCORD_MESSAGE_LENGTH = 2000;
const debug: SimpleCommand = {
    name: "debug",
    aliases: ["eval", "evaluate", "cal", "calc"],
    handler: async (message: Message, args: string[]): Promise<unknown> => {
        const javascript = args.slice(1).join(" ");
        if(!javascript) return await message.reply("No javascript to evaluate");
        const developer = getConfig("owner");
        if(developer != message.author.id.toString()) {
            return await message.reply("Only the bot operator can use this command");
        }
        try {
            // There are still some sneaky ways to get the token, the best practice of this command is to always use caution and never use it in a public channel.
            if(javascript.includes("client.token"))  {
                return message.channel.send("nice try");
            }
            let results = eval(javascript) as {[key: string]: any}
            if(typeof results == "string" && results == message.client.token) {
                return message.channel.send("nice try");
            }
            const resultsKeys = Object.keys(results);
            resultsKeys.forEach(key => {
                if(typeof results[key] === "function") {
                    results[key] = results[key]?.toString();
                }
                if(results[key] === message.client.token) {
                    results[key] = "nice try";
                }
            });
            let resultsString = `${results}`;
            if(typeof results === "object") {
                try {
                    let resultsJSON = JSON.stringify(results, Object.keys(results).sort(), 4);
                    if(message.client.token) {
                        resultsJSON = resultsJSON.replace(message.client.token, "secret ");
                    }
                    const file = path.join(os.tmpdir(), "/dispress_debug.json");
                    await fs.writeFile(file, resultsJSON);
                    return message.channel.send({
                        files: [
                            path.join(os.tmpdir(), "/dispress_debug.json")
                        ]
                    });
                } catch(error) {
                    console.error(error);
                }
            }
            if(message.client.token) {
                resultsString = resultsString.replace(`${message.client.token}`, "nice try")
            }
            resultsString = resultsString.slice(0, Math.min(resultsString.length , MAX_DISCORD_MESSAGE_LENGTH))
            await message.reply(resultsString);
        } catch(error: any) {
            console.error(error);
            let errorString = "";
            if(message.client.token) {
                errorString = errorString.replace(`${message.client.token}`, "nice try")
            }
            await message.reply(errorString);
        }
    }
}
export default debug;