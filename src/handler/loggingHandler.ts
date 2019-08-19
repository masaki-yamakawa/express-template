import * as bunyan from "bunyan";
import { NextFunction, Request, RequestHandler, Response } from "express";

import { Logger } from "../logger/logger";

const logger: bunyan = Logger.getLogger();

export const loggingHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const requestPath = req.path;
    const paramString = JSON.stringify(req.body);
    const originalEnd = res.end;
    const originalWrite = res.write;
    const chunks: Buffer[] = [];

    logger.info(`REST_START: ${req.method} ${requestPath} params=${paramString}`);

    res.write = (chunk: any): boolean => {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        originalWrite.apply(res, chunk);
        return true;
    };

    res.end = (chunk: any) => {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        const body = Buffer.concat(chunks).toString("utf8");
        logger.info(`REST_END  : ${req.method} ${requestPath} params=${paramString} ${res.statusCode} body=${body}`);

        originalEnd.apply(res, [chunk]);
    };

    next();
};
