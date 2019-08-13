import * as config from "config";
import { NextFunction, Request, RequestHandler, Response } from "express";

import { ConnectionWrapper } from "../dbutil/connectionWrapper";
import { DBConnectionManager } from "../dbutil/dbConnectionManager";
import { DBQueryRunner } from "../dbutil/dbQueryRunner";
import { ContentCondition } from "../protocol/contentProtocol";

export const getContents: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const condition: ContentCondition = req.query as ContentCondition;
    console.log(`REST Args=${JSON.stringify(condition)}`);

    const dbConfig: any = config.get(`jdbcConfig.dbConfig.default`);
    const connManager: DBConnectionManager = DBConnectionManager.getInstance();
    if (!connManager.isInitialized()) {
        await connManager.initialize(dbConfig);
    }

    let conn: ConnectionWrapper = null;
    try {
        conn = await connManager.getConnection();
        const dbQueryRunner = new DBQueryRunner(conn);
        const sqlAndCond: [string, Map<string, any>] = buildSql(condition);
        const results = await dbQueryRunner.query(sqlAndCond[0], sqlAndCond[1]);
        res.json(results);
    } catch (err) {
        throw new Error(`getContents failed:${err}`);
    } finally {
        await connManager.releaseConnection(conn);
    }
};

const buildSql = (condition: ContentCondition): [string, Map<string, any>] => {
    let sql: string = "SELECT * FROM CONTENT";

    const condMap: Map<string, any> = new Map();
    if (condition.id) {
        condMap.set("id", condition.id);
    }
    if (condition.title) {
        condMap.set("title", condition.title);
    }
    if (condition.url) {
        condMap.set("url", condition.url);
    }

    let counter = 0;
    for (const [key, value] of condMap.entries()) {
        if (counter === 0) {
            sql = `${sql} WHERE ${key}=\$\{${key}\}`;
        } else {
            sql = `${sql} AND ${key}=\$\{${key}\}`;
        }
        counter++;
    }

    if (condition.sortBy) {
        sql = `${sql} ORDER BY ${condition.sortBy}`;
        if (condition.order) {
            sql = `${sql} ${condition.order}`;
        }
    }

    return [sql, condMap];
};
