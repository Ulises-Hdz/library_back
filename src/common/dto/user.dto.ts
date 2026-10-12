import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';
import { UserStatus } from 'src/models/user.model';

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class LoginUserDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
