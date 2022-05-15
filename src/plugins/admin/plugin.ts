import DiscordBot from "../../lib/dispress/DiscordBot";
import { Plugin } from "../../lib/dispress/dispress";
import { getConfig, getKey, setKey } from "../../lib/config";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
const plugin: Plugin = {
    name: "admin",
    beforeReady(bot: DiscordBot) {
        bot.useCommand(
            {
                body:  new SlashCommandBuilder()
                .setName('setkey')
                .setDescription('Set a key')
                .addStringOption(new SlashCommandStringOption()
                .setName("key").setRequired(true).setDescription("the key to set"))
                .addStringOption(new SlashCommandStringOption()
                .setName("value").setRequired(true).setDescription("the value to set")),
                handler(interaction: CommandInteraction) {
                    if(interaction.user.id != getConfig("owner")) return
                    interaction.reply("You are not the owner")

                    const userKey = interaction.options.getString("key", true);
                    const userValue = interaction.options.getString("value", true);
                    setKey(userKey, userValue);
                    interaction.reply(`Set key ${userKey} to ${userValue}`);
                },
            }
        );
        bot.useCommand(
            {
                body:  new SlashCommandBuilder()
                .setName('getkey')
                .setDescription('View the value of a key'),
                handler(interaction: CommandInteraction) {
                    if(interaction.user.id != getConfig("owner")) return
                    interaction.reply("You are not the owner")

                    const userKey = interaction.options.getString("key", true);
                    const value = getKey(userKey);
                    interaction.reply(`${value}`);
                },
            }
        );
    },
}
export default plugin;