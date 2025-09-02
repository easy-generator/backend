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
import { LoggingService } from 'src/logging/logging.service';
import { Services } from 'src/logging/enums/services.enums';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly loggingService: LoggingService,
  ) {}

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
    await this.loggingService.createLog('User signup', {
      body: signupDto,
      service: Services.USERS,
    });
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
    await this.loggingService.createLog('User login', {
      body: signinDto,
      service: Services.USERS,
    });
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
  async findAll(@Req() req: Request): Promise<UserResponseDto[]> {
    await this.loggingService.createLog('User find all', {
      service: Services.USERS,
      userId: req.user?.['id'],
    });
    const users = await this.usersService.findAll();
    return users;
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getMe(@Req() req: Request) {
    await this.loggingService.createLog('User get me', {
      service: Services.USERS,
      userId: req.user?.['id'],
    });
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
  async findById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    await this.loggingService.createLog('User get by id', {
      service: Services.USERS,
      body: { id },
      userId: req.user?.['id'],
    });
    const user = await this.usersService.findById(id);
    return user;
  }
}
