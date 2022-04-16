declare namespace Express {
    interface Request {
        context: any;
        user: {
            id: string;
        };
    }
}