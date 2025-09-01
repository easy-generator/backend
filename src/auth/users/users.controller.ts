import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UserResponseDto, LoginResponseDto } from './dto/user-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Create a new user account',
    description: 'Register a new user with name, email, and password',
  })
  @ApiBody({
    type: SignupDto,
    description: 'User registration data',
  })
  async signup(@Body() signupDto: SignupDto): Promise<UserResponseDto> {
    const user = await this.usersService.signup(signupDto);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  @Post('signin')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({
    type: SigninDto,
    description: 'User login credentials',
  })
  async signin(@Body() signinDto: SigninDto): Promise<LoginResponseDto> {
    return await this.usersService.login(signinDto.email, signinDto.password);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieve a list of all registered users (requires authentication)',
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users;
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getMe(@Req() req: Request) {
    console.log(req.user);
    return await this.usersService.findById(req.user?.['id']);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieve a specific user by their unique identifier (requires authentication)',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return user;
  }
}
