import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Unit } from 'src/unit/schema/unit.schema';
import { User } from 'src/users/schema/user.schema';

export type ClassDocument = Class & Document;

@Schema()
export class Class {

  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;
  
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false })
  videoUrl: string;

  @Prop({ required: false })
  duration: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Unit', required: false })
  unit: Unit;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  instructor: User;

  @Prop({ type: [String], default: [] })
  additionalMaterial: string[]; 

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
