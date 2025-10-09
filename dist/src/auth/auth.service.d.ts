import { JwtService } from '@nestjs/jwt';
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
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<AuthPayload>;
    login(dto: LoginDto): Promise<AuthPayload>;
    private buildAuthPayload;
}
