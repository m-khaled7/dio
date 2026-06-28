import { Module } from "@nestjs/common";
import { LoggerModule } from "./logger/logger.module.js";
import { DatabaseModule } from './database/database.module.js';
import { ConfigModule } from './config/config.module.js';

@Module({
    imports: [ConfigModule, LoggerModule, DatabaseModule],
})
export class coreModule {}
