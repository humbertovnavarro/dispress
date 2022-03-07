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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const cache = new Map();
function handler(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (message.author.bot)
            return;
        if (!message.channel.id)
            return;
        let error;
        let regex;
        if (cache.has(message.channel.id)) {
            const cachedCopy = cache.get(message.channelId);
            if (!cachedCopy) {
                return;
            }
            regex = cachedCopy.regex;
            error = cachedCopy.error;
        }
        else {
            try {
                const restriction = yield prisma.channelRestrictions.findUnique({
                    where: {
                        channel: message.channel.id
                    }
                });
                if (restriction && restriction.regex) {
                    const dbRegex = new RegExp(restriction.regex);
                    cache.set(message.channel.id, { error: restriction.error, regex: dbRegex });
                    regex = dbRegex;
                    error = restriction.error;
                }
                else {
                    return;
                }
            }
            catch (_a) {
                return;
            }
        }
        if (!message.content.match(regex)) {
            const warning = yield message.channel.send(error);
            setTimeout(() => {
                try {
                    if (warning.deletable)
                        warning.delete();
                    if (message.deletable)
                        message.delete();
                }
                catch (error) {
                    console.error(error);
                }
            }, 5000);
        }
    });
}
exports.default = handler;
