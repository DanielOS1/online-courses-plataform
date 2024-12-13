import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course, CourseSchema } from './schema/course.schema'; 
import { UnitModule } from 'src/unit/unit.module';
import { UsersModule } from 'src/users/users.module';
import { ClassModule } from 'src/class/class.module';
import { Neo4jCourseService } from './neo4j-course-service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]), 
    UnitModule,
    UsersModule,
    ClassModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, Neo4jCourseService],
})
export class CourseModule {}
