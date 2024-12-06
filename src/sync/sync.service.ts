import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from 'src/class/schema/class.schema';
import { Course, CourseDocument } from 'src/course/schema/course.schema';
import { CourseProgress, CourseStatus } from 'src/redis/interfaces/course-progress.interface';
import { User } from 'src/redis/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SyncService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @Inject(forwardRef(() => UsersService))  
    private readonly userService: UsersService,
  ) {}

  async syncUserProgress(userId: string): Promise<void> {
    // Obtener usuario de Redis
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener cursos inscritos de MongoDB
    const enrolledCourses = await this.courseModel
      .find({ 'enrolledStudents._id': userId })
      .select('_id name units')
      .exec();

    // Sincronizar progreso para cada curso
    for (const course of enrolledCourses) {
      await this.syncCourseProgress(user, course._id.toString());
    }
  }

  private async syncCourseProgress(user: User, courseId: string): Promise<void> {
    // Obtener todas las clases del curso
    const course = await this.courseModel
      .findById(courseId)
      .populate({
        path: 'units',
        populate: {
          path: 'classes',
          select: '_id name isPublished'
        }
      })
      .exec();

    if (!course) return;

    // Inicializar o actualizar el progreso en Redis
    const existingProgress = user.coursesProgress?.[courseId];
    const totalClasses = this.countPublishedClasses(course);

    const updatedProgress: CourseProgress = {
      courseId: course._id.toString(),
      courseName: course.name,
      status: existingProgress?.status || CourseStatus.INICIADO,
      startDate: existingProgress?.startDate || new Date(),
      lastAccessDate: existingProgress?.lastAccessDate || new Date(),
      completedClasses: existingProgress?.completedClasses || [],
      progressPercentage: (existingProgress?.completedClasses.length || 0) / totalClasses * 100
    };

    // Actualizar el progreso en Redis
    await this.userService.updateCourseProgressDirectly(
      user._id,
      courseId,
      updatedProgress
    );
  }

  private countPublishedClasses(course: any): number {
    let total = 0;
    for (const unit of course.units) {
      total += unit.classes.filter(cls => cls.isPublished).length;
    }
    return total;
  }
}