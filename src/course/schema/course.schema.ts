import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { Unit } from 'src/unit/schema/unit.schema';
import { Comment } from 'src/comments/schema/comment.schema'; 

export type CourseDocument = Course & Document;

@Schema()
export class Course {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({})
  bannerImage: string;

  @Prop({})
  thumbnailImage: string;

  @Prop({ default: 0 })
  averageRating: number; 

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  instructor: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  enrolledStudents: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Unit' }] })
  units: Unit[];

  // Nuevo campo para almacenar valoraciones de los usuarios
  @Prop({ type: [Number], default: [] }) // Almacena las valoraciones como un array de números
  ratings: number[];

  // Nuevo campo para almacenar IDs de usuarios que ya han valorado el curso
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  ratedBy: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[]; 


  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
