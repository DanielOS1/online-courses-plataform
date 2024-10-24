import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schema/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UnitService } from '../unit/unit.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly unitService: UnitService,
    private readonly userService: UsersService, 
  ) {}

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

  async addUnitToCourse(courseId: string, unitId: string): Promise<Course> {
    const unit = await this.unitService.findOne(unitId);
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

  async addStudentToCourse(courseId: string, studentId: string): Promise<Course> {
    const student = await this.userService.findOneById(studentId); 
    const course = await this.courseModel
      .findByIdAndUpdate(
        courseId,
        { $push: { enrolledStudents: student._id } },
        { new: true }
      )
      .populate('enrolledStudents')
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return course;
  }
}
