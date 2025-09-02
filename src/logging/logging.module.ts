import { Global, Logger, Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerSchema } from './schemas/logger.scehma';

@Global()
@Module({
  controllers: [],
  providers: [LoggingService],
  imports: [
    MongooseModule.forFeature([{ name: Logger.name, schema: LoggerSchema }]),
  ],
  exports: [LoggingService],
})
export class LoggingModule {}
