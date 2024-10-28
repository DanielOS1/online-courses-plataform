import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { User, UserSchema } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> { 
      const {email, password} = createUserDto;
  
      const existingUser = await this.userModel.findOne({ email }).exec();
      if (existingUser) {
          throw new ConflictException('El correo electrónico ya está registrado.');
      }
  
    
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new this.userModel({
          ...createUserDto,
          password: hashedPassword  
      });
      return newUser.save();
  }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec(); 
      }

    async update () {}

    async delete () {}

    async authenticateUser(email: string, password: string): Promise<User> {
      const user = await this.userModel.findOne({email}).exec();
  
      if(!user) {
          throw new NotFoundException('Usuario no encontrado');
      }
  
      console.log('Contraseña ingresada:', password);
      console.log('Contraseña almacenada:', user.password);
  
    
      if (password === user.password) {
          console.log('Las contraseñas son idénticas en texto plano');
      }
  
      try {
          const passwordMatch = await bcrypt.compare(password, user.password);
          console.log('¿Coinciden las contraseñas según bcrypt?', passwordMatch);
  
          if(!passwordMatch) {
              throw new BadRequestException('Contraseña incorrecta.');
          }
  
          return user;
      } catch (error) {
          console.error('Error al comparar contraseñas:', error);
          throw new BadRequestException('Error al verificar la contraseña.');
      }
  }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOneById(id);
    
        
        if (updateUserDto.password) {
          updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
    

        return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
      }
    
      async findOneById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).select('-password').exec();
        if (!user) {
          throw new NotFoundException('Usuario no encontrado.');
        }
        return user;
      }

      async registerUser(createUserDto: CreateUserDto): Promise<User> {
        const { email, password, username  } = createUserDto;
    

        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
          throw new ConflictException('El correo electrónico ya está registrado.');
        }
    

        const existingUsername = await this.userModel.findOne({ username }).exec();
        if (existingUsername) {
          throw new ConflictException('El nombre de usuario ya está en uso.');
        }
    
    

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new this.userModel({
          email,
          username,
          password: hashedPassword,
          enrolledCourses: [],
        });
    
        return newUser.save();
      }      
    
}
