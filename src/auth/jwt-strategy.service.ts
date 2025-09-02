import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from './users/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private usersRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: String(process.env.JWT_SECRET),
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersRepository.findById(payload.userId);

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const result = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      return result;
    } catch (error) {
      throw error;
    }
  }
}
