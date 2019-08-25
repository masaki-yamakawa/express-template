import { NextFunction, Request, RequestHandler, Response } from "express";
import { validationResult } from "express-validator";

export const validationHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
        return;
    }
    next();
};
