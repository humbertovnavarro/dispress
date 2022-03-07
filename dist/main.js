"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_1 = __importDefault(require("./lib/client"));
const waifu_1 = __importDefault(require("./slashcommands/waifu"));
const restrictions_1 = __importDefault(require("./handlers/messages/restrictions"));
const addrestriction_1 = __importDefault(require("./slashcommands/addrestriction"));
client_1.default.useMessage(restrictions_1.default);
client_1.default.useCommand(waifu_1.default);
client_1.default.useCommand(addrestriction_1.default);
client_1.default.login(process.env.TOKEN);
