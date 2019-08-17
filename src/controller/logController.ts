import { NextFunction, Request, RequestHandler, Response } from "express";

import { Logger } from "../logger/logger";
import { LogRequest } from "../protocol/logProtocol";

export const postLogs: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const logs: LogRequest[] = req.body;
    for (const log of logs) {
        Logger.getLogger().info(`${log.time} [${log.levelName}][${log.name}] ${log.msg}`);
    }
    res.json({});
};
