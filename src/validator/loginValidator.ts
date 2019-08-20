import { check, ValidationChain } from "express-validator/check";

export const loginRequestValidator: ValidationChain[] = [
    check("userId").isString().isLength({ min: 1, max: 20 }),
    check("password").isString().isLength({ min: 6, max: 12 }),
];
