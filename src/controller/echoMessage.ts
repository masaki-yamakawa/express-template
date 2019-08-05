import { NextFunction, Request, RequestHandler, Response } from "express";

export const echoMessage: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const message: string = req.query.message;
    if (message === undefined) {
        res.status(400).json({ error: `'message' is required. your request=${JSON.stringify(req)}` });
        return;
    }
    res.json({ message: `Reply: ${message}` });
};
