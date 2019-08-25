import { decrypt, encrypt } from "../../src/dbutil/crypto";

describe("crypto", () => {
    it("encrypt function:should return encrypted value", async () => {
        const encrypted = await encrypt("BananaAndApple");
        expect(encrypted).toBe("5d50efab3ecf234a59d15bcbcd8a");
    });

    it("decrypt function:should return decrypted value", async () => {
        const decrypted = await decrypt("5d50efab3ecf234a59d15bcbcd8a");
        expect(decrypted).toBe("BananaAndApple");
    });
});
