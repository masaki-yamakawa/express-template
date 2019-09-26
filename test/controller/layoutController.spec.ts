import * as config from "config";

import { getLayouts, postLayouts } from "../../src/controller/layoutController";
import { ConnectionWrapper } from "../../src/dbutil/connectionWrapper";
import { DBConnectionManager } from "../../src/dbutil/dbConnectionManager";
import { DBQueryRunner } from "../../src/dbutil/dbQueryRunner";
import { Layout } from "../../src/entity/layout";
import { PostLayoutRequest } from "../../src/protocol/layoutProtocol";
import { mockGetRequest, mockPostRequest, mockResponse } from "../mockRequestResponse";

const dbConfig: any = config.get(`jdbcConfig.dbConfig.default`);
const connManager: DBConnectionManager = DBConnectionManager.getInstance();
let connection: ConnectionWrapper = null;
let dbQueryRunner: DBQueryRunner = null;

beforeAll(async () => {
    await connManager.initialize(dbConfig);
    connection = await connManager.getConnection();

    dbQueryRunner = new DBQueryRunner(connection);
    const sql: string =
        "CREATE TABLE IF NOT EXISTS Layout (" +
        "  id           int NOT NULL AUTO_INCREMENT," +
        "  owner        varchar(8) NOT NULL," +
        "  name         varchar(50) NOT NULL," +
        "  version      int NOT NULL," +
        "  belonging    varchar(20) NOT NULL," +
        "  shareWith    varchar(5) NOT NULL," +
        "  layout       text NOT NULL," +
        "  saveDateTime datetime NOT NULL," +
        "  PRIMARY KEY(id)" +
        ")";
    await dbQueryRunner.update(sql);
    await connection.commit();
});
afterAll(async () => {
    // const sql: string = "DROP TABLE IF EXISTS Layout";
    // await dbQueryRunner.update(sql);
    // await connection.commit();
    await connManager.releaseConnection(connection);
});

