// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt-strategy.service';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    UsersModule,
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
