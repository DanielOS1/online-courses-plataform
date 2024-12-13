import { BadRequestException, ConflictException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcrypt';
import { User } from './../redis/interfaces/user.interface';
import { CourseProgress, CourseStatus } from 'src/redis/interfaces/course-progress.interface';
import { ClassService } from 'src/class/class.service';
import { UnitService } from 'src/unit/unit.service';
import { Neo4jUserService } from './neo4j-user-service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    private readonly classService: ClassService,
    private readonly unitService: UnitService,
    private readonly neo4jUserService: Neo4jUserService,
  ) {}

  private async getUserByEmail(email: string): Promise<User | null> {
    const userData = await this.redisClient.get(`user:email:${email}`);
    return userData ? JSON.parse(userData) : null;
  }

  private async getUserByUsername(username: string): Promise<User | null> {
    const email = await this.redisClient.get(`user:username:${username}`);
    if (!email) return null;
    return this.getUserByEmail(email);
  }

  private async getUserById(id: string): Promise<User | null> {
    const email = await this.redisClient.get(`user:id:${id}`);
    if (!email) return null;
    return this.getUserByEmail(email);
  }

  private async generateUserId(): Promise<string> {
    return (await this.redisClient.incr('user:id:counter')).toString();
  }

  async findAll(): Promise<User[]> {
    const userEmails = await this.redisClient.keys('user:email:*');
    const users: User[] = [];

    for (const key of userEmails) {
      const userData = await this.redisClient.get(key);
      if (userData) {
        const user = JSON.parse(userData);
        delete user.password;
        users.push(user);
      }
    }

    return users;
  }

  async authenticateUser(email: string, password: string): Promise<User> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        throw new BadRequestException('Contraseña incorrecta.');
      }

      return user;
    } catch (error) {
      console.error('Error al comparar contraseñas:', error);
      throw new BadRequestException('Error al verificar la contraseña.');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const updatedUser = { ...user };

    if (updateUserDto.password) {
      updatedUser.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.getUserByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está registrado.');
      }
      
      const multi = this.redisClient.multi();
      multi.del(`user:email:${user.email}`);
      updatedUser.email = updateUserDto.email;
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.getUserByUsername(updateUserDto.username);
      if (existingUsername) {
        throw new ConflictException('El nombre de usuario ya está en uso.');
      }

      const multi = this.redisClient.multi();
      multi.del(`user:username:${user.username}`);
      multi.set(`user:username:${updateUserDto.username}`, updatedUser.email);
      updatedUser.username = updateUserDto.username;
    }

    Object.assign(updatedUser, updateUserDto);

    await this.redisClient.set(`user:email:${updatedUser.email}`, JSON.stringify(updatedUser));

    // Actualizar nodo en Neo4j
    await this.neo4jUserService.updateUserNode(updatedUser);

    return updatedUser;
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }

  async registerUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, username, role } = createUserDto;

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const existingUsername = await this.getUserByUsername(username);
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await this.generateUserId();

    const newUser: User = {
      _id: userId.toString(),
      email,
      username,
      role,
      password: hashedPassword,
      enrolledCourses: [],
      instructorCourses: [],
      coursesProgress: {},

    };

    const multi = this.redisClient.multi();
    multi.set(`user:email:${email}`, JSON.stringify(newUser));
    multi.set(`user:username:${username}`, email);
    multi.set(`user:id:${userId}`, email);

    await multi.exec();

    // Crear nodo en Neo4j
    await this.neo4jUserService.createUserNode(newUser);

    return newUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const multi = this.redisClient.multi();
    multi.del(`user:email:${user.email}`);
    multi.del(`user:username:${user.username}`);
    multi.del(`user:id:${id}`);
    
    await multi.exec();

    // Eliminar nodo en Neo4j
    await this.neo4jUserService.deleteUserNode(id);
  }

  async addCourseToUser(userId: string, courseId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }

    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));
    }
  }

  async removeCourseFromUser(userId: string, courseId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.enrolledCourses) {
      user.enrolledCourses = user.enrolledCourses.filter(id => id !== courseId);
      await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));
    }
  }

  async addInstructorCourse(instructorId: string, courseId: string): Promise<void> {
    const user = await this.getUserById(instructorId);
    if (!user) {
      throw new NotFoundException('Instructor no encontrado');
    }

    if (!user.instructorCourses) {
      user.instructorCourses = [];
    }

    if (!user.instructorCourses.includes(courseId)) {
      user.instructorCourses.push(courseId);
      await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));
    }
  }

  async removeInstructorCourse(instructorId: string, courseId: string): Promise<void> {
    const user = await this.getUserById(instructorId);
    if (!user) {
      throw new NotFoundException('Instructor no encontrado');
    }

    if (user.instructorCourses) {
      user.instructorCourses = user.instructorCourses.filter(id => id !== courseId);
      await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));
    }
  }

  async markClassAsCompleted(
    userId: string, 
    courseId: string, 
    classId: string, 
    className: string
): Promise<CourseProgress> {
    try {
        console.log('1. Iniciando markClassAsCompleted con:', { userId, courseId, classId, className });

        // 1. Validar que el usuario existe y está inscrito
        const user = await this.getUserById(userId);
        console.log('2. Usuario encontrado:', user);

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (!user.enrolledCourses.includes(courseId)) {
            throw new BadRequestException('El usuario no está inscrito en este curso');
        }

        // Obtener información del curso para el nombre
        const units = await this.unitService.findByCourse(courseId);
        console.log('3. Unidades encontradas:', units);

        // Obtener el total de clases
        const totalClasses = units.reduce((total, unit) => {
            console.log('4. Procesando unidad:', unit);
            return total + (unit.classes ? unit.classes.length : 0);
        }, 0);
        console.log('5. Total de clases encontradas:', totalClasses);

        // 2. Inicializar o recuperar el progreso del curso
        let courseProgress = user.coursesProgress?.[courseId] || {
            courseId,
            courseName: "", // Agregamos el nombre del curso
            status: CourseStatus.INICIADO,
            startDate: new Date(),
            lastAccessDate: new Date(),
            completedClasses: [],
            progressPercentage: 0 // Inicializamos en 0 en lugar de null
        };
        console.log('6. Progreso inicial del curso:', courseProgress);

        // 3. Verificar si la clase ya está completada
        const classCompleted = courseProgress.completedClasses.find(c => c.classId === classId);
        if (!classCompleted) {
            courseProgress.completedClasses.push({
                classId,
                className,
                completedAt: new Date()
            });
            courseProgress.lastAccessDate = new Date();

            // Calcular el porcentaje basado en el total real
            if (totalClasses > 0) {
                courseProgress.progressPercentage = Math.min(
                    Math.round((courseProgress.completedClasses.length / totalClasses) * 100),
                    100
                );
            } else {
                courseProgress.progressPercentage = 0;
            }
            console.log('7. Nuevo porcentaje calculado:', courseProgress.progressPercentage);

            // Actualizar estado
            if (courseProgress.progressPercentage === 100) {
                courseProgress.status = CourseStatus.COMPLETADO;
            } else if (courseProgress.progressPercentage > 0) {
                courseProgress.status = CourseStatus.EN_CURSO;
            }
            console.log('8. Nuevo estado:', courseProgress.status);

            // Guardar en Redis
            if (!user.coursesProgress) {
                user.coursesProgress = {};
            }
            user.coursesProgress[courseId] = courseProgress;
            await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));
            console.log('9. Guardado en Redis completado');
        }

        console.log('10. Progreso final:', courseProgress);
        return courseProgress;

    } catch (error) {
        console.error('Error detallado:', error);
        console.error('Stack trace:', error.stack);
        throw error;
    }
}

  async getAllUserCoursesProgress(userId: string): Promise<CourseProgress[]> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.coursesProgress) {
      return [];
    }

    return Object.values(user.coursesProgress);
  }

  async resetCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const newProgress: CourseProgress = {
      courseId,
      courseName: user.coursesProgress?.[courseId]?.courseName || '',
      status: CourseStatus.INICIADO,
      startDate: new Date(),
      lastAccessDate: new Date(),
      completedClasses: [],
      progressPercentage: 0
    };

    if (!user.coursesProgress) {
      user.coursesProgress = {};
    }
    user.coursesProgress[courseId] = newProgress;
    await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));

    return newProgress;
  }

  async removeClassFromProgress(
    userId: string,
    courseId: string,
    classId: string
  ): Promise<CourseProgress> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const courseProgress = user.coursesProgress?.[courseId];
    if (!courseProgress) {
      throw new NotFoundException('Progreso no encontrado para este curso');
    }

    courseProgress.completedClasses = courseProgress.completedClasses.filter(
      c => c.classId !== classId
    );
    courseProgress.lastAccessDate = new Date();
    courseProgress.progressPercentage = 
      (courseProgress.completedClasses.length / 10) * 100; // Se actualizará con el sync

    if (courseProgress.completedClasses.length === 0) {
      courseProgress.status = CourseStatus.INICIADO;
    } else if (courseProgress.progressPercentage < 100) {
      courseProgress.status = CourseStatus.EN_CURSO;
    }

    user.coursesProgress[courseId] = courseProgress;
    await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));

    return courseProgress;
  }

  async updateCourseProgressDirectly(
    userId: string,
    courseId: string,
    progress: CourseProgress
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.coursesProgress) {
      user.coursesProgress = {};
    }

    user.coursesProgress[courseId] = progress;
    await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));
  }

  async getUserCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
    console.log('1. Iniciando getUserCourseProgress:', { userId, courseId });

    const user = await this.getUserById(userId);
    console.log('2. Usuario encontrado:', user);
    
    if (!user) {
        throw new NotFoundException('Usuario no encontrado');
    }

    const progress = user.coursesProgress?.[courseId];
    console.log('3. Progreso actual:', progress);

    if (!progress) {
        console.log('4. No se encontró progreso, creando uno nuevo');
        return {
            courseId,
            courseName: '',
            status: CourseStatus.INICIADO,
            startDate: new Date(),
            lastAccessDate: new Date(),
            completedClasses: [],
            progressPercentage: 0
        };
    }

    console.log('5. Verificando y limpiando valores del progreso');
    
    // Limpiar clases completadas
    const validCompletedClasses = progress.completedClasses
        .filter(clase => clase.classId && clase.className);
    
    console.log('5.1 Clases válidas encontradas:', validCompletedClasses);

    // Obtener total de clases
    const units = await this.unitService.findByCourse(courseId);
    console.log('5.2 Unidades encontradas:', units);

    // Calcular total de clases
    const totalClasses = units.reduce((total, unit) => {
        console.log('5.3 Procesando unidad:', {
            unitId: unit._id,
            classes: unit.classes,
            classesLength: unit.classes?.length
        });
        return total + (unit.classes?.length || 0);
    }, 0);
    
    console.log('5.4 Total de clases calculado:', totalClasses);
    console.log('5.5 Número de clases completadas:', validCompletedClasses.length);

    // Calcular porcentaje
    const percentage = totalClasses > 0 
        ? Math.round((validCompletedClasses.length / totalClasses) * 100)
        : 0;
    
    console.log('5.6 Porcentaje calculado:', percentage);

    const validatedProgress = {
        ...progress,
        completedClasses: validCompletedClasses,
        progressPercentage: percentage,
        status: validCompletedClasses.length > 0 ? CourseStatus.EN_CURSO : CourseStatus.INICIADO
    };

    console.log('6. Progreso validado final:', validatedProgress);

    // Actualizar en Redis
    if (user.coursesProgress) {
        user.coursesProgress[courseId] = validatedProgress;
        await this.redisClient.set(`user:email:${user.email}`, JSON.stringify(user));
    }

    return validatedProgress;
}


}