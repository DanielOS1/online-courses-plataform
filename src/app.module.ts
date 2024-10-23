import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CourseModule } from './course/course.module';
import { UnitModule } from './unit/unit.module';
import { ClassService } from './class/class.service';
import { ClassController } from './class/class.controller';
import { ClassModule } from './class/class.module';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:example@localhost:27017/online-courses-platform?authSource=admin'),
    UsersModule,
    CourseModule,
    UnitModule,
    ClassModule,

  ],
  controllers: [AppController, ClassController],
  providers: [AppService, ClassService],
})
export class AppModule {}
