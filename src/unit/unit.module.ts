import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { Unit, UnitSchema } from './schema/unit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }])
  ],
  controllers: [UnitController],
  providers: [UnitService],
  exports: [UnitService]
})
export class UnitModule {}