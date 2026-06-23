import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("database.host"),
                port: +configService.get("database.port"),
                username: configService.get("database.username"),
                password: configService.get("database.password"),
                database: configService.get("database.database"),
                autoLoadEntities: true,
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
