import { promisify } from "util";

export interface ResultSetHandler {
    handle(rs: any): Promise<any>;
}

export class DefaultResultSetHandler implements ResultSetHandler {
    public async handle(resultSet: any): Promise<any> {
        return await promisify(resultSet.toObjArray).bind(resultSet)();
    }
}
