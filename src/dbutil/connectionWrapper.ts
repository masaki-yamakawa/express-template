import { promisify } from "util";

import { Logger } from "../logger/logger";

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
        promisify(this.connection.conn.commit).bind(this.connection.conn)();
        Logger.getLogger().info(`Commit connection=${this.connection.uuid}`);
    }

    public async rollback(): Promise<void> {
        promisify(this.connection.conn.rollback).bind(this.connection.conn)();
        Logger.getLogger().info(`Rollback connection=${this.connection.uuid}`);
    }

    public async setAutoCommit(autoCommit: boolean): Promise<void> {
        promisify(this.connection.conn.setAutoCommit).bind(this.connection.conn)(autoCommit);
    }

    public async getAutoCommit(): Promise<boolean> {
        return promisify(this.connection.conn.getAutoCommit).bind(this.connection.conn)();
    }

    public async getWarnings(): Promise<any> {
        return promisify(this.connection.conn.getWarnings).bind(this.connection.conn)();
    }

    public async clearWarnings(): Promise<void> {
        promisify(this.connection.conn.clearWarnings).bind(this.connection.conn)();
    }
}
