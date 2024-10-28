import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query 
} from '@nestjs/common';
import { CommentService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReactionDto } from './dto/reaction.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

/**
 * Controlador para manejar las operaciones relacionadas con comentarios
 */
@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * Crea un nuevo comentario
   * @param createCommentDto - Objeto con la informacion del comentario a crear
   * @returns El comentario creado
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo comentario' })
  @ApiResponse({ status: 201, description: 'Comentario creado exitosamente' })
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  /**
   * Obtiene todos los comentarios
   * @returns Lista de todos los comentarios
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los comentarios' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios obtenida exitosamente' })
  async findAll() {
    return this.commentService.findAll();
  }

  /**
   * Obtiene los comentarios de un curso especifico
   * @param courseId - ID del curso
   * @param limit - Numero maximo de comentarios a obtener (opcional)
   * @returns Lista de comentarios del curso especificado
   */
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Obtener comentarios de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de comentarios' })
  @ApiResponse({ status: 200, description: 'Comentarios del curso obtenidos exitosamente' })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query('limit') limit?: number,
  ) {
    return this.commentService.findByCourse(courseId, limit);
  }

  /**
   * Obtiene los comentarios mas relevantes de un curso especifico
   * @param courseId - ID del curso
   * @param limit - Numero maximo de comentarios a obtener (opcional)
   * @returns Lista de los comentarios mas relevantes del curso
   */
  @Get('course/:courseId/top')
  @ApiOperation({ summary: 'Obtener los comentarios mas relevantes de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de comentarios' })
  @ApiResponse({ status: 200, description: 'Comentarios mas relevantes obtenidos exitosamente' })
  async getTopComments(
    @Param('courseId') courseId: string,
    @Query('limit') limit?: number,
  ) {
    return this.commentService.getTopComments(courseId, limit);
  }

  /**
   * Obtiene un comentario especifico por su ID
   * @param id - ID del comentario
   * @returns El comentario encontrado
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un comentario por ID' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario obtenido exitosamente' })
  async findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  /**
   * Actualiza un comentario especifico por su ID
   * @param id - ID del comentario
   * @param updateCommentDto - Objeto con los datos actualizados del comentario
   * @returns El comentario actualizado
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Comentario actualizado exitosamente' })
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(id, updateCommentDto);
  }

  /**
   * Elimina un comentario especifico por su ID
   * @param id - ID del comentario a eliminar
   * @param userId - ID del usuario que elimino el comentario
   * @returns Mensaje de confirmacion de eliminacion
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({ schema: { example: { userId: 'user123' } } })
  @ApiResponse({ status: 200, description: 'Comentario eliminado exitosamente' })
  async remove(@Param('id') id: string, @Body('userId') userId: string) {
    return this.commentService.remove(id, userId);
  }

  /**
   * Maneja una reaccion a un comentario
   * @param id - ID del comentario
   * @param reactionDto - Objeto con la informacion de la reaccion
   * @returns Comentario con reaccion actualizada
   */
  @Post(':id/reaction')
  @ApiOperation({ summary: 'Reaccionar a un comentario' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({ type: ReactionDto })
  @ApiResponse({ status: 200, description: 'Reaccion registrada exitosamente' })
  async handleReaction(
    @Param('id') id: string,
    @Body() reactionDto: ReactionDto,
  ) {
    return this.commentService.handleReaction(id, reactionDto);
  }
}
