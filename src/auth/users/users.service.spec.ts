import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { User, UserDocument } from './schemas/users.schema';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock nodemailer
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  // Mock data
  const mockUser: Partial<UserDocument> = {
    id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123@',
  };

  const mockSignupDto: SignupDto = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123@',
  };

  const mockSerializedUser = {
    id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(async () => {
    // Create mock implementations
    const mockUsersRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);

    // Setup default mock implementations
    mockedBcrypt.hash.mockResolvedValue('hashedPassword123@' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    jwtService.signAsync.mockResolvedValue('mock.jwt.token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a serialized user when user exists', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      usersRepository.findById.mockResolvedValue(mockUser as UserDocument);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockSerializedUser);
    });

    it('should call repository with correct id', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      usersRepository.findById.mockResolvedValue(mockUser as UserDocument);

      // Act
      await service.findById(userId);

      // Assert
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findAll', () => {
    it('should return an array of serialized users', async () => {
      // Arrange
      const mockUsers = [
        mockUser,
        {
          ...mockUser,
          id: '507f1f77bcf86cd799439012',
          email: 'jane.doe@example.com',
        },
      ] as UserDocument[];
      usersRepository.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(usersRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockSerializedUser);
      expect(result[1].email).toBe('jane.doe@example.com');
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      usersRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(mockUser as UserDocument);

      // Act
      const result = await service.signup(mockSignupDto);

      // Assert
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        mockSignupDto.email,
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockSignupDto.password,
        10,
      );
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...mockSignupDto,
        password: 'hashedPassword123@',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(mockUser as UserDocument);

      // Act & Assert
      await expect(service.signup(mockSignupDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signup(mockSignupDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should hash password before creating user', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(mockUser as UserDocument);

      // Act
      await service.signup(mockSignupDto);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockSignupDto.password,
        10,
      );
    });

    it('should send welcome email when email credentials are configured', async () => {
      // Arrange
      process.env.EMAIL_USER = 'test@example.com';
      process.env.EMAIL_PASS = 'testpass';
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(mockUser as UserDocument);

      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true),
      };
      mockedNodemailer.createTransport.mockReturnValue(mockTransporter as any);

      // Act
      await service.signup(mockSignupDto);

      // Assert
      expect(mockedNodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'test@example.com',
          pass: 'testpass',
        },
      });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: mockSignupDto.email,
        subject: 'Welcome to Our App!',
        text: 'Thanks for signing up! We are excited to have you with us.',
      });

      // Cleanup
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;
    });

    it('should not send welcome email when email credentials are not configured', async () => {
      // Arrange
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(mockUser as UserDocument);

      // Act
      await service.signup(mockSignupDto);

      // Assert
      expect(mockedNodemailer.createTransport).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return user and token when credentials are valid', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(mockUser as UserDocument);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await service.login(
        mockSignupDto.email,
        mockSignupDto.password,
      );

      // Assert
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        mockSignupDto.email,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockSignupDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      expect(result).toEqual({
        user: mockSerializedUser,
        token: 'mock.jwt.token',
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login('nonexistent@example.com', 'password'),
      ).rejects.toThrow('Invalid email or password');
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(mockUser as UserDocument);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(
        service.login(mockSignupDto.email, 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(mockSignupDto.email, 'wrongpassword'),
      ).rejects.toThrow('Invalid email or password');
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should call bcrypt.compare with correct parameters', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(mockUser as UserDocument);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act
      await service.login(mockSignupDto.email, mockSignupDto.password);

      // Assert
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockSignupDto.password,
        mockUser.password,
      );
    });
  });

  describe('serializeUser', () => {
    it('should return serialized user object', () => {
      // Arrange
      const userDocument = mockUser as UserDocument;

      // Act
      const result = service.serializeUser(userDocument);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should handle different user data', () => {
      // Arrange
      const differentUser = {
        id: '507f1f77bcf86cd799439013',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'hashedPassword456@',
      } as UserDocument;

      // Act
      const result = service.serializeUser(differentUser);

      // Assert
      expect(result).toEqual({
        id: '507f1f77bcf86cd799439013',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send email successfully', async () => {
      // Arrange
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true),
      };
      mockedNodemailer.createTransport.mockReturnValue(mockTransporter as any);

      // Act
      await service.sendWelcomeEmail('test@example.com');

      // Assert
      expect(mockedNodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: 'test@example.com',
        subject: 'Welcome to Our App!',
        text: 'Thanks for signing up! We are excited to have you with us.',
      });
    });

    it('should handle email sending errors gracefully', async () => {
      // Arrange
      const mockTransporter = {
        sendMail: jest.fn().mockRejectedValue(new Error('SMTP error')),
      };
      mockedNodemailer.createTransport.mockReturnValue(mockTransporter as any);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await service.sendWelcomeEmail('test@example.com');

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending welcome email:',
        expect.any(Error),
      );

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle repository errors in findById', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      usersRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findById('invalid-id')).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle repository errors in findAll', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      usersRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle repository errors in signup', async () => {
      // Arrange
      usersRepository.findByEmail.mockResolvedValue(null);
      const error = new Error('Database connection failed');
      usersRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.signup(mockSignupDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle repository errors in login', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      usersRepository.findByEmail.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.login('test@example.com', 'password'),
      ).rejects.toThrow('Database connection failed');
    });
  });
});
