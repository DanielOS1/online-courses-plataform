import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Course } from 'src/course/schema/course.schema';

export type UnitDocument = Unit & Document;

@Schema()
export class Unit {

  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;
  
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false})
  content: string;

  @Prop({ required: false })
  duration: number; 

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course: Types.ObjectId | Course; // Permitimos ambos tipos

  @Prop({required: true})
  order: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: [Types.ObjectId], ref: 'Class', default: [] })
  classes: Types.ObjectId[]; 

}

export const UnitSchema = SchemaFactory.createForClass(Unit);
