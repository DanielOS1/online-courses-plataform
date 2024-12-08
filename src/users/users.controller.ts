// Users Controller
import { Controller, Get, Post, Body, Param, Delete, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { SyncService } from 'src/sync/sync.service';

/**
 * Controlador que maneja todas las operaciones relacionadas con usuarios
 * @class UsersController
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService,
                @Inject(forwardRef(() => SyncService))
                private readonly syncService: SyncService) {}

    /**
     * Crea un nuevo usuario en el sistema
     * @param {CreateUserDto} createUserDto - Datos del usuario a crear
     * @returns {Promise<User>} Usuario creado
     */
    @Post('')
    @ApiOperation({ summary: 'Crear un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    /**
     * Obtiene todos los usuarios del sistema
     * @returns {Promise<User[]>} Lista de usuarios
     */
    @Get('')
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
    async getAllUser() {
        return this.userService.findAll();
    }

    /**
     * Obtiene un usuario por su ID
     * @param {string} id - ID del usuario
     * @returns {Promise<User>} Usuario encontrado
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    @ApiParam({ name: 'id', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Usuario encontrado' })
    async getUserById(@Param('id') id: string) {
        return this.userService.findOneById(id);
    }

    /**
     * Autentica un usuario en el sistema
     * @param {LoginUserDto} loginUserDto - Credenciales del usuario
     * @returns {Promise<AuthResponse>} Token de autenticación
     */
    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión de usuario' })
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    async loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.userService.authenticateUser(loginUserDto.email, loginUserDto.password);
    }

    /**
     * Registra un nuevo usuario en el sistema
     * @param {CreateUserDto} createUserDto - Datos del usuario a registrar
     * @returns {Promise<{ message: string }>} Mensaje de confirmación
     */
    @Post('register')
    @ApiOperation({ summary: 'Registrar nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.userService.registerUser(createUserDto);
        return { message: 'Usuario registrado exitosamente' };
    }

    @Post(':userId/courses/:courseId/progress')
    async markClassCompleted(
      @Param('userId') userId: string,
      @Param('courseId') courseId: string,
      @Body() data: { classId: string; className: string }
    ) {
      return this.userService.markClassAsCompleted(
        userId,
        courseId,
        data.classId,
        data.className
      );
    }
  
    @Get(':userId/courses/progress')
    async getAllProgress(@Param('userId') userId: string) {
      await this.syncService.syncUserProgress(userId);
      return this.userService.getAllUserCoursesProgress(userId);
    }
  
    @Get(':userId/courses/:courseId/progress')
    async getCourseProgress(
      @Param('userId') userId: string,
      @Param('courseId') courseId: string
    ) {
      await this.syncService.syncUserProgress(userId);
      return this.userService.getUserCourseProgress(userId, courseId); 
    }
  
    @Delete(':userId/courses/:courseId/progress')
    async resetProgress(
      @Param('userId') userId: string,
      @Param('courseId') courseId: string
    ) {
      return this.userService.resetCourseProgress(userId, courseId);
    }
  }
