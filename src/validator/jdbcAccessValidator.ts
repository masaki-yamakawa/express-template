import { check, ValidationChain } from "express-validator";

export const jdbcSelectRequestValidator: ValidationChain[] = [
    check("sql").isString().isLength({ min: 1, max: 1000 }),
];
