import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schema/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UnitService } from '../unit/unit.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AddUnitDto } from './dto/add-unit.dto';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  private readonly unitService: UnitService,)
   {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const newCourse = new this.courseModel(createCourseDto);
    return newCourse.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().populate('instructor enrolledStudents').exec(); // Traemos las referencias
  }

  async findOneById(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).populate('instructor enrolledStudents').exec();
    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true }).exec();
    if (!updatedCourse) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }
    return updatedCourse;
  }

  async remove(id: string): Promise<Course> {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }
    return deletedCourse;
  }

  
  async addUnitToCourse(courseId: string, addUnitDto: AddUnitDto): Promise<Course> {
    // Verificar que la unidad existe
    const unit = await this.unitService.findOne(addUnitDto.unitId);
    
    // Buscar y actualizar el curso
    const course = await this.courseModel
      .findByIdAndUpdate(
        courseId,
        { $push: { units: unit._id } },
        { new: true }
      )
      .populate('units')
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return course;
  }
}
