import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export const USER_ROLE_VALUES = ['ADMIN', 'USER'] as const;
export type UserRoleValue = (typeof USER_ROLE_VALUES)[number];

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  name!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value
  )
  @IsEmail()
  email!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(USER_ROLE_VALUES)
  role?: UserRoleValue = 'USER';
}
