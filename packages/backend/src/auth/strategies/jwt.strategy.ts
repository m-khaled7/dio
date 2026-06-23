import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService, configService:ConfigService) {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get("auth.jwtAccessSecret"),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findUser({id:payload.sub});
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    // Return value is attached to req.user
    return { id: user.id, email: user.email };
  }
}
