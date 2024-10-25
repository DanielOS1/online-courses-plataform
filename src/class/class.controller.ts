import { Controller, Get, Post, Body, Param, Delete, Put, BadRequestException } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

 
  @Post()
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }


  @Get()
  async findAll() {
    return this.classService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.classService.findOneById(id);
  }

  
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(id, updateClassDto);
  }


  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.classService.remove(id);
  }

 
  @Get('unit/:unitId')
  async findByUnit(@Param('unitId') unitId: string) {
    return this.classService.findByUnit(unitId);
  }

  
  @Get('instructor/:instructorId')
  async findByInstructor(@Param('instructorId') instructorId: string) {
    return this.classService.findByInstructor(instructorId);
  }


  @Put(':id/publish')
  async updatePublishStatus(@Param('id') id: string, @Body('isPublished') isPublished: boolean) {
    return this.classService.updatePublishStatus(id, isPublished);
  }

  
  @Put(':id/add-material')
  async addAdditionalMaterial(@Param('id') id: string, @Body('materialUrl') materialUrl: string) {
    return this.classService.addAdditionalMaterial(id, materialUrl);
  }


  @Put(':id/remove-material')
  async removeAdditionalMaterial(@Param('id') id: string, @Body('materialUrl') materialUrl: string) {
    return this.classService.removeAdditionalMaterial(id, materialUrl);
  }


  @Get('unit/:unitId/count')
  async countClassesByUnit(@Param('unitId') unitId: string) {
    return this.classService.countClassesByUnit(unitId);
  }
}
