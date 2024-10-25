import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class AssignInstructorDto {
  @IsNotEmpty()
  @IsString()
  instructorId: string;
}