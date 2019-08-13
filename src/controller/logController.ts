import { NextFunction, Request, RequestHandler, Response } from "express";

import { Log } from "../protocol/logProtocol";

export const postLogs: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const logs: Log[] = req.body;
    for (const log of logs) {
        console.log(`${log.time} [${log.levelName}][${log.name}] ${log.msg}`);
    }
    res.json({});
};
