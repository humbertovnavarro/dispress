import { Message } from "discord.js";

export default interface SimpleCommand {
    name: string,
    aliases?: string[],
    handler: (message: Message, args: string[], prefix?: string) => void;
}