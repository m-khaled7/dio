import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/auth.dto.js';
import { UsersService } from '../users/users.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, Tokens } from './interfaces/jwt-payload.interface.js';
import { JwtService } from "@nestjs/jwt";
import { hashData } from '../common/utils/hash.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private jwtService: JwtService
    ) {}

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.create(registerDto);
        const tokens = await this.generateTokens(user.id, user.email);
        await this.storeHashedRefreshToken(user.id, tokens.refreshToken);
        return { user, tokens };
    }

    async login(userId: string, email: string): Promise<Tokens> {
        const tokens = await this.generateTokens(userId, email);
        await this.storeHashedRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }

    //revoke refresh token
    async logout(userId: string): Promise<void> {
        await this.usersService.updateRefreshToken(userId, null);
    }

    async refreshTokens(userId: string, email: string): Promise<Tokens> {
        // Guard already validated the refresh token — just issue new pair
        const tokens = await this.generateTokens(userId, email);
        await this.storeHashedRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }

    //used by passport local strategy
    async validateUser(email: string, password: string) {
       return await this.usersService.validateUser(email,password)
    }

    private async generateTokens(userId: string, email: string): Promise<Tokens> {
        const payload: JwtPayload = { sub: userId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get("auth.jwtAccessSecret"),
                expiresIn: this.configService.get("auth.jwtAccessExpires"),
            }),

            this.jwtService.signAsync(payload, {
                secret: this.configService.get("auth.jwtRefreshSecret"),
                expiresIn: this.configService.get("auth.jwtRefreshExpires"),
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async storeHashedRefreshToken(userId: string, token: string): Promise<void> {
        const tokenHash = hashData(token)
        await this.usersService.updateRefreshToken(userId, tokenHash);
    }
}
