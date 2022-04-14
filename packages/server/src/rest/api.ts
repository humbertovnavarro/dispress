import Express, { Application as ExpressApplication, Response } from "express";
import type DiscordBot from "../lib/dispress/DiscordBot";
export default function api(bot: DiscordBot): ExpressApplication {
    const app = Express().use(Express.json());
    app.get("/v1/bot/statistics", (_, response: Response) => {
        response.json({
            ready: bot.isReady(),
            listeners: bot.listeners,
            user: bot.user?.toJSON() || undefined,
            uptime: bot.uptime,
            commands: bot.slashCommands,
        });
    })
    return app;
}