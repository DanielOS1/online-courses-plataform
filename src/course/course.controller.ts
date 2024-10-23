import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly coursesService: CourseService) {}

  
  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }


  @Get()
  async getAllCourses() {
    return this.coursesService.findAll();
  }

 
  @Get(':id')
  async getCourseById(@Param('id') id: string) {
    return this.coursesService.findOneById(id);
  }

  @Put(':id')
  async updateCourse(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }


  @Delete(':id')
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
