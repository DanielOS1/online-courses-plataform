import { Controller, Get, Post, Patch, Param, Delete, HttpCode, HttpStatus, ParseFloatPipe } from '@nestjs/common';
import { RatingService } from './rating.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RatingResponse, CourseRatingStats } from './interfaces/rating.interface';

/**
 * Controlador para manejar las operaciones relacionadas con calificaciones de cursos
 */
@ApiTags('Ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  /**
   * Obtiene todas las calificaciones
   * @returns Lista de todas las calificaciones
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las calificaciones' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de calificaciones obtenida exitosamente' })
  async findAll(): Promise<RatingResponse[]> {
    return this.ratingService.findAll();
  }

  /**
   * Obtiene las calificaciones de un curso específico
   * @param courseId - ID del curso
   * @returns Lista de calificaciones del curso especificado
   */
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Obtener calificaciones de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Calificaciones del curso obtenidas exitosamente' })
  async findByCourse(@Param('courseId') courseId: string): Promise<RatingResponse[]> {
    return this.ratingService.findByCourse(courseId);
  }

  /**
   * Obtiene las estadísticas de calificación de un curso
   * @param courseId - ID del curso
   * @returns Estadísticas de calificación del curso
   */
  @Get('course/:courseId/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de calificación de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Estadísticas obtenidas exitosamente' })
  async getCourseRatingStats(@Param('courseId') courseId: string): Promise<CourseRatingStats> {
    return this.ratingService.getCourseRatingStats(courseId);
  }

  /**
   * Crea una nueva calificación para un curso
   * @param courseId - ID del curso
   * @param userId - ID del usuario
   * @param rating - Puntuación dada por el usuario
   * @returns La calificación creada
   */
  @Post(':courseId/:userId/:rating')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva calificación' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiParam({ name: 'rating', description: 'Puntuación del curso entre 1 y 5' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Calificación creada exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'El usuario ya ha valorado este curso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Curso no encontrado' })
  async create(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
    @Param('rating', ParseFloatPipe) rating: number,
  ): Promise<RatingResponse> {
    return this.ratingService.create(courseId, userId, rating);
  }

  /**
   * Obtiene una calificación específica
   * @param userId - ID del usuario
   * @param courseId - ID del curso
   * @returns La calificación encontrada
   */
  @Get(':courseId/:userId')
  @ApiOperation({ summary: 'Obtener una calificación específica' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Calificación obtenida exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Valoración no encontrada' })
  async findOne(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<RatingResponse> {
    return this.ratingService.findOne(userId, courseId);
  }

  /**
   * Actualiza una calificación específica
   * @param courseId - ID del curso
   * @param userId - ID del usuario
   * @param rating - Nueva puntuación del usuario
   * @returns La calificación actualizada
   */
  @Patch(':courseId/:userId/:rating')
  @ApiOperation({ summary: 'Actualizar una calificación' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiParam({ name: 'rating', description: 'Nueva puntuación del curso entre 1 y 5' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Calificación actualizada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Valoración no encontrada' })
  async update(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
    @Param('rating', ParseFloatPipe) rating: number,
  ): Promise<RatingResponse> {
    return this.ratingService.update(courseId, userId, rating);
  }

  /**
   * Elimina una calificación específica
   * @param courseId - ID del curso
   * @param userId - ID del usuario
   */
  @Delete(':courseId/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una calificación' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Calificación eliminada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Valoración no encontrada' })
  async remove(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.ratingService.remove(courseId, userId);
  }
}
