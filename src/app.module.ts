import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CourseModule } from './course/course.module';
import { UnitModule } from './unit/unit.module';
import { ClassModule } from './class/class.module';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}