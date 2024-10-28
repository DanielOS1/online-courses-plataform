import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

/**
 * Controlador para manejar las operaciones relacionadas con calificaciones de cursos
 */
@ApiTags('Ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  /**
   * Crea una nueva calificacion
   * @param createRatingDto - Objeto con la informacion de la calificacion a crear
   * @returns La calificacion creada
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva calificacion' })
  @ApiResponse({ status: 201, description: 'Calificacion creada exitosamente' })
  async create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingService.create(createRatingDto);
  }

  /**
   * Obtiene todas las calificaciones
   * @returns Lista de todas las calificaciones
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las calificaciones' })
  @ApiResponse({ status: 200, description: 'Lista de calificaciones obtenida exitosamente' })
  async findAll() {
    return this.ratingService.findAll();
  }

  /**
   * Obtiene las calificaciones de un curso especifico
   * @param courseId - ID del curso
   * @returns Lista de calificaciones del curso especificado
   */
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Obtener calificaciones de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Calificaciones del curso obtenidas exitosamente' })
  async findByCourse(@Param('courseId') courseId: string) {
    return this.ratingService.findByCourse(courseId);
  }

  /**
   * Obtiene una calificacion especifica por su ID
   * @param id - ID de la calificacion
   * @returns La calificacion encontrada
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una calificacion por ID' })
  @ApiParam({ name: 'id', description: 'ID de la calificacion' })
  @ApiResponse({ status: 200, description: 'Calificacion obtenida exitosamente' })
  async findOne(@Param('id') id: string) {
    return this.ratingService.findOne(id);
  }

  /**
   * Actualiza una calificacion especifica por su ID
   * @param id - ID de la calificacion
   * @param updateRatingDto - Objeto con los datos actualizados de la calificacion
   * @returns La calificacion actualizada
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una calificacion' })
  @ApiParam({ name: 'id', description: 'ID de la calificacion' })
  @ApiBody({ type: UpdateRatingDto })
  @ApiResponse({ status: 200, description: 'Calificacion actualizada exitosamente' })
  async update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingService.update(id, updateRatingDto);
  }

  /**
   * Elimina una calificacion especifica por su ID
   * @param id - ID de la calificacion a eliminar
   * @param userId - ID del usuario que elimina la calificacion
   * @returns Mensaje de confirmacion de eliminacion
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una calificacion' })
  @ApiParam({ name: 'id', description: 'ID de la calificacion' })
  @ApiBody({ schema: { example: { userId: 'user123' } } })
  @ApiResponse({ status: 200, description: 'Calificacion eliminada exitosamente' })
  async remove(@Param('id') id: string, @Body('userId') userId: string) {
    return this.ratingService.remove(id, userId);
  }
}
