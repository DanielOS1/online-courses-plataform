import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncModule } from 'src/sync/sync.module';
import { ClassModule } from 'src/class/class.module';
import { UnitModule } from 'src/unit/unit.module';
import { Neo4jUserService } from './neo4j-user-service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SyncModule,
    ClassModule,
    UnitModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, Neo4jUserService],
  exports: [UsersService]
})
export class UsersModule {}