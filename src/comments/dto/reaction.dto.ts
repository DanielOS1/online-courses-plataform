import { IsNotEmpty, IsMongoId, IsEnum } from 'class-validator';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike'
}

export class ReactionDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsEnum(ReactionType)
  type: ReactionType;
}