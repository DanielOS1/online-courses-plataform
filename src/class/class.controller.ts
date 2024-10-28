import { Controller, Get, Post, Body, Param, Delete, Put, BadRequestException } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

/**
 * Controlador para gestionar todas las operaciones relacionadas con clases
 */
@ApiTags('Classes')
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  /**
   * Crea una nueva clase
   * @param createClassDto - Objeto con la información de la clase a crear
   * @returns La clase creada
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva clase' })
  @ApiResponse({ status: 201, description: 'Clase creada exitosamente' })
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  /**
   * Obtiene todas las clases
   * @returns Lista de todas las clases
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las clases' })
  @ApiResponse({ status: 200, description: 'Lista de clases obtenida exitosamente' })
  async findAll() {
    return this.classService.findAll();
  }

  /**
   * Obtiene una clase específica por su ID
   * @param id - ID de la clase
   * @returns La clase encontrada
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener clase por ID' })
  @ApiParam({ name: 'id', description: 'ID de la clase' })
  @ApiResponse({ status: 200, description: 'Clase encontrada exitosamente' })
  async findOne(@Param('id') id: string) {
    return this.classService.findOneById(id);
  }

  /**
   * Actualiza una clase específica por su ID
   * @param id - ID de la clase
   * @param updateClassDto - Objeto con los datos actualizados de la clase
   * @returns La clase actualizada
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar clase' })
  @ApiParam({ name: 'id', description: 'ID de la clase' })
  @ApiResponse({ status: 200, description: 'Clase actualizada exitosamente' })
  async update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(id, updateClassDto);
  }

  /**
   * Elimina una clase específica por su ID
   * @param id - ID de la clase a eliminar
   * @returns Mensaje de confirmación de la eliminación
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar clase' })
  @ApiParam({ name: 'id', description: 'ID de la clase' })
  @ApiResponse({ status: 200, description: 'Clase eliminada exitosamente' })
  async remove(@Param('id') id: string) {
    return this.classService.remove(id);
  }

  /**
   * Obtiene todas las clases asociadas a una unidad específica
   * @param unitId - ID de la unidad
   * @returns Lista de clases de la unidad especificada
   */
  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Obtener clases por unidad' })
  @ApiParam({ name: 'unitId', description: 'ID de la unidad' })
  @ApiResponse({ status: 200, description: 'Lista de clases de la unidad obtenida exitosamente' })
  async findByUnit(@Param('unitId') unitId: string) {
    return this.classService.findByUnit(unitId);
  }

  /**
   * Obtiene todas las clases impartidas por un instructor específico
   * @param instructorId - ID del instructor
   * @returns Lista de clases del instructor especificado
   */
  @Get('instructor/:instructorId')
  @ApiOperation({ summary: 'Obtener clases por instructor' })
  @ApiParam({ name: 'instructorId', description: 'ID del instructor' })
  @ApiResponse({ status: 200, description: 'Lista de clases del instructor obtenida exitosamente' })
  async findByInstructor(@Param('instructorId') instructorId: string) {
    return this.classService.findByInstructor(instructorId);
  }

  /**
   * Actualiza el estado de publicación de una clase
   * @param id - ID de la clase
   * @param isPublished - Estado de publicación (true o false)
   * @returns Clase con estado de publicación actualizado
   */
  @Put(':id/publish')
  @ApiOperation({ summary: 'Actualizar estado de publicación de una clase' })
  @ApiParam({ name: 'id', description: 'ID de la clase' })
  @ApiBody({ schema: { example: { isPublished: true } } })
  @ApiResponse({ status: 200, description: 'Estado de publicación actualizado exitosamente' })
  async updatePublishStatus(@Param('id') id: string, @Body('isPublished') isPublished: boolean) {
    return this.classService.updatePublishStatus(id, isPublished);
  }

  /**
   * Agrega material adicional a una clase
   * @param id - ID de la clase
   * @param materialUrl - URL del material adicional
   * @returns Clase con material adicional agregado
   */
  @Put(':id/add-material')
  @ApiOperation({ summary: 'Agregar material adicional a una clase' })
  @ApiParam({ name: 'id', description: 'ID de la clase' })
  @ApiBody({ schema: { example: { materialUrl: 'https://example.com/material' } } })
  @ApiResponse({ status: 200, description: 'Material adicional agregado exitosamente' })
  async addAdditionalMaterial(@Param('id') id: string, @Body('materialUrl') materialUrl: string) {
    return this.classService.addAdditionalMaterial(id, materialUrl);
  }

  /**
   * Elimina material adicional de una clase
   * @param id - ID de la clase
   * @param materialUrl - URL del material adicional a eliminar
   * @returns Clase con material adicional eliminado
   */
  @Put(':id/remove-material')
  @ApiOperation({ summary: 'Eliminar material adicional de una clase' })
  @ApiParam({ name: 'id', description: 'ID de la clase' })
  @ApiBody({ schema: { example: { materialUrl: 'https://example.com/material' } } })
  @ApiResponse({ status: 200, description: 'Material adicional eliminado exitosamente' })
  async removeAdditionalMaterial(@Param('id') id: string, @Body('materialUrl') materialUrl: string) {
    return this.classService.removeAdditionalMaterial(id, materialUrl);
  }

  /**
   * Cuenta el número de clases asociadas a una unidad específica
   * @param unitId - ID de la unidad
   * @returns Número de clases en la unidad especificada
   */
  @Get('unit/:unitId/count')
  @ApiOperation({ summary: 'Contar clases por unidad' })
  @ApiParam({ name: 'unitId', description: 'ID de la unidad' })
  @ApiResponse({ status: 200, description: 'Cantidad de clases obtenida exitosamente' })
  async countClassesByUnit(@Param('unitId') unitId: string) {
    return this.classService.countClassesByUnit(unitId);
  }
}