describe("postLayouts", () => {
    beforeEach(async () => {
        await dbQueryRunner.update("DELETE FROM Layout");
        await connection.commit();
    });

    it("should register one record into database if request layout is one", async () => {
        const layoutReq: PostLayoutRequest = {
            owner: "owner1",
            group: "group1",
            layouts: [
                {
                    id: null,
                    name: "layoutName1",
                    shareWith: "None",
                    layout: "layout1",
                },
            ],
        };
        const req: any = mockPostRequest(layoutReq);
        const res: any = mockResponse();

        await postLayouts(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith({ result: "success" });

        const results: Layout[] = await dbQueryRunner.query("SELECT * FROM Layout");
        expect(results.length).toBe(1);
        expect(results).toEqual([
            {
                id: expect.anything(),
                owner: layoutReq.owner,
                name: layoutReq.layouts[0].name,
                version: 1,
                belonging: layoutReq.group,
                shareWith: layoutReq.layouts[0].shareWith,
                layout: `\"${layoutReq.layouts[0].layout}\"`,
                saveDateTime: expect.anything(),
            },
        ]);
    });

    it("should register specified records into database if request layout is multiples", async () => {
        const layoutReq: PostLayoutRequest = {
            owner: "owner2",
            group: "group1",
            layouts: [
                {
                    id: null,
                    name: "layoutName2",
                    shareWith: "None",
                    layout: "layout2",
                },
                {
                    id: null,
                    name: "layoutName3",
                    shareWith: "All",
                    layout: "layout3",
                },
                {
                    id: null,
                    name: "layoutName4",
                    shareWith: "Group",
                    layout: "layout4",
                },
            ],
        };
        const req: any = mockPostRequest(layoutReq);
        const res: any = mockResponse();

        await postLayouts(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith({ result: "success" });

        const results: Layout[] = await dbQueryRunner.query(`SELECT * FROM Layout`);
        expect(results.length).toBe(3);
        expect(results).toEqual([
            {
                id: expect.anything(),
                owner: layoutReq.owner,
                name: layoutReq.layouts[0].name,
                version: 1,
                belonging: layoutReq.group,
                shareWith: layoutReq.layouts[0].shareWith,
                layout: `\"${layoutReq.layouts[0].layout}\"`,
                saveDateTime: expect.anything(),
            },
            {
                id: expect.anything(),
                owner: layoutReq.owner,
                name: layoutReq.layouts[1].name,
                version: 1,
                belonging: layoutReq.group,
                shareWith: layoutReq.layouts[1].shareWith,
                layout: `\"${layoutReq.layouts[1].layout}\"`,
                saveDateTime: expect.anything(),
            },
            {
                id: expect.anything(),
                owner: layoutReq.owner,
                name: layoutReq.layouts[2].name,
                version: 1,
                belonging: layoutReq.group,
                shareWith: layoutReq.layouts[2].shareWith,
                layout: `\"${layoutReq.layouts[2].layout}\"`,
                saveDateTime: expect.anything(),
            },
        ]);
    });

    it("should register new record into database if request is update", async () => {
        const layoutReq: PostLayoutRequest = {
            owner: "owner1",
            group: "group1",
            layouts: [
                {
                    id: null,
                    name: "layoutName1",
                    shareWith: "None",
                    layout: "layout1",
                },
            ],
        };
        const req: any = mockPostRequest(layoutReq);
        const res: any = mockResponse();

        await postLayouts(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith({ result: "success" });

        const results: Layout[] = await dbQueryRunner.query("SELECT * FROM Layout");
        expect(results.length).toBe(1);
        expect(results).toEqual([
            {
                id: expect.anything(),
                owner: layoutReq.owner,
                name: layoutReq.layouts[0].name,
                version: 1,
                belonging: layoutReq.group,
                shareWith: layoutReq.layouts[0].shareWith,
                layout: `\"${layoutReq.layouts[0].layout}\"`,
                saveDateTime: expect.anything(),
            },
        ]);

        await connection.commit();

        const updateLayoutReq: PostLayoutRequest = {
            owner: "owner1",
            group: "group1",
            layouts: [
                {
                    id: results[0].id,
                    name: "UpdatedLayoutName1",
                    shareWith: "All",
                    layout: "UpdatedLayout1",
                },
            ],
        };
        const updatedReq: any = mockPostRequest(updateLayoutReq);
        const updatedRes: any = mockResponse();
        await postLayouts(updatedReq, updatedRes, () => { });
        expect(updatedRes.json).toHaveBeenCalledWith({ result: "success" });

        const results2: Layout[] = await dbQueryRunner.query("SELECT * FROM Layout");
        expect(results2.length).toBe(2);
        expect(results2).toEqual([
            {
                id: expect.anything(),
                owner: layoutReq.owner,
                name: layoutReq.layouts[0].name,
                version: 1,
                belonging: layoutReq.group,
                shareWith: layoutReq.layouts[0].shareWith,
                layout: `\"${layoutReq.layouts[0].layout}\"`,
                saveDateTime: expect.anything(),
            },
            {
                id: expect.anything(),
                owner: updateLayoutReq.owner,
                name: updateLayoutReq.layouts[0].name,
                version: 2,
                belonging: updateLayoutReq.group,
                shareWith: updateLayoutReq.layouts[0].shareWith,
                layout: `\"${updateLayoutReq.layouts[0].layout}\"`,
                saveDateTime: expect.anything(),
            },
        ]);
    });

    it("should rollback database and throw error if request includes illegal parameters", async () => {
        const layoutReq: PostLayoutRequest = {
            owner: "owner2",
            group: "group1",
            layouts: [
                {
                    id: null,
                    name: "layoutName2",
                    shareWith: "None",
                    layout: "layout2",
                },
                {
                    id: null,
                    name: "layoutName3",
                    shareWith: "All",
                    layout: "layout3",
                },
                {
                    id: undefined,
                    name: "layoutName4",
                    shareWith: "OverflowString" as any,
                    layout: 1,
                },
            ],
        };
        const req: any = mockPostRequest(layoutReq);
        const res: any = mockResponse();

        const postLayoutsPromise = postLayouts(req, res, () => { });
        await expect(postLayoutsPromise).rejects.toThrow();

        const results: Layout[] = await dbQueryRunner.query(`SELECT * FROM Layout`);
        expect(results.length).toBe(0);
        expect(results).toEqual([]);
    });
});

describe("getLayouts: database is empty", () => {
    beforeEach(async () => {
        await dbQueryRunner.update("DELETE FROM Layout");
        await connection.commit();
    });

    it("should return empty array if database is empty", async () => {
        const queryParams = {};
        const req: any = mockGetRequest(queryParams);
        const res: any = mockResponse();

        await getLayouts(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith(null);
    });
});

describe("getLayouts: database has rows", () => {
    beforeEach(async () => {
        await dbQueryRunner.update("DELETE FROM Layout");

        const layouts: Layout[] = [];
        const layout1: Layout = new Layout(null, "user1", "layoutName1", 1, "group1", "None", "layout1", null);
        const layout2: Layout = new Layout(null, "user2", "layoutName2", 1, "group1", "Group", "layout2", null);
        const layout3: Layout = new Layout(null, "user3", "layoutName3", 1, "group2", "All", "layout3", null);
        const layout4: Layout = new Layout(null, "user1", "layoutName1", 2, "group1", "None", "layout4", null);
        const layout5: Layout = new Layout(null, "user2", "layoutName2", 2, "group1", "None", "layout5", null);
        const layout6: Layout = new Layout(null, "user2", "layoutName2", 3, "group1", "Group", "layout6", null);
        layouts.push(layout1);
        layouts.push(layout2);
        layouts.push(layout3);
        layouts.push(layout4);
        layouts.push(layout5);
        layouts.push(layout6);
        for (const layout of layouts) {
            await dbQueryRunner.update(
                "INSERT INTO Layout(owner, name, version, belonging, shareWith, layout, saveDateTime) " +
                "VALUES(${owner}, ${name}, ${version}, ${belonging}, ${shareWith}, ${layout}, NOW())",
                new Map(Object.entries(layout)));
        }
        await connection.commit();
    });

    it("should return all entities if condition is nothing", async () => {
        const queryParams = {};
        const req: any = mockGetRequest(queryParams);
        const res: any = mockResponse();

        await getLayouts(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith({
            owner: "user3",
            group: "group2",
            layouts: [
                { id: expect.anything(), name: "layoutName3", shareWith: "All", layout: "layout3" },
                { id: expect.anything(), name: "layoutName1", shareWith: "None", layout: "layout4" },
                { id: expect.anything(), name: "layoutName2", shareWith: "Group", layout: "layout6" },
            ],
        });
    });

    it("should return entities that matches condition if condition is specified:condition=1", async () => {
        const queryParams = { owner: "user3" };
        const req: any = mockGetRequest(queryParams);
        const res: any = mockResponse();

        await getLayouts(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith({
            owner: "user3",
            group: "group2",
            layouts: [
                { id: expect.anything(), name: "layoutName3", shareWith: "All", layout: "layout3" },
            ],
        });
    });

    it("should return entities that matches condition if condition is specified:condition=2", async () => {
        const queryParams = { owner: "user2", shareWith: "Group" };
        const req: any = mockGetRequest(queryParams);
        const res: any = mockResponse();

        await getLayouts(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith({
            owner: "user2",
            group: "group1",
            layouts: [
                { id: expect.anything(), name: "layoutName2", shareWith: "Group", layout: "layout6" },
            ],
        });
    });

    it("should return null if not matches condition", async () => {
        const queryParams = { owner: "user2", shareWith: "None" };
        const req: any = mockGetRequest(queryParams);
        const res: any = mockResponse();

        await getLayouts(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith(null);
    });
});
