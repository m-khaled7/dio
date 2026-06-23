import { Injectable, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";

@Injectable()
export class Logger implements LoggerService {
    private logger!: winston.Logger;
    private level!: string;
    constructor(private readonly configService: ConfigService) {
        this.level = this.configService.get("logger.level", "error");
        this.logger = winston.createLogger({
            level: this.level,
        });
        const outputs: string[] = this.configService.get("logger.outputs", []);
        if (outputs.includes("console")) {
            this.setConsoleTransport();
        }
    }

    private setConsoleTransport() {
        const format = this.getConsoleFormat();
        this.logger.add(new winston.transports.Console({ format }));
    }

    private getConsoleFormat() {
        return this.debugDevConsoleFormat();
    }

    private debugDevConsoleFormat() {
        return winston.format.combine(
            winston.format.timestamp({
                format: this.timestampFormat,
            }),
            this.color(),
            winston.format.errors({ stack: true }),
            winston.format.printf(({ timestamp, level, message, context, stack }) => {
                return stack
                    ? `[dio] ${process.pid}  - ${timestamp}     ${level.toUpperCase()} [${context}] ${stack}`
                    : `[dio] ${process.pid}  - ${timestamp}     ${level} [${context ?? "App"}] ${message}`;
            })
        );
    }

    private timestampFormat() {
        return new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true, // Forces AM/PM notation
        });
    }

    private color() {
        return this.configService.get("logger.colored")
            ? winston.format.colorize({ all: true })
            : winston.format.uncolorize();
    }

    //nestjs use it for app logging
    log(message: any, ...optionalParams: any[]) {
        this.logger.info(message, optionalParams);
    }

    error(message: string, metadata: object = {}) {
        this.logger.error(message, metadata);
    }

    info(message: string, metadata: object = {}) {
        this.logger.info(message, metadata);
    }

    warn(message: string, metadata: object = {}) {
        this.logger.warn(message, metadata);
    }

    debug(message: string, metadata: object = {}) {
        this.logger.debug(message, metadata);
    }
}
