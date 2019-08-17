import { postLogs } from "../../src/controller/logController";
import { Logger } from "../../src/logger/logger";
import { LogRequest } from "../../src/protocol/logProtocol";
import { mockPostRequest as mockRequest, mockResponse } from "../mockRequestResponse";

describe("postLogs", () => {
    let spyLog;
    beforeEach(() => {
        spyLog = jest.spyOn(Logger.getLogger(), "info");
        spyLog.mockImplementation((x) => x);
    });
    afterEach(() => {
        spyLog.mockReset();
        spyLog.mockRestore();
    });

    it("should return empty object and call log function for array length times:array lenght=3", async () => {
        const logs: LogRequest[] = [
            {
                count: 1,
                level: 40,
                levelName: "info",
                msg: "info message",
                name: "app",
                time: "2019/08/13 12:33:45.112",
                url: "http://localhost:3333/app/",
                userAgent: "IE",
                v: 1,
            },
            {
                count: 2,
                level: 50,
                levelName: "debug",
                msg: "debug message",
                name: "default",
                time: "2019/08/13 14:21:12.345",
                url: "http://localhost:3456/app/",
                userAgent: "Chrome",
                v: 2,
            },
            {
                count: 3,
                level: 66,
                levelName: "error",
                msg: "error message",
                name: "webhook",
                time: "2019/08/13 15:01:59.652",
                url: "http://localhost:1234/app/",
                userAgent: "FireFox",
                v: 3,
            },
        ];
        const req: any = mockRequest(logs);
        const res: any = mockResponse();

        await postLogs(req, res, () => { });
        expect(Logger.getLogger().info).toBeCalledTimes(3);
        expect(spyLog.mock.calls[0][0]).toBe("2019/08/13 12:33:45.112 [info][app] info message");
        expect(spyLog.mock.calls[1][0]).toBe("2019/08/13 14:21:12.345 [debug][default] debug message");
        expect(spyLog.mock.calls[2][0]).toBe("2019/08/13 15:01:59.652 [error][webhook] error message");
        expect(res.json).toHaveBeenCalledWith({});
    });

    it("should return empty object and call log function for array length times:array lenght=1", async () => {
        const logs: LogRequest[] = [
            {
                count: 1,
                level: 40,
                levelName: "info",
                msg: "info message",
                name: "app",
                time: "2019/08/13 12:33:45.112",
                url: "http://localhost:3333/app/",
                userAgent: "IE",
                v: 1,
            },
        ];
        const req: any = mockRequest(logs);
        const res: any = mockResponse();

        await postLogs(req, res, () => { });
        expect(Logger.getLogger().info).toBeCalledTimes(1);
        expect(spyLog.mock.calls[0][0]).toBe("2019/08/13 12:33:45.112 [info][app] info message");
        expect(res.json).toHaveBeenCalledWith({});
    });

    it("should return empty object and call log function for array length times:empty array", async () => {
        const logs: LogRequest[] = [];
        const req: any = mockRequest(logs);
        const res: any = mockResponse();

        await postLogs(req, res, () => { });
        expect(Logger.getLogger().info).toBeCalledTimes(0);
        expect(res.json).toHaveBeenCalledWith({});
    });
});
