"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const slashCommands = [];
const commands = new Map();
const messageHandlers = [];
const rest = new rest_1.REST({ version: '9' });
const client = new discord_js_1.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"]
});
client.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (client.token)
        rest.setToken(client.token);
    client.guilds.cache.forEach(guild => {
        var _a;
        if ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id)
            rest.put(v9_1.Routes.applicationGuildCommands(client.user.id, guild.id), { body: slashCommands })
                .catch((error) => {
                console.error(error.message);
            });
    });
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
}));
client.on("interactionCreate", interaction => {
    var _a;
    if (interaction.isCommand()) {
        (_a = commands.get(interaction.commandName)) === null || _a === void 0 ? void 0 : _a.handler(interaction);
    }
});
client.on("messageCreate", message => {
    messageHandlers.forEach(handler => {
        handler(message);
    });
});
client.useMessage = (messageHandler) => {
    messageHandlers.push(messageHandler);
};
client.useCommand = (command) => {
    var _a;
    (_a = command.init) === null || _a === void 0 ? void 0 : _a.call(command);
    commands.set(command.body.name, command);
    slashCommands.push(command.body.toJSON());
};
exports.default = client;
