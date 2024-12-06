import { Module, forwardRef } from '@nestjs/common';
import { SyncService } from './sync.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../course/schema/course.schema';
import { Class, ClassSchema } from '../class/schema/class.schema';
import { UsersModule } from '../users/users.module';
import { Unit, UnitSchema } from 'src/unit/schema/unit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Class.name, schema: ClassSchema },
      { name: Unit.name, schema: UnitSchema }
    ]),
    forwardRef(() => UsersModule)  
  ],
  providers: [SyncService],
  exports: [SyncService]
})
export class SyncModule {}