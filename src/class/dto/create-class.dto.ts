import { IsString, IsNotEmpty, IsOptional, IsUrl, IsBoolean, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsUrl()
  @IsNotEmpty()
  readonly videoUrl: string;

  @IsNotEmpty()
  readonly duration: number; 


}
