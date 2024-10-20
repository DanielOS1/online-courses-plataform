import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CourseModule } from './course/course.module';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:example@localhost:27017/online-courses-platform?authSource=admin'),
    UsersModule,
    CourseModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
