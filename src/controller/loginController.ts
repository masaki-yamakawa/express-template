import * as bunyan from "bunyan";
import * as config from "config";
import { NextFunction, Request, RequestHandler, Response } from "express";
import * as createError from "http-errors";
import * as jwt from "jsonwebtoken";

import { Logger } from "../logger/logger";
import { LoginRequest } from "../protocol/loginProtocol";

const logger: bunyan = Logger.getLogger();

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const users = [
        { id: 1, userId: "user1", password: "password1" },
        { id: 2, userId: "user2", password: "password2" },
        { id: 3, userId: "user3", password: "password3" },
        { id: 4, userId: "admin", password: "passadmin" },
    ];

    const request: LoginRequest = req.body;
    const user: any[] = users.filter((data) => data.userId === request.userId);
    if (!user || user[0].password !== request.password) {
        logger.debug(`Authentication failed:UserId not found or Unmatch password userId=${request.userId}`);
        throw new createError.Unauthorized();
    }

    const authConfig: any = config.get("authConfig");
    const token = await jwt.sign({ user }, authConfig.secretKey, { expiresIn: authConfig.expire });
    res.setHeader("Authorization", token);
    res.sendStatus(200);
};
