import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.usersRepository.create(data);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  findMany(params: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.usersRepository.findMany(params);
  }

  count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.usersRepository.count(where);
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.usersRepository.update(id, data);
  }

  delete(id: string): Promise<User> {
    return this.usersRepository.delete(id);
  }
}
