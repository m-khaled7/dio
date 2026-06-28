import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import {  JwtAuthGuard } from '../common/guards/auth.guards.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto:LoginDto) {
        return  await this.authService.login(loginDto);
    }
    

    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    refresh(@Body() refreshDto:RefreshDto) {
        return this.authService.refreshTokens(refreshDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    logout(@GetUser("id") userId: string) {
        return this.authService.logout(userId);
    }
}
