import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

export class Course {

    @Prop({required: true, unique: true})
    name: string;

    @Prop({required: true})
    description: string;

    @Prop({required: true})
    image: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    instructor: User;

    
    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
    enrolledStudents: User[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);