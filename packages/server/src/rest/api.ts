import Express, { Application as ExpressApplication, Response, Request, urlencoded, response } from "express";
import type DiscordBot from "../lib/dispress/DiscordBot";
import dotenv from "dotenv";
import DiscordOAuth, { DiscordUserData } from "./lib/DiscordOAuth";
import CookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { auth, guild, guildQueue, member } from "./middlewares/discord";
import { Queue, Track } from "discord-player";
import searchForTrack from "../plugins/musicbot/helpers/searchForTrack";
import { GuildMember } from "discord.js";
const discordOAuth = new DiscordOAuth(
    process.env.DISCORD_CLIENT_ID as string,
    process.env.DISCORD_CLIENT_SECRET as string,
    process.env.DISCORD_REDIRECT_URI as string,
    ["identify"]
);
dotenv.config();
export default function api(bot: DiscordBot): ExpressApplication {
    const router = Express.Router();
    const app = Express();
    app.use(Express.json())
    app.use(Express.urlencoded({
        extended: false
    }));
    app.use(CookieParser());

    app.get("/login", (request, response) => {
        response.redirect(process.env.DISCORD_OAUTH_URL as string);
    });

    app.get("/api/v1/bot/statistics", (_, response: Response) => {
        response.json({
            ready: bot.isReady(),
            listeners: bot.listeners,
            user: bot.user?.toJSON() || undefined,
            uptime: bot.uptime,
            commands: bot.slashCommands,
        });
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
            response.redirect("/api/v1/auth");
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
            response.redirect("/");
        } catch(error) {
            console.error(error);
            return response.status(401).json({
                error: "Could not fetch user data!"
            });
        }
    });

    router.use("*", (request, response, next) => {
        request.context = {};
        next();
    })

    const guildMiddleware = guild(bot);
    const guildQueueMiddleware = guildQueue(bot);
    const memberMiddleware = member(bot);
    const authMiddleware = auth(bot);

    router.use("/api/v1/guild", authMiddleware, guildMiddleware, memberMiddleware);
    router.use("/api/v1/member", authMiddleware, guildMiddleware, memberMiddleware);
    router.use("/api/v1/guild/queue", authMiddleware, guildMiddleware, memberMiddleware, guildQueueMiddleware);

    app.use("/", router);

    app.get("/api/v1/guild", (request: Request, response: Response) => {
        response.json(request.context.guild.toJSON());
    });

    app.get("/api/v1/guild/queue", (request: Request, response: Response) => {
        const queue = request.context.queue;
        const tracks = queue.tracks.map((track: Track) => {
            const { requestedBy, url, thumbnail, views, duration, author, title, description, id } = track;
            return {
                requestedBy,
                url,
                thumbnail,
                views,
                duration,
                author,
                title,
                description,
                id,
            }
        });
        const previousTracks = queue.previousTracks.map((track: Track) => {
            const { requestedBy, url, thumbnail, views, duration, author, title, description, id } = track;
            return {
                requestedBy,
                url,
                thumbnail,
                views,
                duration,
                author,
                title,
                description,
                id,
            }
        });
        const payload = {
            tracks: tracks,
            current: queue.current,
            previous: previousTracks
        }
        response.json(payload);
    });

    app.post("/api/v1/guild/queue/play", async (request: Request, response: Response) => {
        const query = request.body.track;
        if(!query || !query.toString().startsWith("http")) {
            return response.status(400).json({
                error: "Invalid body"
            });
        }
        const queue = request.context.queue as Queue;
        const player = queue.player;
        const guild = queue.guild;
        const member = request.context.member as GuildMember;
        const track = await searchForTrack(player, guild, member.user, query);
        if(!track) return response.status(404).json({
            error: "Could not find track"
        });
        queue.addTrack(track);
    });

    return app;
}
