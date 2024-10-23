import { IsString, IsUrl, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsUrl()
  @IsOptional()
  readonly image?: string;

  @IsOptional()
  readonly instructor?: Types.ObjectId;

  @IsOptional()
  readonly enrolledStudents?: Types.ObjectId[]; // IDs de los estudiantes inscritos
}
