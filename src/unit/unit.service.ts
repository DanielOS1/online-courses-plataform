import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit, UnitDocument } from './schema/unit.schema';
import { CreateUnitDto } from './dto/create-unit.dto';


@Injectable()
export class UnitService {
  constructor(
    @InjectModel(Unit.name) private readonly unitModel: Model<UnitDocument>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const createdUnit = new this.unitModel(createUnitDto);
    return createdUnit.save();
  }

  async findAll(): Promise<Unit[]> {
    return this.unitModel.find().exec();
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitModel.findById(id).exec();
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }
/**
  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const updatedUnit = await this.unitModel
      .findByIdAndUpdate(id, updateUnitDto, { new: true })
      .exec();
    if (!updatedUnit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return updatedUnit;
  }
 */
  async remove(id: string): Promise<Unit> {
    const deletedUnit = await this.unitModel.findByIdAndDelete(id).exec();
    if (!deletedUnit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return deletedUnit;
  }
}
