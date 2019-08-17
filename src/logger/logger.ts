import { createLogger } from "bunyan";
import * as bunyan from "bunyan";
import * as bunyanFormat from "bunyan-format";
import * as config from "config";

export class Logger {
    public static getLogger(loggerName: string = "app"): bunyan {
        let logger: Logger = this.loggers[loggerName];
        if (!logger) {
            logger = new Logger(loggerName);
            this.loggers[loggerName] = logger;
        }
        return logger.instance;
    }
    private static loggers: { [key: string]: any; } = {};

    private instance: bunyan;

    private constructor(loggerName: string) {
        const consoleLogConfig: any = config.get("logConfig.console");

        const newLogger: bunyan = createLogger({
            name: loggerName,
            streams: [
                {
                    level: consoleLogConfig.level,
                    stream: bunyanFormat({ outputMode: "long" }),
                },
            ],
        });
        if (config.has("logConfig.file")) {
            const fileLogConfig: any = config.get("logConfig.file");
            newLogger.addStream({
                level: fileLogConfig.level,
                type: "rotating-file",
                path: fileLogConfig.fileName,
                period: "1d",
                count: fileLogConfig.keepCount,
            });
        }
        this.instance = newLogger;
    }
}
