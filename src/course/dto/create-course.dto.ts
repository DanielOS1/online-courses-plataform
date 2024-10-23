import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsUrl()
  @IsNotEmpty()
  @IsOptional()
  readonly image: string;

  @IsOptional()
  readonly instructor: Types.ObjectId;

  @IsOptional()
  readonly enrolledStudents?: Types.ObjectId[];
}
