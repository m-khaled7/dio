import { Module } from "@nestjs/common";
import { LoggerModule } from "./logger/logger.module.js";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from './database/database.module.js';
import globalConfig from "./config/globalConfig.js";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [globalConfig],
        }),
        LoggerModule,
        DatabaseModule,
    ],
})
export class coreModule {}
