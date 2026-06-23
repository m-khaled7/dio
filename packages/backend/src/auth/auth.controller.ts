import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { LocalAuthGuard, JwtRefreshGuard, JwtAuthGuard } from '../common/guards/auth.guards.js';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @ApiBody({ type: LoginDto })
    @UseGuards(LocalAuthGuard)
    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@GetUser() user: { id: string; email: string }) {
        return this.authService.login(user.id, user.email);
    }
    
    @ApiBody({
       schema:{
        type:'object',
        properties:{
            refreshToken:{type:"string"}
        },
        required:["refreshToken"]
       }
    })
    @UseGuards(JwtRefreshGuard)
    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    refresh(@GetUser() user: { id: string; email: string }) {
        return this.authService.refreshTokens(user.id, user.email);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    logout(@GetUser("id") userId: string) {
        return this.authService.logout(userId);
    }
}
