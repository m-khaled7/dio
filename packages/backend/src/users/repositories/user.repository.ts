import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity.js";
import { FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {}

    async findOneBy(where:FindOptionsWhere<UserEntity>){
        return await this.userRepository.findOneBy(where)
    }
    

    create(user: Partial<UserEntity>) {
        return this.userRepository.create(user);
    }

    async save(user: UserEntity) {
        return await this.userRepository.save(user);
    }

    async updateRefreshToken(userId:string,hashedToken:string|null){
        await this.userRepository.update(userId,{refreshToken:hashedToken})
    }
}