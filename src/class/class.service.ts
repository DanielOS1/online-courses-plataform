import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from './schema/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    try {
      const newClass = new this.classModel({
        ...createClassDto,
        updatedAt: new Date(),
      });
      
      return await newClass.save();
    } catch (error) {
      if (error.code === 11000) { // Error de duplicación
        throw new BadRequestException('Ya existe una clase con ese nombre');
      }
      throw error;
    }
  }

  async findAll(filters: Partial<Class> = {}): Promise<Class[]> {
    return this.classModel
      .find(filters)
      .populate([
        {
          path: 'unit',
          select: 'name order description',
        },
        {
          path: 'instructor',
          select: 'name email role',
        },
      ])
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneById(id: string): Promise<Class> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de clase inválido');
    }

    const foundClass = await this.classModel
      .findById(id)
      .populate([
        {
          path: 'unit',
          select: 'name order description',
        },
        {
          path: 'instructor',
          select: 'name email role',
        },
      ])
      .exec();

    if (!foundClass) {
      throw new NotFoundException(`Clase con id ${id} no encontrada.`);
    }

    return foundClass;
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de clase inválido');
    }

    try {
      const updatedClass = await this.classModel
        .findByIdAndUpdate(
          id,
          {
            ...updateClassDto,
            updatedAt: new Date(),
          },
          { new: true }
        )
        .populate([
          {
            path: 'unit',
            select: 'name order description',
          },
          {
            path: 'instructor',
            select: 'name email role',
          },
        ])
        .exec();

      if (!updatedClass) {
        throw new NotFoundException(`Clase con id ${id} no encontrada.`);
      }

      return updatedClass;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Ya existe una clase con ese nombre');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Class> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de clase inválido');
    }

    const deletedClass = await this.classModel.findByIdAndDelete(id).exec();
    
    if (!deletedClass) {
      throw new NotFoundException(`Clase con id ${id} no encontrada.`);
    }

    return deletedClass;
  }

  async findByUnit(unitId: string): Promise<Class[]> {
    if (!Types.ObjectId.isValid(unitId)) {
      throw new BadRequestException('ID de unidad inválido');
    }

    return this.classModel
      .find({ unit: unitId })
      .populate([
        {
          path: 'unit',
          select: 'name order description',
        },
        {
          path: 'instructor',
          select: 'name email role',
        },
      ])
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByInstructor(instructorId: string): Promise<Class[]> {
    if (!Types.ObjectId.isValid(instructorId)) {
      throw new BadRequestException('ID de instructor inválido');
    }

    return this.classModel
      .find({ instructor: instructorId })
      .populate([
        {
          path: 'unit',
          select: 'name order description',
        },
        {
          path: 'instructor',
          select: 'name email role',
        },
      ])
      .sort({ createdAt: -1 })
      .exec();
  }

  async updatePublishStatus(id: string, isPublished: boolean): Promise<Class> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de clase inválido');
    }

    const updatedClass = await this.classModel
      .findByIdAndUpdate(
        id,
        {
          isPublished,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .populate([
        {
          path: 'unit',
          select: 'name order description',
        },
        {
          path: 'instructor',
          select: 'name email role',
        },
      ])
      .exec();

    if (!updatedClass) {
      throw new NotFoundException(`Clase con id ${id} no encontrada.`);
    }

    return updatedClass;
  }

  async addAdditionalMaterial(id: string, materialUrl: string): Promise<Class> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de clase inválido');
    }

    const updatedClass = await this.classModel
      .findByIdAndUpdate(
        id,
        {
          $push: { additionalMaterial: materialUrl },
          updatedAt: new Date(),
        },
        { new: true }
      )
      .populate([
        {
          path: 'unit',
          select: 'name order description',
        },
        {
          path: 'instructor',
          select: 'name email role',
        },
      ])
      .exec();

    if (!updatedClass) {
      throw new NotFoundException(`Clase con id ${id} no encontrada.`);
    }

    return updatedClass;
  }

  async removeAdditionalMaterial(id: string, materialUrl: string): Promise<Class> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de clase inválido');
    }

    const updatedClass = await this.classModel
      .findByIdAndUpdate(
        id,
        {
          $pull: { additionalMaterial: materialUrl },
          updatedAt: new Date(),
        },
        { new: true }
      )
      .populate([
        {
          path: 'unit',
          select: 'name order description',
        },
        {
          path: 'instructor',
          select: 'name email role',
        },
      ])
      .exec();

    if (!updatedClass) {
      throw new NotFoundException(`Clase con id ${id} no encontrada.`);
    }

    return updatedClass;
  }

  async countClassesByUnit(unitId: string): Promise<number> {
    if (!Types.ObjectId.isValid(unitId)) {
      throw new BadRequestException('ID de unidad inválido');
    }

    return this.classModel.countDocuments({ unit: unitId }).exec();
  }

  async 

}