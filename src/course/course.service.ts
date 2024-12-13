import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schema/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UnitService } from '../unit/unit.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UsersService } from 'src/users/users.service';
import { Neo4jCourseService } from './neo4j-course-service';

interface UserReference {
  _id: string;
  email: string;
  username: string;
}

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly unitService: UnitService,
    private readonly userService: UsersService,
    private readonly neo4jCourseService: Neo4jCourseService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const newCourse = new this.courseModel(createCourseDto);
    const savedCourse = await newCourse.save();

    // Crear nodo en Neo4j
    await this.neo4jCourseService.createCourseNode(savedCourse);

    return savedCourse;
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel
      .find()
      .populate('instructor enrolledStudents')
      .populate({
        path: 'units',
        select: 'name order description',
        options: { sort: { order: 1 } }
      })
      .exec();
  }

  async findOneById(id: string): Promise<Course> {
    const course = await this.courseModel
      .findById(id)
      .populate('instructor enrolledStudents')
      .populate({
        path: 'units',
        select: 'name order description',
        options: { sort: { order: 1 } }
      })
      .exec();

    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
    
    if (!updatedCourse) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }
    return updatedCourse;
  }

  async remove(id: string): Promise<Course> {
    const course = await this.findOneById(id);
    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }

    // Eliminar las referencias del curso en los estudiantes (Redis)
    if (course.enrolledStudents) {
      for (const student of course.enrolledStudents) {
        await this.userService.removeCourseFromUser(student._id.toString(), id);
      }
    }

    // Eliminar la referencia del curso en el instructor (Redis)
    if (course.instructor) {
      await this.userService.removeInstructorCourse(course.instructor._id.toString(), id);
    }

    // Eliminar el nodo y sus relaciones en Neo4j
    await this.neo4jCourseService.deleteCourseNode(id);

    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
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
      .populate(['instructor', 'enrolledStudents'])
      .populate({
        path: 'units',
        select: 'name order description',
        options: { sort: { order: 1 } }
      })
      .exec();
  
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
  
    await this.unitService.update(unitId, {
      course: course._id as any
    });
  
    return course;
  }

  async addStudentToCourse(courseId: string, studentId: string): Promise<Course> {
    try {
      // 1. Obtener el estudiante de Redis
      const student = await this.userService.findOneById(studentId);
      if (!student) {
        throw new NotFoundException(`Estudiante con ID ${studentId} no encontrado`);
      }
  
      // 2. Crear referencia del estudiante
      const studentReference = {
        _id: student._id,
        email: student.email,
        username: student.username
      };
  
      // 3. Actualizar el curso en MongoDB
      const course = await this.courseModel
        .findByIdAndUpdate(
          courseId,
          { 
            $addToSet: { 
              enrolledStudents: studentReference 
            } 
          },
          { new: true }
        )
        .exec();
  
      if (!course) {
        throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
      }
  
      // 4. Actualizar la información del curso en Redis para el estudiante
      await this.userService.addCourseToUser(studentId, courseId);
  
      return course;
    } catch (error) {
      throw new BadRequestException(
        `Error al agregar estudiante al curso: ${error.message}`
      );
    }
  }

  async addInstructorToCourse(courseId: string, instructorId: string): Promise<Course> {
    try {
      // 1. Obtener el instructor de Redis
      const instructor = await this.userService.findOneById(instructorId);
      if (!instructor) {
        throw new NotFoundException(`Instructor con ID ${instructorId} no encontrado`);
      }

      // 2. Crear referencia del instructor
      const instructorReference: UserReference = {
        _id: instructor._id,
        email: instructor.email,
        username: instructor.username
      };

      // 3. Actualizar el curso en MongoDB
      const course = await this.courseModel
        .findByIdAndUpdate(
          courseId,
          { instructor: instructorReference },
          { new: true }
        )
        .populate(['enrolledStudents', 'units'])
        .exec();

      if (!course) {
        throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
      }

      // 4. Actualizar la información del curso en Redis para el instructor
      await this.userService.addInstructorCourse(instructorId, courseId);

      return course;
    } catch (error) {
      throw new BadRequestException(
        `Error al agregar instructor al curso: ${error.message}`
      );
    }
  }
}