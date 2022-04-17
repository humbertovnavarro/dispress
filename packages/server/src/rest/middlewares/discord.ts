import { Guild } from "discord.js";
import { NextFunction, Request, response, Response } from "express";
import DiscordBot from "../../lib/dispress/DiscordBot";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MusicBotPlugin } from "../../plugins/musicbot/plugin";
dotenv.config();

/**
 * Middleware used to authenticate the user and attach jwt to response object
 */
export function auth (bot: DiscordBot) {
    return (request: Request, response: Response, next: NextFunction) => {
        if(!bot.isReady()) {
            return response.sendStatus(503);
        }
        const token = request.cookies['jwt'];
        if(!token) return response.sendStatus(401);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            request.context.user = decoded as { id: string };
            if(!decoded) return response.sendStatus(401);
        } catch(error) {
            return response.sendStatus(401);
        }
        next();
    };
}
/**
 * Middleware used to fetch  guild from urlencoded guild id
 */
export function guild(bot: DiscordBot) {
    return (request: Request, response: Response, next: NextFunction) => {
        if(!bot.isReady()) {
            return response.sendStatus(503);
        }
        if(!request.context || !request.query) {
            console.log("guild")
            return response.status(500).json({
                error: "Internal server error."
            });
        }
        if(!request.query.guild) return response.status(400).json({
            error: "No guild provided!"
        });
        const guildId = request.query.guild.toString();
        const guild = bot.guilds.cache.get(guildId);
        if(!guild) return response.status(404).json({
            error: "Guild not found"
        });
        request.context.guild = guild;
        next();
    }
}
/**
 * Middleware used to assert that user is a member of specified guild.
 */
export function member(bot: DiscordBot) {
    return async (request: Request, response: Response, next: NextFunction) => {
        if(!bot.isReady()) {
            return response.sendStatus(503);
        }
        if(!request.context.guild || !request.context.user) {
            console.log("member");
            return response.status(500).json({
                error: "Internal server error!"
            });
        }
        const guild = request.context.guild as Guild;
        const member = await guild.members.fetch({ user: request.context.user.id});
        if(!member) return response.status(401).json({
            error: "You must belong to the guild!"
        });
        request.context.member = member;
        next();
    }
}

export function guildQueue(bot: DiscordBot) {
    return async (request: Request, response: Response, next: NextFunction) => {
        if(!bot.isReady()) {
            return response.sendStatus(503);
        }
        const guild = request.context.guild;
        if(!request.context.guild) {
            return response.status(500).json({
                error: "No guild found."
            });
        }
        const musicBotPlugin: MusicBotPlugin | undefined = bot.getPlugin("musicbot") as MusicBotPlugin | undefined;
        if(!musicBotPlugin) {
            return response.status(500).json({
                error: "No music bot plugin found!"
            });
        }
        const player = musicBotPlugin.context?.getPlayer();
        if(!player) {
            return response.status(404).json({
                error: "No bot player found"
            });
        }
        const queue = player.getQueue(guild);
        if(!queue) {
            return response.json({
                error: "No guild queue"
            });
        }
        request.context.queue = queue;
        next();
    }
}