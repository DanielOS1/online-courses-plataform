import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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
}
