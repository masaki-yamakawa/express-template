import { NextFunction, Request, RequestHandler, Response } from "express";
import fs = require("fs");
import * as path from "path";

export const getXmlContents: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const text = fs.readFileSync(path.join(__dirname, "contents.xml"));
    res.setHeader("Content-Type", "text/xml");
    res.send(text);
};
