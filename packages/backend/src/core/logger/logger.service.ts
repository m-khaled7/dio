import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import callsites from "callsites";
import { basename } from "path";
import * as winston from "winston";
import lodash from "lodash";
@Injectable()
export class Logger implements LoggerService {
    private logger!: winston.Logger;
    private level: string;

    constructor(private readonly configService: ConfigService) {
        this.level = this.configService.get("logger.level") ?? "error";
        this.logger = winston.createLogger({ level: this.level });
        const outputs: string[] = this.configService.get("logger.outputs", []);
        if (outputs.includes("console")) this.setConsoleTransport();
    }

    private setConsoleTransport() {
        const format = this.getConsoleFormat();
        this.logger.add(new winston.transports.Console({ format }));
    }

    private getConsoleFormat() {
        const format = this.configService.get("logger.format");

        if (format === "json") {
            return this.jsonFormat();
        } else if (this.level === "debug") {
            return this.debugConsoleFormat();
        } else {
            return winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp}   ${level}   ${message}  `;
                })
            );
        }
    }

    private jsonFormat() {
        return winston.format.combine(
            winston.format.timestamp(),
            winston.format.metadata(),
            winston.format.json()
        );
    }

    private debugConsoleFormat() {
        return winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.metadata(),
            winston.format.timestamp({
                format: () =>
                    new Date().toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true, // Forces AM/PM notation
                    }),
            }),
            winston.format.printf(({ timestamp, level, message, metadata }) => {
                metadata = lodash.isPlainObject(metadata) ? JSON.stringify(metadata) : "";
                return [timestamp, level, message, metadata].join(" ".repeat(3));
            })
        );
    }

    private _log(level: string, message: string, optionalParams: any[]) {
        const location: { file?: string; function?: string } = {};
        const caller = callsites().at(2); // zeroth and first are this file, second is caller
        if (caller !== undefined) {
            location.file = basename(caller.getFileName() ?? "");
            const fnName = caller.getFunctionName();
            if (fnName) location.function = fnName;
        }
        const metadata = optionalParams.map((value) =>
            value instanceof Error ? this.serializeError(value) : value
        );

        this.logger.log(level, message, { ...location, metadata });
    }

    private serializeError(
        error: unknown,
        seen: Set<unknown> = new Set()
    ): { name: string; message: string; stack?: string; cause: unknown } | string {
        if (!(error instanceof Error)) return String(error);

        // prevent infinite recursion
        let cause: unknown;
        if (error.cause && !seen.has(error.cause)) {
            seen.add(error.cause);
            cause = this.serializeError(error.cause, seen);
        }

        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause,
        };
    }

    //nestjs use it for app logging
    log(message: string, ...optionalParams: any[]) {
        this._log("info", message, optionalParams);
    }

    error(message: string, ...optionalParams: any[]) {
        this._log("error", message, optionalParams);
    }

    info(message: string, ...optionalParams: any[]) {
        this._log("info", message, optionalParams);
    }

    warn(message: string, ...optionalParams: any[]) {
        this._log("warn", message, optionalParams);
    }

    debug(message: string, ...optionalParams: any[]) {
        this._log("debug", message, optionalParams);
    }
}
