import * as config from "config";

import { getContents } from "../../src/controller/contentController";
import { ConnectionWrapper } from "../../src/dbutil/connectionWrapper";
import { DBConnectionManager } from "../../src/dbutil/dbConnectionManager";
import { DBQueryRunner } from "../../src/dbutil/dbQueryRunner";
import { Content } from "../../src/entity/content";
import { ContentCondition } from "../../src/protocol/contentProtocol";
import { mockGetRequest as mockRequest, mockResponse } from "../mockRequestResponse";

const dbConfig: any = config.get(`jdbcConfig.dbConfig.default`);
const connManager: DBConnectionManager = DBConnectionManager.getInstance();
let connection: ConnectionWrapper = null;
let dbQueryRunner: DBQueryRunner = null;

beforeAll(async () => {
    await connManager.initialize(dbConfig);
    connection = await connManager.getConnection();

    dbQueryRunner = new DBQueryRunner(connection);
    const sql: string =
        "CREATE TABLE IF NOT EXISTS CONTENT (" +
        "  id    int," +
        "  title varchar(30)," +
        "  url   varchar(350)" +
        ")";
    await dbQueryRunner.update(sql);
});
afterAll(async () => {
    // const sql: string = "DROP TABLE IF EXISTS CONTENT";
    // await dbQueryRunner.update(sql);
    await connManager.releaseConnection(connection);
});

describe("getContents: database is empty", () => {
    beforeEach(async () => {
        await dbQueryRunner.update("DELETE FROM CONTENT");
    });

    it("should return empty array if database is empty", async () => {
        const logs = {};
        const req: any = mockRequest(logs);
        const res: any = mockResponse();

        await getContents(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith([]);
    });
});

describe("getContents: database has rows", () => {
    beforeEach(async () => {
        await dbQueryRunner.update("DELETE FROM CONTENT");

        const contents: Content[] = [];
        const content1: Content = new Content(1, "Google Map:Overview", "http://maps.google.co.jp/maps?&output=embed");
        const content2: Content = new Content(2, "Google Map:Nagoya Station", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.4425090625195!2d136.88223540000004!3d35.170521900000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600376e794d78b89%3A0x81f7204bf8261663!2z5ZCN5Y-k5bGL6aeF!5e0!3m2!1sja!2sjp!4v1433317763525");
        const content3: Content = new Content(3, "YouTube:Tokyo Olympic", "https://www.youtube.com/embed/sk6uU8gb8PA?rel=0");
        const content4: Content = new Content(4, "Embeded View 1", "http://localhost:8000/embeded-view1");
        const content5: Content = new Content(5, "Embeded View 2", "http://localhost:8000/embeded-view2");
        const content6: Content = new Content(6, "View 1", "http://localhost:8000/view1");
        const content7: Content = new Content(7, "Blank page", "http://localhost:8080/url1");
        contents.push(content1);
        contents.push(content2);
        contents.push(content3);
        contents.push(content4);
        contents.push(content5);
        contents.push(content6);
        contents.push(content7);
        for (const content of contents) {
            const paramMap: Map<string, any> = new Map(Object.entries(content));
            await dbQueryRunner.update("INSERT INTO CONTENT(ID, TITLE, URL) VALUES(${id}, ${title}, ${url})", paramMap);
        }
    });

    it("should return all entities if condition is nothing", async () => {
        const cond = {};
        const req: any = mockRequest(cond);
        const res: any = mockResponse();

        await getContents(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith([
            { id: 1, title: "Google Map:Overview", url: "http://maps.google.co.jp/maps?&output=embed" },
            { id: 2, title: "Google Map:Nagoya Station", url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.4425090625195!2d136.88223540000004!3d35.170521900000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600376e794d78b89%3A0x81f7204bf8261663!2z5ZCN5Y-k5bGL6aeF!5e0!3m2!1sja!2sjp!4v1433317763525" },
            { id: 3, title: "YouTube:Tokyo Olympic", url: "https://www.youtube.com/embed/sk6uU8gb8PA?rel=0" },
            { id: 4, title: "Embeded View 1", url: "http://localhost:8000/embeded-view1" },
            { id: 5, title: "Embeded View 2", url: "http://localhost:8000/embeded-view2" },
            { id: 6, title: "View 1", url: "http://localhost:8000/view1" },
            { id: 7, title: "Blank page", url: "http://localhost:8080/url1" }
        ]);
    });

    it("should return entities that matches condition if condition is specified:condition=1", async () => {
        const cond = { id: 6 };
        const req: any = mockRequest(cond);
        const res: any = mockResponse();

        await getContents(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith([
            { id: 6, title: "View 1", url: "http://localhost:8000/view1" },
        ]);
    });

    it("should return entities that matches condition if condition is specified:condition=2", async () => {
        const cond = { title: "YouTube:Tokyo Olympic", url: "https://www.youtube.com/embed/sk6uU8gb8PA?rel=0" };
        const req: any = mockRequest(cond);
        const res: any = mockResponse();

        await getContents(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith([
            { id: 3, title: "YouTube:Tokyo Olympic", url: "https://www.youtube.com/embed/sk6uU8gb8PA?rel=0" },
        ]);
    });

    it("should return ordered entities if order is specified", async () => {
        const cond: ContentCondition = { sortBy: "title", order: "DESC" };
        const req: any = mockRequest(cond);
        const res: any = mockResponse();

        await getContents(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith([
            { id: 3, title: "YouTube:Tokyo Olympic", url: "https://www.youtube.com/embed/sk6uU8gb8PA?rel=0" },
            { id: 6, title: "View 1", url: "http://localhost:8000/view1" },
            { id: 1, title: "Google Map:Overview", url: "http://maps.google.co.jp/maps?&output=embed" },
            { id: 2, title: "Google Map:Nagoya Station", url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.4425090625195!2d136.88223540000004!3d35.170521900000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600376e794d78b89%3A0x81f7204bf8261663!2z5ZCN5Y-k5bGL6aeF!5e0!3m2!1sja!2sjp!4v1433317763525" },
            { id: 5, title: "Embeded View 2", url: "http://localhost:8000/embeded-view2" },
            { id: 4, title: "Embeded View 1", url: "http://localhost:8000/embeded-view1" },
            { id: 7, title: "Blank page", url: "http://localhost:8080/url1" }
        ]);
    });
});
