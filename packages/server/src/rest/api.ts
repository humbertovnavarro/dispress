import Express, { Application as ExpressApplication, Response, Request, urlencoded } from "express";
import type DiscordBot from "../lib/dispress/DiscordBot";
import { MusicBotPlugin } from "../plugins/musicbot/plugin";
import dotenv from "dotenv";
import DiscordOAuth, { DiscordUserData } from "./lib/DiscordOAuth";
import CookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import auth from "./middlewares/auth";
const discordOAuth = new DiscordOAuth(
    process.env.DISCORD_CLIENT_ID as string,
    process.env.DISCORD_CLIENT_SECRET as string,
    process.env.DISCORD_REDIRECT_URI as string,
    ["identify"]
);
dotenv.config();
export default function api(bot: DiscordBot): ExpressApplication {

    const app = Express().use(Express.json());
    app.use(CookieParser());

    // Public Routes
    app.get("/api/v1/bot/statistics", (_, response: Response) => {
        response.json({
            ready: bot.isReady(),
            listeners: bot.listeners,
            user: bot.user?.toJSON() || undefined,
            uptime: bot.uptime,
            commands: bot.slashCommands,
        });
    });

    app.get("/api/v1/guild/:guild/queue", (request: Request, response: Response) => {
        const musicBotPlugin: MusicBotPlugin | undefined = bot.getPlugin("musicbot") as MusicBotPlugin | undefined;
        if(!musicBotPlugin) return response.status(500).json({
            error: "Could not fetch music bot plugin, is it missing?"
        });
        const guild = bot.guilds.cache.get(request.params.guild);
        if(!guild) return response.status(404).json({
            error: "Guild not found!"
        });
        const queue = musicBotPlugin.context?.getPlayer().getQueue(guild);
        if(!queue) return response.status(503).end();
        response.json(queue.toJSON());
    });

    app.get("/api/v1/auth/oauth2/callback", async (request: Request, response: Response) => {
        const code = request.query.code?.toString();
        if(!code) return response.status(400).json({
            error: "No code provided!"
        });
        try {
            const accessToken = await discordOAuth.generateAccessToken(code);
            response.cookie("access_token", accessToken.access_token);
            response.cookie("refresh_token", accessToken.refresh_token);
            response.cookie("access_token_expires_on", Date.now() + accessToken.expires_in);
            response.sendStatus(200);
        } catch(error) {
            console.error(error);
            return response.status(500).json({
                error: "Could not generate access token!"
            });
        }
    }, urlencoded({ extended: true }));

    app.get("/api/v1/auth", async (request: Request, response: Response) => {
        const identifyEndpoint = "https://discordapp.com/api/users/@me";
        let accessToken = request.cookies["access_token"];
        const expires_on = parseInt(request.cookies["access_token_expires_on"]);
        if(!accessToken) return response.status(401).json({
            error: "No access token provided!"
        });
        if(Date.now() > expires_on) { 
            try {
                const refreshToken = request.cookies["refresh_token"];
                if(!refreshToken) return response.status(401).json({
                    error: "No refresh token provided!"
                });
                const newAccessToken = await discordOAuth.refreshAccessToken(refreshToken);
                response.cookie("access_token", newAccessToken.access_token);
                response.cookie("refresh_token", newAccessToken.refresh_token);
                response.cookie("access_token_expires_on", Date.now() + newAccessToken.expires_in);
                accessToken = newAccessToken.access_token;
            } catch(error) {
                console.error(error);
                return response.status(401).json({
                    error: "Could not refresh access token!"
                });
            }
        }
        try {
            const user: DiscordUserData = await discordOAuth.getUser(accessToken);
            const tokenPayload = {
                id: user.id,
                expires_on: Date.now() + 3600 * 24 * 7,
            }
            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string);
            response.cookie("jwt", token);
            response.json({
                user,
            });
        } catch(error) {
            console.error(error);
            return response.status(401).json({
                error: "Could not fetch user data!"
            });
        }    
    });
    // Authenticated Routes
    app.use(auth);
    return app;
}
