import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { Unit, UnitSchema } from './schema/unit.schema';
import { ClassModule } from '../class/class.module'; // Asegúrate de importar el ClassModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    ClassModule, 
  ],
  controllers: [UnitController],
  providers: [UnitService],
  exports: [UnitService],
})
export class UnitModule {}
