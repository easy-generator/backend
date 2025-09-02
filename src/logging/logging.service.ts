import { Injectable } from '@nestjs/common';
import { Logger, LoggerDocument } from './schemas/logger.scehma';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LoggingService {
  constructor(
    @InjectModel(Logger.name) private loggerModel: Model<LoggerDocument>,
  ) {}

  async createLog(
    action: string,
    options?: {
      body?: any;
      service?: string;
      userId?: string;
    },
  ) {
    const log = new this.loggerModel({
      action,
      body: options?.body,
      service: options?.service,
      userId: options?.userId,
    });

    return log.save();
  }
}
