import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
  @ApiProperty({ description: 'Título del comentario' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Contenido del comentario' })
  @IsNotEmpty()
  @IsString()
  content: string;
}