import { check, ValidationChain } from "express-validator";

export const echoRequestValidator: ValidationChain[] = [
    check("message").isString().isLength({ min: 1, max: 500 }),
];
