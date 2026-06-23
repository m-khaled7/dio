import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from './strategies/local.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';
@Module({
    imports: [UsersModule, PassportModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService,LocalStrategy,JwtStrategy,JwtRefreshStrategy],
})
export class AuthModule {}
