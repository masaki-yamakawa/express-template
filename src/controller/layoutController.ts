import * as config from "config";
import { NextFunction, Request, RequestHandler, Response } from "express";

import { ConnectionWrapper } from "../dbutil/connectionWrapper";
import { DBConnectionManager } from "../dbutil/dbConnectionManager";
import { DBQueryRunner } from "../dbutil/dbQueryRunner";
import { Layout } from "../entity/layout";
import { Logger } from "../logger/logger";
import { GetLayoutCondition, GetLayoutResponse, LayoutProtocol, PostLayoutRequest } from "../protocol/layoutProtocol";

export const postLayouts: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const paramLayouts: PostLayoutRequest = req.body as PostLayoutRequest;
    Logger.getLogger().info(`REST Args=${JSON.stringify(paramLayouts)}`);

    const dbConfig: any = config.get(`jdbcConfig.dbConfig.default`);
    const connManager: DBConnectionManager = DBConnectionManager.getInstance();
    if (!connManager.isInitialized()) {
        await connManager.initialize(dbConfig);
    }

    let conn: ConnectionWrapper = null;
    try {
        conn = await connManager.getConnection();
        const dbQueryRunner = new DBQueryRunner(conn);

        for (const paramLayout of paramLayouts.layouts) {
            const condMap: Map<string, any> = new Map();
            if (paramLayout.id) {
                condMap.set("id", paramLayout.id);
            } else {
                condMap.set("owner", paramLayouts.owner);
                condMap.set("name", paramLayout.name);
            }
            const sql: string = buildSql(condMap);
            const results: Layout[] = await dbQueryRunner.query(sql, condMap);
            let version: number = 1;
            if (results.length > 0) {
                version = Math.max(...results.map((l) => l.version)) + 1;
            }

            const layout: Layout = new Layout(
                paramLayout.id,
                paramLayouts.owner,
                paramLayout.name,
                version,
                paramLayouts.group,
                paramLayout.shareWith,
                JSON.stringify(paramLayout.layout),
                null);
            await dbQueryRunner.update(
                "INSERT INTO Layout(owner, name, version, belonging, shareWith, layout, saveDateTime) " +
                "VALUES(${owner}, ${name}, ${version}, ${belonging}, ${shareWith}, ${layout}, NOW())",
                new Map(Object.entries(layout)));
        }
        await conn.commit();

        res.json({ result: "success" });
    } catch (err) {
        Logger.getLogger().error("postLayouts failed");
        await conn.rollback();
        throw err;
    } finally {
        await connManager.releaseConnection(conn);
    }
};

export const getLayouts: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const condition: GetLayoutCondition = req.query as GetLayoutCondition;
    Logger.getLogger().info(`REST Args=${JSON.stringify(condition)}`);

    const dbConfig: any = config.get(`jdbcConfig.dbConfig.default`);
    const connManager: DBConnectionManager = DBConnectionManager.getInstance();
    if (!connManager.isInitialized()) {
        await connManager.initialize(dbConfig);
    }

    let conn: ConnectionWrapper = null;
    try {
        const condMap: Map<string, any> = new Map();
        if (condition.owner !== undefined) {
            condMap.set("owner", condition.owner);
        }
        if (condition.group !== undefined) {
            condMap.set("belonging", condition.group);
        }
        if (condition.shareWith !== undefined) {
            condMap.set("shareWith", condition.shareWith);
        }
        const sql: string = buildSql(condMap);

        conn = await connManager.getConnection();
        const dbQueryRunner = new DBQueryRunner(conn);
        const results: Layout[] = await dbQueryRunner.query(sql, condMap);
        res.json(convertProtocol(results));
    } catch (err) {
        Logger.getLogger().error("getLayouts failed");
        throw err;
    } finally {
        await connManager.releaseConnection(conn);
    }
};

const buildSql = (conditions: Map<string, any>): string => {
    let sql: string =
        "SELECT" +
        "  Base.id, Base.owner, Base.name, Base.version, Base.belonging, Base.shareWith, Base.layout, Base.saveDateTime " +
        "FROM" +
        "  Layout AS Base " +
        "INNER JOIN" +
        "  (SELECT owner, name, MAX(version) as maxVersion FROM Layout GROUP BY owner, name) AS MaxVer" +
        "   ON" +
        "    Base.owner = MaxVer.owner AND " +
        "    Base.name = MaxVer.name AND " +
        "    Base.version = MaxVer.maxVersion";

    let counter = 0;
    for (const key of conditions.keys()) {
        if (counter === 0) {
            sql = `${sql} WHERE Base.${key}=\$\{${key}\}`;
        } else {
            sql = `${sql} AND Base.${key}=\$\{${key}\}`;
        }
        counter++;
    }
    return sql;
};

const convertProtocol = (layouts: Layout[]): GetLayoutResponse[] => {
    if (layouts.length === 0) {
        return null;
    }

    const map: Map<string, GetLayoutResponse> = new Map();
    for (const layout of layouts) {
        let response: GetLayoutResponse = map.get(layout.owner);
        if (!response) {
            response = {
                owner: layout.owner,
                group: layout.belonging,
                layouts: [],
            };
        }
        const layoutProtocol: LayoutProtocol = {
            id: layout.id,
            name: layout.name,
            shareWith: layout.shareWith,
            layout: layout.layout,
        };
        response.layouts.push(layoutProtocol);

        map.set(layout.owner, response);
    }
    return Array.from(map.values());
};
