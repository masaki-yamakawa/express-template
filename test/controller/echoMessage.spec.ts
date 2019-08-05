import { echoMessage } from "../../src/controller/echoMessage";
import { mockGetRequest as mockRequest, mockResponse } from "../mockRequestResponse";

describe("echoMessage", () => {
    it("should return message with 'Reply:' keyword", async () => {
        const testMessage: string = "Hello world";
        const req: any = mockRequest({ message: `${testMessage}` });
        const res: any = mockResponse();

        await echoMessage(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith({ message: `Reply: ${testMessage}` });
    });

    it("should return empty message if request message is empty", async () => {
        const testMessage: string = "";
        const req: any = mockRequest({ message: `${testMessage}` });
        const res: any = mockResponse();

        await echoMessage(req, res, () => { });
        expect(res.json).toHaveBeenCalledWith({ message: `Reply: ${testMessage}` });
    });

    it("should 400 status and return error message if message is not sent", async () => {
        const testMessage: string = "Hello world";
        const req: any = mockRequest({ test: `${testMessage}` });
        const res: any = mockResponse();

        await echoMessage(req, res, () => { });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: `'message' is required. your request=${JSON.stringify(req)}` });
    });
});
