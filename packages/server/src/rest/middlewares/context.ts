import { NextFunction, Request, Response } from "express";

// Adds a context object to the request
export default function context(request: Request, response: Response, next: NextFunction) {
    request.context = {};
    next();
}