import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncModule } from 'src/sync/sync.module';
import { ClassModule } from 'src/class/class.module';
import { UnitService } from 'src/unit/unit.service';
import { UnitModule } from 'src/unit/unit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SyncModule,
    ClassModule,
    UnitModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}