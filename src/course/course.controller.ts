import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AssignInstructorDto } from './dto/assign-instructor.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
/**
 * Controlador que maneja todas las operaciones relacionadas con cursos
 * @class CourseController
 */
@ApiTags('Courses')
@Controller('courses')
export class CourseController {
    constructor(private readonly coursesService: CourseService) {}

    /**
     * Crea un nuevo curso
     * @param {CreateCourseDto} createCourseDto - Datos del curso a crear
     * @returns {Promise<Course>} Curso creado
     */
    @Post()
    @ApiOperation({ summary: 'Crear nuevo curso' })
    @ApiResponse({ status: 201, description: 'Curso creado exitosamente' })
    async createCourse(@Body() createCourseDto: CreateCourseDto) {
        return this.coursesService.create(createCourseDto);
    }

    /**
     * Obtiene todos los cursos disponibles
     * @returns {Promise<Course[]>} Lista de cursos
     */
    @Get()
    @ApiOperation({ summary: 'Obtener todos los cursos' })
    @ApiResponse({ status: 200, description: 'Lista de cursos obtenida exitosamente' })
    async getAllCourses() {
        return this.coursesService.findAll();
    }

    /**
     * Obtiene un curso específico por su ID
     * @param {string} id - ID del curso
     * @returns {Promise<Course>} Curso encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener curso por ID' })
    @ApiParam({ name: 'id', description: 'ID del curso' })
    @ApiResponse({ status: 200, description: 'Curso encontrado' })
    async getCourseById(@Param('id') id: string) {
        return this.coursesService.findOneById(id);
    }

    /**
     * Actualiza la información de un curso
     * @param {string} id - ID del curso
     * @param {UpdateCourseDto} updateCourseDto - Datos a actualizar del curso
     */
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar curso' })
    @ApiParam({ name: 'id', description: 'ID del curso' })
    @ApiResponse({ status: 200, description: 'Curso actualizado exitosamente' })
    async updateCourse(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
        return this.coursesService.update(id, updateCourseDto);
    }

    /**
     * Elimina un curso del sistema
     * @param {string} id - ID del curso a eliminar
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar curso' })
    @ApiParam({ name: 'id', description: 'ID del curso' })
    @ApiResponse({ status: 200, description: 'Curso eliminado exitosamente' })
    async deleteCourse(@Param('id') id: string) {
        return this.coursesService.remove(id);
    }

    /**
     * Agrega una unidad a un curso existente
     * @param {string} courseId - ID del curso
     * @param {string} unitId - ID de la unidad a agregar
     */
    @Post(':id/units')
    @ApiOperation({ summary: 'Agregar unidad a curso' })
    @ApiParam({ name: 'id', description: 'ID del curso' })
    @ApiResponse({ status: 200, description: 'Unidad agregada exitosamente' })
    async addUnitToCourse(
        @Param('id') courseId: string,
        @Body('unitId') unitId: string
    ) {
        return this.coursesService.addUnitToCourse(courseId, unitId);
    }

    /**
     * Agrega un estudiante a un curso
     * @param {string} courseId - ID del curso
     * @param {string} studentId - ID del estudiante a agregar
     */
    @Post(':id/student')
    @ApiOperation({ summary: 'Agregar estudiante a curso' })
    @ApiParam({ name: 'id', description: 'ID del curso' })
    @ApiResponse({ status: 200, description: 'Estudiante agregado exitosamente' })
    async addStudentToCourse(
        @Param('id') courseId: string,
        @Body('studentId') studentId: string
    ) {
        return this.coursesService.addStudentToCourse(courseId, studentId);
    }

    /**
     * Asigna un instructor a un curso
     * @param {string} courseId - ID del curso
     * @param {AssignInstructorDto} assignInstructorDto - Datos del instructor a asignar
     */
    @Put(':courseId/instructor')
    @ApiOperation({ summary: 'Asignar instructor a curso' })
    @ApiParam({ name: 'courseId', description: 'ID del curso' })
    @ApiResponse({ status: 200, description: 'Instructor asignado exitosamente' })
    async assignInstructor(
        @Param('courseId') courseId: string,
        @Body() assignInstructorDto: AssignInstructorDto
    ) {
        return this.coursesService.addInstructorToCourse(
            courseId,
            assignInstructorDto.instructorId
        );
    }
}
