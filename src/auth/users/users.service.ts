import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User, UserDocument } from './schemas/users.schema';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async findById(
    id: string,
  ): Promise<{ id: string; name: string; email: string }> {
    let user = await this.usersRepository.findById(id);
    let serializedUser = this.serializeUser(user);
    return serializedUser;
  }

  async findAll(): Promise<{ id: string; name: string; email: string }[]> {
    let users = await this.usersRepository.findAll();
    let serializedUsers = users.map(this.serializeUser);
    return serializedUsers;
  }

  async sendWelcomeEmail(email: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our App!',
      text: 'Thanks for signing up! We are excited to have you with us.',
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async signup(user: SignupDto): Promise<UserDocument> {
    let emailAlreadyExists = await this.usersRepository.findByEmail(user.email);

    if (emailAlreadyExists) {
      throw new ConflictException('Email already exists');
    }

    user.password = await bcrypt.hash(user.password, 10);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await this.sendWelcomeEmail(user.email);
    }
    return await this.usersRepository.create(user);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    user: { id: string; name: string; email: string };
    token: string;
  }> {
    let user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    let passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      token: await this.jwtService.signAsync({ userId: user.id }),
      user: this.serializeUser(user),
    };
  }

  serializeUser(user: UserDocument): {
    id: string;
    name: string;
    email: string;
  } {
    return {
      name: user.name,
      email: user.email,
      id: user.id,
    };
  }
}
