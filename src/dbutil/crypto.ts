import * as crypto from "crypto";

const secretKey = "ThisIsCrypto";

export function encrypt(text) {
    const cipher = crypto.createCipher("aes-256-ctr", secretKey);
    let crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
}

export function decrypt(text) {
    const decipher = crypto.createDecipher("aes-256-ctr", secretKey);
    let dec = decipher.update(text, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
}
