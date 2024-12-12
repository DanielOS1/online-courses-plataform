import { IsEnum } from 'class-validator';

export enum ReactionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE'
}

export class ReactionDto {
  @IsEnum(ReactionType)
  type: ReactionType;
}