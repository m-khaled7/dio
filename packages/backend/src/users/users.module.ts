import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService,UserRepository],
  exports:[UsersService]
})
export class UsersModule {}
