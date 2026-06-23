import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "./repositories/user.repository.js";
import { RegisterDto } from "../auth/dto/auth.dto.js";
import * as bcrypt from "bcryptjs";
import { UserEntity } from "./entities/user.entity.js";
import { FindOptionsWhere } from "typeorm";
@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}

    async create(registerDto: RegisterDto): Promise<Omit<UserEntity, "password">> {
        const userExist = await this.userRepository.findOneBy({ email: registerDto.email });
        if (userExist) throw new ConflictException("Email already registered");
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = this.userRepository.create({
            email: registerDto.email,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            password: hashedPassword,
        });
        const { password, ...createUser } = await this.userRepository.save(user);
        return createUser;
    }

    async validateUser(email: string, password: string) {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        const { password: _, refreshToken: __, ...result } = user;
        return result;
    }

    async updateRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new NotFoundException("User not found");
        await this.userRepository.updateRefreshToken(userId, hashedToken);
    }

    async findUser(where: FindOptionsWhere<UserEntity>) {
        const user = await this.userRepository.findOneBy(where);
        if(!user) return null;
        const {password,...data} = user 
        return data
    }
}
