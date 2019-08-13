import * as express from "express";
import { NextFunction, Request, Response } from "express";

import { getContents } from "../controller/contentController";
import { echoMessage } from "../controller/echoMessage";
import { jdbcSelect } from "../controller/jdbcAccess";
import { postLogs } from "../controller/logController";
import { asyncHandler } from "../handler/asyncHandler";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello world API" });
});
router.get("/content", asyncHandler(getContents));
router.get("/echo", asyncHandler(echoMessage));
router.get("/jdbc", asyncHandler(jdbcSelect));
router.post("/log", asyncHandler(postLogs));

export default router;
