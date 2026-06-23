import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { ConfigService } from '@nestjs/config';
import { compareHash } from '../../common/utils/hash.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private usersService: UsersService,configService:ConfigService) {
    super({
        jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
        ignoreExpiration: false,
        secretOrKey: configService.get("auth.jwtRefreshSecret"),
        passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const user = await this.usersService.findUser({ id: payload.sub });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied — please log in again');
    }

    if (!compareHash(refreshToken,user.refreshToken)) {
      throw new UnauthorizedException('Refresh token invalid or revoked');
    }

    return { id: user.id, email: user.email };
  }
}
