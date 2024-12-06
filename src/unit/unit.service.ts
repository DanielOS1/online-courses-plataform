import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Unit, UnitDocument } from './schema/unit.schema';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Class, ClassDocument } from 'src/class/schema/class.schema';
import { ClassService } from 'src/class/class.service';


@Injectable()
export class UnitService {
  constructor(
    @InjectModel(Unit.name) private readonly unitModel: Model<UnitDocument>,
    private readonly classService: ClassService,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const createdUnit = new this.unitModel(createUnitDto);
    return createdUnit.save();
  }

  async findAll(): Promise<Unit[]> {
    return this.unitModel
      .find()
      .populate({
        path: 'course',
        select: '_id name '
      })
      .exec();
  }

  async findByCourse(courseId: string): Promise<Unit[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('ID de curso inválido');
    }

    return this.unitModel
      .find({ course: courseId })
      .populate('classes')
      .populate({
        path: 'course',
        select: '_id name'
      })
      .exec();
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitModel
      .findById(id)
      .populate({
        path: 'course',
        select: '_id name ' 
      })
      .exec();
      
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }


  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const updatedUnit = await this.unitModel
      .findByIdAndUpdate(id, updateUnitDto, { new: true })
      .populate({
        path: 'course',
        select: '_id name '
      })
      .exec();
      
    if (!updatedUnit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    
    return updatedUnit;
  }


  async remove(id: string): Promise<Unit> {
    const deletedUnit = await this.unitModel.findByIdAndDelete(id).exec();
    if (!deletedUnit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return deletedUnit;
    
  }
  async addClassToUnit(unitId: string, classId: string): Promise<Unit> {
    if (!Types.ObjectId.isValid(unitId)) {
      throw new BadRequestException('ID de unidad inválido');
    }

    const updatedUnit = await this.unitModel
      .findByIdAndUpdate(
        unitId,
        {
          $addToSet: { classes: classId }, // Añadir clase a la lista de clases de la unidad
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!updatedUnit) {
      throw new NotFoundException(`Unidad con id ${unitId} no encontrada.`);
    }

    return updatedUnit;
  }
}
