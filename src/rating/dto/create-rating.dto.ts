import { IsNotEmpty, IsNumber, Min, Max, IsMongoId } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsMongoId()
  courseId: string;

  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
