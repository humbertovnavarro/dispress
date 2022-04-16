import { Guild, GuildMember } from "discord.js";
import { NextFunction, Request, Response } from "express";
import DiscordBot from "../../lib/dispress/DiscordBot";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
/**
 * Middleware used to authenticate the user and attach jwt to response object
 */
export function auth (bot: DiscordBot) {
    return (request: Request, response: Response, next: NextFunction) => {
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
        if(!request.context || !request.query) return response.status(500).json({
            error: "Internal server error."
        });
        if(!request.query.guild) return response.status(400).json({
            error: "No guild provided!"
        });
        const guildId = request.query.guild.toString();
        const guild = bot.guilds.cache.get(guildId);
        if(!guild) return response.status(404).json({
            error: "Guild not found!"
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
        if(!request.context.guild || !request.context.user) return response.status(500).json({
            error: "Internal server error!"
        });
        const guild = request.context.guild as Guild;
        const member = await guild.members.fetch({ user: request.context.user.id});
        if(!member) return response.status(401).json({
            error: "You must belong to the guild!"
        });
        request.context.member = member;
        next();
    }
}