import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CourseModule } from './course/course.module';
import { UnitModule } from './unit/unit.module';
import { ClassModule } from './class/class.module';
import { RatingModule } from './rating/rating.module';
import { CommentsModule } from './comments/comments.module';
import { RedisModule } from './redis/redis.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    CourseModule,
    UnitModule,
    ClassModule,
    RatingModule,
    CommentsModule,
    RedisModule,
    Neo4jModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
