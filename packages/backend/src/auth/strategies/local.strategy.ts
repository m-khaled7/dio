import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service.js";
import { LoginDto } from "../dto/auth.dto.js";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: "email" });
    }

    async validate(email: string, password: string) {
        const dto = plainToInstance(LoginDto, {
            email,
            password,
        });

        const errors = await validate(dto);

        if (errors.length > 0) {
            throw new BadRequestException(
                errors.map((error) => ({
                    field: error.property,
                    messages: Object.values(error.constraints ?? {}),
                }))
            );
        }

        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return user;
    }
}
