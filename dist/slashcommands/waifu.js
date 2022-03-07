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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const axios_1 = __importDefault(require("axios"));
const body = new builders_1.SlashCommandBuilder()
    .setName("waifu")
    .setDescription("get a waifu pic uwu");
const option = new builders_1.SlashCommandStringOption()
    .setDescription("type of waifu")
    .setName("category")
    .addChoice("bully", "bully")
    .addChoice("cry", "cry")
    .addChoice("hug", "hug")
    .addChoice("awoo", "awoo")
    .addChoice("yeet", "yeet")
    .addChoice("cringe", "cringe")
    .addChoice("dance", "dance")
    .addChoice("slap", "slap")
    .addChoice("wink", "wink")
    .addChoice("kill", "kill")
    .addChoice("nom", "nom")
    .addChoice("bonk", "bonk")
    .addChoice("pat", "pat")
    .addChoice("lick", "lick")
    .addChoice("cuddle", "cuddle");
const userOption = new builders_1.SlashCommandUserOption()
    .setName("user")
    .setDescription("@mention a user with waifu");
body.addStringOption(option);
body.addUserOption(userOption);
exports.default = {
    body,
    handler: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let category = "waifu";
        const option = interaction.options.getString("category", false);
        if (option) {
            category = option;
        }
        const user = interaction.options.getUser("user", false);
        try {
            const resp = yield axios_1.default.get(`https://api.waifu.pics/sfw/${category}`);
            if (!resp.data.url) {
                throw (new Error("No url in response"));
            }
            yield interaction.reply(resp.data.url);
            const callerId = interaction.user.id;
            if (user) {
                let terminator = "!";
                let adverb;
                switch (category) {
                    case "dance":
                        adverb = "s with";
                        break;
                    case "bully":
                        category = "bullies";
                        adverb = "";
                        break;
                    case "cry":
                        terminator = " :'(";
                        category = "cries";
                        adverb = " on";
                        break;
                    case "wink":
                        adverb = "s at";
                        terminator = " ;)";
                        break;
                    case "cringe":
                        adverb = "s at";
                        terminator = " :|";
                        break;
                    case "awoo":
                        adverb = "s at";
                        terminator = " :O";
                        break;
                    case "cuddle":
                        terminator = " :)";
                    default:
                        adverb = "s";
                        break;
                }
                (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.send(`<@${callerId}> ${category}${adverb} <@${user.id}>${terminator}`);
            }
        }
        catch (err) {
            yield interaction.reply("waifu.pics is down :(");
        }
    })
};
