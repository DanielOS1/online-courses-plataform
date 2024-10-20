import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);

    }
    @Get('users')
    async getAllUser(){
        return this.userService.findAll();
    }
    @Get(':id')
    async getUserById(@Param('id') id: string){
        return this.userService.findOneById(id);
    }

    @Post('login')
    async loginUser(@Body() loginUserDto: LoginUserDto){
        return this.userService.authenticateUser(loginUserDto.email, loginUserDto.password);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
      const user = await this.userService.registerUser(createUserDto);
      return { message: 'Usuario registrado exitosamente' };
    }
}
