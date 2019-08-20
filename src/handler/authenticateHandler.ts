import * as bunyan from "bunyan";
import * as config from "config";
import { NextFunction, Request, RequestHandler, Response } from "express";
import * as jwt from "jsonwebtoken";

import { Logger } from "../logger/logger";

const logger: bunyan = Logger.getLogger();

export const authenticateHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const authConfig: any = config.get("authConfig");

    if (!authConfig.enabled) {
        next();
        return;
    }

    const bearerHeader: string = req.headers.authorization;

    if (!bearerHeader) {
        logger.debug("Authentication failed:Token not found");
        res.sendStatus(403);
        return;
    }

    let bearerToken: string = null;
    try {
        const bearer: string[] = bearerHeader.split(" ");
        bearerToken = bearer[1];
        await jwt.verify(bearerToken, authConfig.secretKey);
        next();
    } catch (err) {
        logger.debug(`Authentication failed:Invalid token ${bearerToken}`);
        res.sendStatus(403);
    }
};
