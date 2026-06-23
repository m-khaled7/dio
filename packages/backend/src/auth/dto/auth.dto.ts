import { IsEmail, IsString, MinLength, IsNotEmpty, Matches } from "class-validator";
import { Transform } from "class-transformer";
import { NoXss } from "../../common/decorators/no-xss.decorator.js";
import { ApiProperty, PickType } from "@nestjs/swagger";

export class RegisterDto {
    @ApiProperty()
    @IsEmail()
    @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @NoXss()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @NoXss()
    lastName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: "Password must be at least 8 characters long." })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    })
    password: string;
}

export class LoginDto extends PickType(RegisterDto,['email','password']){}
