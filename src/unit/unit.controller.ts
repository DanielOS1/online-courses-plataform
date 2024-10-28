import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
/**
 * Controlador que maneja todas las operaciones relacionadas con unidades
 * @class UnitController
 */
@ApiTags('Units')
@Controller('units')
export class UnitController {
    constructor(private readonly unitService: UnitService) {}

    /**
     * Crea una nueva unidad en el sistema
     * @param {CreateUnitDto} createUnitDto - Datos de la unidad a crear
     */
    @Post()
    @ApiOperation({ summary: 'Crear nueva unidad' })
    @ApiResponse({ status: 201, description: 'Unidad creada exitosamente' })
    create(@Body() createUnitDto: CreateUnitDto) {
        return this.unitService.create(createUnitDto);
    }

    /**
     * Obtiene todas las unidades disponibles
     * @returns {Promise<Unit[]>} Lista de unidades
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todas las unidades' })
    @ApiResponse({ status: 200, description: 'Lista de unidades obtenida exitosamente' })
    findAll() {
        return this.unitService.findAll();
    }

    /**
     * Obtiene una unidad específica por su ID
     * @param {string} id - ID de la unidad
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener unidad por ID' })
    @ApiParam({ name: 'id', description: 'ID de la unidad' })
    @ApiResponse({ status: 200, description: 'Unidad encontrada' })
    findOne(@Param('id') id: string) {
        return this.unitService.findOne(id);
    }

    /**
     * Actualiza la información de una unidad
     * @param {string} id - ID de la unidad
     * @param {UpdateUnitDto} updateUnitDto - Datos a actualizar de la unidad
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar unidad' })
    @ApiParam({ name: 'id', description: 'ID de la unidad' })
    @ApiResponse({ status: 200, description: 'Unidad actualizada exitosamente' })
    update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
        return this.unitService.update(id, updateUnitDto);
    }

    /**
     * Elimina una unidad del sistema
     * @param {string} id - ID de la unidad a eliminar
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar unidad' })
    @ApiParam({ name: 'id', description: 'ID de la unidad' })
    @ApiResponse({ status: 200, description: 'Unidad eliminada exitosamente' })
    remove(@Param('id') id: string) {
        return this.unitService.remove(id);
    }

    /**
     * Agrega una clase a una unidad existente
     * @param {string} unitId - ID de la unidad
     * @param {string} classId - ID de la clase a agregar
     */
    @Post(':unitId/classes/:classId')
    @ApiOperation({ summary: 'Agregar clase a unidad' })
    @ApiParam({ name: 'unitId', description: 'ID de la unidad' })
    @ApiParam({ name: 'classId', description: 'ID de la clase' })
    @ApiResponse({ status: 200, description: 'Clase agregada exitosamente' })
    async addClass(
        @Param('unitId') unitId: string,
        @Param('classId') classId: string
    ) {
        return this.unitService.addClassToUnit(unitId, classId);
    }
}