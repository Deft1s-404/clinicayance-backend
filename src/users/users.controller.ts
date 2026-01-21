import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type CurrentUserPayload = { userId: string };

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private async ensureAdmin(currentUser: CurrentUserPayload | undefined): Promise<User> {
    if (!currentUser?.userId) {
      throw new UnauthorizedException('Usuario nao autenticado.');
    }

    const user = await this.usersService.findById(currentUser.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado.');
    }

    if ((user.role ?? '').toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('Somente administradores podem gerenciar usuarios.');
    }

    return user;
  }

  @Get()
  async list(@CurrentUser() currentUser: CurrentUserPayload, @Query() query: PaginationQueryDto) {
    await this.ensureAdmin(currentUser);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      const searchTerm = query.search.trim();
      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }
    }

    const [users, total] = await Promise.all([
      this.usersService.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.usersService.count(where)
    ]);

    return {
      data: users.map((user) => this.sanitizeUser(user)),
      total,
      page,
      limit
    };
  }

  @Post()
  async create(@CurrentUser() currentUser: CurrentUserPayload, @Body() dto: CreateUserDto) {
    await this.ensureAdmin(currentUser);

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('E-mail ja cadastrado para outro usuario.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const normalizedRole = (dto.role ?? 'USER').toUpperCase();
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: normalizedRole
    });

    return this.sanitizeUser(user);
  }

  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto
  ) {
    await this.ensureAdmin(currentUser);

    const targetUser = await this.usersService.findById(id);
    if (!targetUser) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    if (dto.email) {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('E-mail informado ja esta em uso.');
      }
    }

    if (currentUser.userId === id && dto.role && dto.role.toUpperCase() !== 'ADMIN') {
      throw new BadRequestException('Nao e possivel remover seu proprio acesso de administrador.');
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.name) {
      data.name = dto.name;
    }
    if (dto.email) {
      data.email = dto.email;
    }
    if (dto.role) {
      data.role = dto.role.toUpperCase();
    }
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(data).length === 0) {
      return this.sanitizeUser(targetUser);
    }

    const updated = await this.usersService.update(id, data);
    return this.sanitizeUser(updated);
  }

  @Delete(':id')
  async remove(@CurrentUser() currentUser: CurrentUserPayload, @Param('id') id: string) {
    await this.ensureAdmin(currentUser);

    if (currentUser.userId === id) {
      throw new BadRequestException('Nao e possivel remover o proprio usuario.');
    }

    const targetUser = await this.usersService.findById(id);
    if (!targetUser) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    await this.usersService.delete(id);
    return { success: true };
  }
}
