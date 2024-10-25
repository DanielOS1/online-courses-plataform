import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateUnitDto {

    
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  @IsOptional()
  readonly content?: string;

  @IsOptional()
  readonly course?: Types.ObjectId;
}
