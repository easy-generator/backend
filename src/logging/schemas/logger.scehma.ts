// logger.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/users/schemas/users.schema';

export type LoggerDocument = Logger & Document;

@Schema({ timestamps: true })
export class Logger {
  @Prop({ required: true })
  action: string;

  @Prop({ type: Object })
  body?: any;

  @Prop()
  service?: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  userId?: Types.ObjectId;
}

export const LoggerSchema = SchemaFactory.createForClass(Logger);
