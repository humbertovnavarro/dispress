import { NextFunction, Request, Response } from "express";
import DiscordOAuth from "../lib/DiscordOAuth";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export default  (request: Request, response: Response, next: NextFunction) => {
    const token = request.cookies['jwt'];
    if(!token) response.sendStatus(401);
    try {
        jwt.verify(token, process.env.JWT_SECRET as string);
    } catch(error) {
        response.sendStatus(401);
    }
    next();
};