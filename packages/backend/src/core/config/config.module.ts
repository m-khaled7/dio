import { Module } from '@nestjs/common';
import { ConfigModule as _ConfigModule } from "@nestjs/config";
import globalConfig from './globalConfig.js';

@Module({
    imports: [
        _ConfigModule.forRoot({
            isGlobal: true,
            load: [globalConfig],
        }),
    ],
})
export class ConfigModule {}
