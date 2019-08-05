import * as express from "express";
import { NextFunction, Request, Response } from "express";

import { echoMessage } from "../controller/echoMessage";
import { jdbcSelect } from "../controller/jdbcAccess";
import { asyncHandler } from "../handler/asyncHandler";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello world API" });
});
router.get("/echo", asyncHandler(echoMessage));
router.get("/jdbc", asyncHandler(jdbcSelect));
router.post("/jdbc", asyncHandler(jdbcSelect));

export default router;
