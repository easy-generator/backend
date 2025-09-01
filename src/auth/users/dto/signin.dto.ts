import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';
import { IsStrongPassword } from 'src/utils/strong-password.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongP@ssw0rd123',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;
}
