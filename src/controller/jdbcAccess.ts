import * as config from "config";
import { NextFunction, Request, RequestHandler, Response } from "express";

import { ConnectionWrapper } from "../dbutil/connectionWrapper";
import { DBConnectionManager } from "../dbutil/dbConnectionManager";
import { DBQueryRunner } from "../dbutil/dbQueryRunner";
import { Logger } from "../logger/logger";

export const jdbcSelect: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const sql: string = req.query.sql;
    const args: string[] = req.query;
    Logger.getLogger().info(`REST Args=${JSON.stringify(args)}`);

    const dbConfig: any = config.get(`jdbcConfig.dbConfig.default`);
    const connManager: DBConnectionManager = DBConnectionManager.getInstance();
    if (!connManager.isInitialized()) {
        await connManager.initialize(dbConfig);
    }

    let conn: ConnectionWrapper = null;
    try {
        conn = await connManager.getConnection();
        const dbQueryRunner = new DBQueryRunner(conn);
        const params: Map<string, any> = new Map();
        Object.keys(args).filter((key) => key !== "sql").forEach((key) => {
            if (isNaN(args[key])) {
                const regexp = /(?<=').*?(?=')/g;
                const variables = args[key].match(regexp);
                if (variables === null) {
                    params.set(key, args[key]);
                } else {
                    params.set(key, variables[0]);
                }
            } else {
                params.set(key, Number(args[key]));
            }
        });
        const results = await dbQueryRunner.query(sql, params);
        res.json(results);
    } catch (err) {
        throw new Error(`jdbcSelect failed:${err}`);
    } finally {
        await connManager.releaseConnection(conn);
    }
};
