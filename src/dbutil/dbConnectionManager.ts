import * as config from "config";
import * as JDBC from "jdbc";
import * as jinst from "jdbc/lib/jinst";
import { inspect, promisify } from "util";

import { Logger } from "../logger/logger";

import { ConnectionWrapper } from "./connectionWrapper";

export class DBConnectionManager {
    public static getInstance(): DBConnectionManager {
        if (!this.instance) {
            this.instance = new DBConnectionManager();
        }
        return this.instance;
    }
    private static instance: DBConnectionManager;

    private databases: { [key: string]: any; } = {};

    private constructor() {
        if (!jinst.isJvmCreated()) {
            jinst.addOption("-Xrs");
            const cp: string[] = config.get<string[]>("jdbcConfig.javaclasspath");
            Logger.getLogger().info(`Java class path=${cp}`);
            jinst.setupClasspath(cp);
        }
    }

    public async initialize(dbConfig: any, connName: string = "default"): Promise<void> {
        if (this.isInitialized(connName)) {
            Logger.getLogger().warn(`DBConnectionManager already initialized. ConnName=${connName}`);
            return;
        }

        const jdbc = new JDBC(dbConfig);
        try {
            await promisify(jdbc.initialize).bind(jdbc)();
        } catch (err) {
            throw new Error(`JDBC initialize failed. ConnName=${connName}:${err}`);
        }
        Logger.getLogger().info(`JDBC initialized. ConnName=${connName}, Connection=${inspect(dbConfig)}`);
        this.databases[connName] = jdbc;
    }

    public isInitialized(connName: string = "default"): boolean {
        if (this.databases[connName]) {
            return true;
        }
        return false;
    }

    public async getConnectionStatus(connName: string = "default"): Promise<any> {
        if (!this.isInitialized(connName)) {
            throw new Error(`DBConnectionManager not initialized. ConnName=${connName}`);
        }
        return await promisify(this.databases[connName].status).bind(this.databases[connName])();
    }

    public async getConnection(connName: string = "default", autoCommit: boolean = false): Promise<ConnectionWrapper> {
        if (!this.isInitialized(connName)) {
            throw new Error(`DBConnectionManager not initialized. ConnName=${connName}`);
        }
        const connection = await promisify(this.databases[connName].reserve).bind(this.databases[connName])();
        const connWrapper: ConnectionWrapper = new ConnectionWrapper(connection);
        connWrapper.setAutoCommit(autoCommit);
        Logger.getLogger().info(`Using connection=${connWrapper.getUuid()}, autoCommit=${autoCommit}`);
        return connWrapper;
    }

    public async releaseConnection(connection: ConnectionWrapper, connName: string = "default"): Promise<void> {
        if (!this.isInitialized(connName)) {
            throw new Error(`DBConnectionManager not initialized. ConnName=${connName}`);
        }
        if (connection) {
            const uuid = connection.getUuid();
            const autoCommit = connection.getAutoCommit();
            await promisify(this.databases[connName].release).bind(this.databases[connName])(connection.getConnection());
            Logger.getLogger().info(`Release connection=${uuid}, autoCommit=${autoCommit}`);
        }
    }

    public async destroy(connName: string = "default"): Promise<void> {
        if (!this.isInitialized(connName)) {
            throw new Error(`DBConnectionManager not initialized. ConnName=${connName}`);
        }
        await promisify(this.databases[connName].purge).bind(this.databases[connName])();
    }
}
