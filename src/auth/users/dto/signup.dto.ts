import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';
import { IsStrongPassword } from 'src/utils/strong-password.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @MinLength(3)
  @IsString()
  name: string;

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
    description: 'User password (must be strong)',
    example: 'StrongP@ssw0rd123',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;
}
