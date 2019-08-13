import * as bodyParser from "body-parser";
import * as express from "express";
import { NextFunction, Request, Response } from "express";
import * as listEndpoints from "express-list-endpoints";
import * as createError from "http-errors";
import * as path from "path";

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
app.use("/app", express.static(path.join(__dirname, "public")));
app.use("/api/v1", router);

app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(500).json(err.message);
});

console.log(listEndpoints(app));

// export default app;
module.exports = app;
