import type { Guild, User } from "discord.js";
import type { Request } from "express";
declare global {
    declare namespace Express {
        export interface Request extends Request {
            guild?: Guild;
            user?: User;
            query: {
                guildId?: string;
            };
        }
    }
}
