import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()  
   username?: string;

  @IsEmail()
  @IsOptional()  
   email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional() 
   password?: string;
}
