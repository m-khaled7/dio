import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto, RefreshDto, RegisterDto } from "./dto/auth.dto.js";
import { UsersService } from "../users/users.service.js";
import { ConfigService } from "@nestjs/config";
import { JwtPayload, Tokens } from "./interfaces/jwt-payload.interface.js";
import { JwtService } from "@nestjs/jwt";
import { compareHash, hashData } from "../common/utils/hash.js";
import { Logger } from "../core/logger/logger.service.js";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private jwtService: JwtService,
        private readonly logger: Logger
    ) {}

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.create(registerDto);
        const tokens = await this.generateTokens(user.id, user.email);
        await this.storeHashedRefreshToken(user.id, tokens.refreshToken);
        return { user, tokens };
    }

    async login(loginDto: LoginDto): Promise<Tokens> {
        const user = await this.usersService.validateUser(loginDto.email, loginDto.password);
        if (!user) throw new UnauthorizedException("Invalid credentials");
        const tokens = await this.generateTokens(user.id, user.email);
        await this.storeHashedRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    //revoke refresh token
    async logout(userId: string): Promise<void> {
        await this.usersService.updateRefreshToken(userId, null);
    }

    async refreshTokens(refreshDto: RefreshDto): Promise<Tokens> {
        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync(refreshDto.refreshToken, {
                secret: this.configService.get("auth.jwtRefreshSecret"),
            });
        } catch {
            throw new UnauthorizedException("token invalid");
        }

        const user = await this.usersService.findUser({ id: payload.sub });
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException("Access denied — please log in again");
        }

        if (!compareHash(refreshDto.refreshToken, user.refreshToken)) {
            throw new UnauthorizedException("Refresh token invalid or revoked");
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.storeHashedRefreshToken(user.id, tokens.refreshToken);
        return tokens;
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
        const tokenHash = hashData(token);
        await this.usersService.updateRefreshToken(userId, tokenHash);
    }
}
