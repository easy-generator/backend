// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  providers: [],
  exports: [],
})
export class AuthModule {}
