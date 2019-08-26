import * as express from "express";
import { NextFunction, Request, Response } from "express";

import { getContents } from "../controller/contentController";
import { echoMessage } from "../controller/echoMessage";
import { jdbcSelect } from "../controller/jdbcAccess";
import { postLogs } from "../controller/logController";
import { login } from "../controller/loginController";
import { getXmlContents } from "../controller/xmlContentController";
import { asyncHandler } from "../handler/asyncHandler";
import { authenticateHandler } from "../handler/authenticateHandler";
import { validationHandler } from "../handler/validationHandler";
import { echoRequestValidator } from "../validator/echoMessageValidator";
import { jdbcSelectRequestValidator } from "../validator/jdbcAccessValidator";
import { loginRequestValidator } from "../validator/loginValidator";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello world API" });
});
router.post("/login", loginRequestValidator, validationHandler, asyncHandler(login));

router.get("/content", validationHandler, authenticateHandler, asyncHandler(getContents));
router.get("/xmlContent", validationHandler, asyncHandler(getXmlContents));
router.get("/echo", echoRequestValidator, validationHandler, asyncHandler(echoMessage));
router.get("/jdbc", jdbcSelectRequestValidator, validationHandler, asyncHandler(jdbcSelect));
router.post("/log", validationHandler, asyncHandler(postLogs));

export default router;
