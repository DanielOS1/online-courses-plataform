// src/rating/rating.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from './schema/rating.schema';
import { Course, CourseDocument } from '../course/schema/course.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    // Verificar si el usuario ya ha valorado este curso
    const existingRating = await this.ratingModel.findOne({
      userId: createRatingDto.userId,
      courseId: createRatingDto.courseId,
    });

    if (existingRating) {
      throw new BadRequestException('El usuario ya ha valorado este curso');
    }

    // Verificar si el curso existe
    const courseExists = await this.courseModel.findById(createRatingDto.courseId);
    if (!courseExists) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Crear la nueva valoración
    const newRating = new this.ratingModel(createRatingDto);

    // Guardar la valoración
    const savedRating = await newRating.save();

    // Actualizar el promedio en el curso
    await this.updateCourseAverageRating(createRatingDto.courseId);

    return savedRating;
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingModel.find().populate('userId').populate('courseId');
  }

  async findOne(id: string): Promise<Rating> {
    const rating = await this.ratingModel.findById(id).populate('userId').populate('courseId');
    if (!rating) {
      throw new NotFoundException('Valoración no encontrada');
    }
    return rating;
  }

  async update(id: string, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingModel.findById(id);
    
    if (!rating) {
      throw new NotFoundException('Valoración no encontrada');
    }

    if (rating.userId.toString() !== updateRatingDto.userId) {
      throw new BadRequestException('No tienes permiso para modificar esta valoración');
    }

    const updatedRating = await this.ratingModel.findByIdAndUpdate(
      id,
      { rating: updateRatingDto.rating, updatedAt: new Date() },
      { new: true },
    );

    await this.updateCourseAverageRating(rating.courseId.toString());

    return updatedRating;
  }

  async remove(id: string, userId: string): Promise<void> {
    const rating = await this.ratingModel.findById(id);
    
    if (!rating) {
      throw new NotFoundException('Valoración no encontrada');
    }

    if (rating.userId.toString() !== userId) {
      throw new BadRequestException('No tienes permiso para eliminar esta valoración');
    }

    await this.ratingModel.findByIdAndDelete(id);
    await this.updateCourseAverageRating(rating.courseId.toString());
  }

  private async updateCourseAverageRating(courseId: string): Promise<void> {
    const ratings = await this.ratingModel.find({ courseId });
    const average = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

    await this.courseModel.findByIdAndUpdate(courseId, {
      averageRating: average || 0,
      ratings: ratings.map(r => r.rating),
      ratedBy: ratings.map(r => r.userId),
    });
  }

  // Método adicional para obtener las valoraciones de un curso específico
  async findByCourse(courseId: string): Promise<Rating[]> {
    return this.ratingModel.find({ courseId }).populate('userId');
  }
}