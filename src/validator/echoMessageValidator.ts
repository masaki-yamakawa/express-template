import { check, ValidationChain } from "express-validator/check";

export const echoRequestValidator: ValidationChain[] = [
    check("message").isString().isLength({ min: 1, max: 500 }),
];
