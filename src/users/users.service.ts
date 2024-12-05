import { BadRequestException, ConflictException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcrypt';
import { User } from './../redis/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
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

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await this.generateUserId();

    const newUser: User = {
      _id: userId.toString(),
      ...createUserDto,
      password: hashedPassword,
      enrolledCourses: [],
      instructorCourses: []
    };

    const multi = this.redisClient.multi();
    multi.set(`user:email:${email}`, JSON.stringify(newUser));
    multi.set(`user:id:${userId}`, email);

    await multi.exec();
    return newUser;
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
      instructorCourses: []
    };

    const multi = this.redisClient.multi();
    multi.set(`user:email:${email}`, JSON.stringify(newUser));
    multi.set(`user:username:${username}`, email);
    multi.set(`user:id:${userId}`, email);

    await multi.exec();
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
}