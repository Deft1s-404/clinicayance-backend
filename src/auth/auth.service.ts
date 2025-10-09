import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthPayload {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<AuthPayload> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('E-mail ja cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: dto.role ?? 'user'
    });

    return this.buildAuthPayload(user.id, user.name, user.email, user.role);
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    return this.buildAuthPayload(user.id, user.name, user.email, user.role);
  }

  private buildAuthPayload(id: string, name: string, email: string, role: string): AuthPayload {
    const accessToken = this.jwtService.sign(
      { sub: id, email },
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      user: {
        id,
        name,
        email,
        role
      }
    };
  }
}
