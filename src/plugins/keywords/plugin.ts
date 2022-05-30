import { Embed, SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, Guild, Message, User } from "discord.js";
import fs from "fs";
import path from "path";
import type DiscordBot from "../../lib/dispress/DiscordBot";
import type { Command, Plugin } from "../../lib/dispress/dispress";

type UserPhraseMap = Map<string, User[]>;
const guildToUserPhraseMapMap: Map<Guild, UserPhraseMap> = new Map();
const storageLocation = path.resolve(__dirname, "keywords.json");

const plugin: Plugin = {
    name: "keywords",
    beforeReady(bot: DiscordBot) {
        bot.on("messageCreate", async (message: Message) => {
            if(!message.guild) return;
            const userPhraseMap = guildToUserPhraseMapMap.get(message.guild);
            if(!userPhraseMap) return;

            const strings = message.content.split(" ");
            for(const string of strings) {
                const users = userPhraseMap.get(message.content);
                if(users){
                    await notifyUsers(users, message);
                    break;
                }
            }
        });
        bot.useCommand(setPhrase);
        bot.useCommand(deletePhrase);
    }
}

async function notifyUsers(users: User[], message: Message) {
    for(const user of users) {
        await notify(user, message);
    }
}
async function notify(user: User, message: Message) {
    const dmChannel = await user.createDM();
    const embed = new Embed()
    .setTitle("Hey! One of your key phrases triggered.")
    .setThumbnail(message.author.avatarURL())
    .setDescription(message.content)
    .setTimestamp(message.createdTimestamp)
    await dmChannel.send({
        embeds: [embed]
    });
}

function flushToDisk(map: Map<Guild, UserPhraseMap>) {
    const jsonObject: {
        [key: string]: {
            [key: string]: string[]
        }
    } = {};
    map.forEach((value: UserPhraseMap, key: Guild) => {
        jsonObject[key.id] = phraseMapToObject(value);
    });
    const jsonString = JSON.stringify(jsonObject, null, 2);
    fs.writeFile(storageLocation, jsonString, (err) => {
        console.error(err);
    });
}

function phraseMapToObject(map: UserPhraseMap) {
    const jsonObject: {
        [key: string]: string[]
    } = {};
    map.forEach((value: User[], key: string) => {
        const userIds = value.map(user => user.id);
        jsonObject[key] = userIds;
    });
    return jsonObject;
}

const setPhrase: Command = {
    handler: function (interaction: CommandInteraction): unknown {
        if(!interaction.guild) {
            return interaction.reply("must use in a guild");
        }
        const map: UserPhraseMap = guildToUserPhraseMapMap.get(interaction.guild) || new Map();
        const phrase = interaction.options.getString("phrase", true).toLowerCase();
        const users = map.get(phrase) || [];
        users.push(interaction.user);
        map.set(phrase, users);
        interaction.reply(`Set phrase ${phrase}`);
        flushToDisk(guildToUserPhraseMapMap);
    },
    body: new SlashCommandBuilder().setName("setphrase")
    .setDescription("get notifications for a key phrase in the guild.")
    .addStringOption(new SlashCommandStringOption().setName("phrase").setRequired(true))
}

const deletePhrase: Command = {
    handler: function (interaction: CommandInteraction): unknown {
        if(!interaction.guild) {
            return interaction.reply("must use in a guild");
        }
        const map: UserPhraseMap = guildToUserPhraseMapMap.get(interaction.guild) || new Map();
        const phrase = interaction.options.getString("phrase", true).toLowerCase();
        let users = map.get(phrase) || [];
        users = users.splice(users.indexOf(interaction.user), 1);
        map.set(phrase, users);
        interaction.reply("Deleted");
        flushToDisk(guildToUserPhraseMapMap);
    },
    body: new SlashCommandBuilder().setName("setphrase")
    .setDescription("get notifications for a key phrase in the guild.")
    .addStringOption(new SlashCommandStringOption().setName("phrase").setRequired(true))
}

export default plugin;