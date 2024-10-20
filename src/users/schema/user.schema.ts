import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Course } from 'src/course/schema/course.schema';
export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'student' })
  role: string;


  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }] })
  enrolledCourses: Course[];
}

export const UserSchema = SchemaFactory.createForClass(User);
