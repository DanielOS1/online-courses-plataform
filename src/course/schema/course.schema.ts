import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { Unit } from 'src/unit/schema/unit.schema';

export type CourseDocument = Course & Document;

@Schema()
export class Course {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ })
  image: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  instructor: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  enrolledStudents: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Unit' }] }) // Unidades del curso
  units: Unit[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
