import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Unit } from 'src/unit/schema/unit.schema';
import { Comment } from 'src/comments/schema/comment.schema';

export interface UserReference {
  _id: string;
  email: string;
  username: string;
}

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

  @Prop({
    type: {
      _id: String,
      email: String,
      username: String
    }
  })
  instructor: UserReference;

  @Prop({
    type: [{
      _id: String,
      email: String,
      username: String
    }]
  })
  enrolledStudents: UserReference[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Unit' }] })
  units: Unit[];

  @Prop({ type: [Number], default: [] })
  ratings: number[];

  @Prop({
    type: [{
      _id: String,
      email: String,
      username: String
    }]
  })
  ratedBy: UserReference[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);