import { inspect, promisify } from "util";

import { ConnectionWrapper } from "./connectionWrapper";
import { DefaultResultSetHandler, ResultSetHandler } from "./resultSetHandler";

export class DBQueryRunner {
    private readonly connection: ConnectionWrapper;

    constructor(connection) {
        this.connection = connection;
    }

    public async query(
        sql: string,
        params: Map<string, any> = null,
        fetchSize: number | null = null,
        handler: ResultSetHandler = new DefaultResultSetHandler(),
    ): Promise<any> {

        const regexp = /(?<=\${).+?(?=})/g;
        const variables = sql.match(regexp);
        let preparedSql = sql;
        if (variables !== null) {
            for (const variable of variables) {
                preparedSql = preparedSql.replace(`\$\{${variable}\}`, "?");
            }
        }

        const statement = await promisify(this.connection.getConnection().conn.prepareStatement).bind(this.connection.getConnection().conn)(preparedSql);
        if (fetchSize) {
            await promisify(statement.setFetchSize).bind(statement)(fetchSize);
        }

        if (variables !== null) {
            let counter = 1;
            for (const variable of variables) {
                await this.setObject(statement, counter++, params.get(variable));
            }
        }

        console.log(`SQL=${preparedSql}, Params=${params === null ? null : JSON.stringify([...params])}, FetchSize=${fetchSize}`);

        const resultSet = await promisify(statement.executeQuery).bind(statement)();
        const results = await handler.handle(resultSet);
        console.log(`Count=${results.length}, Results=${inspect(results)}`);
        return results;
    }

    public async update(
        sql: string,
        params: Map<string, any> = null,
    ): Promise<number> {

        const regexp = /(?<=\${).+?(?=})/g;
        const variables = sql.match(regexp);
        let preparedSql = sql;
        if (variables !== null) {
            for (const variable of variables) {
                preparedSql = preparedSql.replace(`\$\{${variable}\}`, "?");
            }
        }

        const statement = await promisify(this.connection.getConnection().conn.prepareStatement).bind(this.connection.getConnection().conn)(preparedSql);

        if (variables !== null) {
            let counter = 1;
            for (const variable of variables) {
                await this.setObject(statement, counter++, params.get(variable));
            }
        }

        console.log(`SQL=${preparedSql}, Params=${params === null ? null : JSON.stringify([...params])}`);

        const result: number = await promisify(statement.executeUpdate).bind(statement)();
        console.log(`UpdateCount=${result}`);
        return result;
    }

    public async setObject(pStmt: any, index: number, value: any): Promise<void> {
        if (typeof value === "string") {
            promisify(pStmt.setString).bind(pStmt)(index, value);
        } else if (typeof value === "number" && Number.isInteger(value)) {
            promisify(pStmt.setLong).bind(pStmt)(index, value);
        } else if (typeof value === "number" && !Number.isInteger(value)) {
            promisify(pStmt.setDouble).bind(pStmt)(index, value);
        } else {
            throw new Error(`Unknown data type:index=${index}, value=${value}`);
        }
    }
}
