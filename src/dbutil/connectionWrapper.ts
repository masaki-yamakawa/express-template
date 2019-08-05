import { promisify } from "util";

export class ConnectionWrapper {
    private readonly connection;

    constructor(connection) {
        this.connection = connection;
    }

    public getConnection(): any {
        return this.connection;
    }

    public getUuid(): string {
        return this.connection.uuid;
    }

    public async commit(): Promise<void> {
        await promisify(this.connection.commit).bind(this.connection)();
    }

    public async rollback(): Promise<void> {
        await promisify(this.connection.rollback).bind(this.connection)();
    }

    public async setAutoCommit(autoCommit: boolean): Promise<void> {
        await promisify(this.connection.setAutoCommit).bind(this.connection)(autoCommit);
    }
}
