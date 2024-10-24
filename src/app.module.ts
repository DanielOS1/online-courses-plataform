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
import { RatingController } from './rating/rating.controller';
import { RatingService } from './rating/rating.service';
import { RatingModule } from './rating/rating.module';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:example@localhost:27017/online-courses-platform?authSource=admin'),
    UsersModule,
    CourseModule,
    UnitModule,
    ClassModule,
    RatingModule,

  ],
  controllers: [AppController, ClassController, RatingController],
  providers: [AppService, ClassService, RatingService],
})
export class AppModule {}
