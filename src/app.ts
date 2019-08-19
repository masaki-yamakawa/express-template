import * as bodyParser from "body-parser";
import * as express from "express";
import { NextFunction, Request, Response } from "express";
import * as listEndpoints from "express-list-endpoints";
import * as createError from "http-errors";
import * as path from "path";

import { loggingHandler} from "./handler/loggingHandler";
import { Logger } from "./logger/logger";
import router from "./routes/index";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.disable("x-powered-by");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(loggingHandler);

app.use("/app", express.static(path.join(__dirname, "public")));
app.use("/api/v1", router);

app.use((req: Request, res: Response, next: NextFunction) => {
    throw new createError.NotFound(`Path not found:${req.path}`);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const status: number = (err as any).statusCode ? (err as any).statusCode : 500;
    const stack = (err as any).stack ? (err as any).stack : "";
    Logger.getLogger().error(`name=${err.name}, status=${status}, message=${err.message}, stack=${stack}`);
    res.status(status).json({ name: err.name, message: err.message });
});

Logger.getLogger().info(listEndpoints(app));

// export default app;
module.exports = app;
