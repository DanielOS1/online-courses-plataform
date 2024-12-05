// src/rating/rating.service.ts
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Driver, Session } from 'neo4j-driver';
import { RatingResponse, CourseRatingStats } from './interfaces/rating.interface';

@Injectable()
export class RatingService {
  constructor(
    @Inject('NEO4J_DRIVER') private readonly neo4j: Driver,
  ) {}

  private getSession(): Session {
    return this.neo4j.session();
  }

  async create(courseId: string, userId: string, rating: number): Promise<RatingResponse> {
    const session = this.getSession();

    try {
      // Verificar si el usuario ya ha valorado este curso
      const existingRating = await session.run(`
        MATCH (u:User {_id: $userId})-[r:RATED]->(c:Course {_id: $courseId})
        RETURN r
      `, {
        userId: userId,
        courseId: courseId
      });

      if (existingRating.records.length > 0) {
        throw new BadRequestException('El usuario ya ha valorado este curso');
      }

      // Verificar si el curso existe
      const courseExists = await session.run(`
        MATCH (c:Course {_id: $courseId})
        RETURN c
      `, {
        courseId: courseId
      });

      if (courseExists.records.length === 0) {
        throw new NotFoundException('Curso no encontrado');
      }

      // Crear la relación de rating
      const result = await session.run(`
        MATCH (u:User {_id: $userId})
        MATCH (c:Course {_id: $courseId})
        CREATE (u)-[r:RATED {
          rating: $rating,
          createdAt: datetime(),
          updatedAt: datetime()
        }]->(c)
        RETURN r, u, c
      `, {
        userId: userId,
        courseId: courseId,
        rating: rating
      });

      const record = result.records[0];
      const relationship = record.get('r').properties;

      // Actualizar estadísticas del curso
      await this.updateCourseAverageRating(courseId, session);

      return {
        userId: userId,
        courseId: courseId,
        rating: relationship.rating,
        createdAt: new Date(relationship.createdAt),
        updatedAt: new Date(relationship.updatedAt)
      };
    } finally {
      await session.close();
    }
  }

  async findAll(): Promise<RatingResponse[]> {
    const session = this.getSession();

    try {
      const result = await session.run(`
        MATCH (u:User)-[r:RATED]->(c:Course)
        RETURN u._id as userId, c._id as courseId, r.rating as rating, 
               r.createdAt as createdAt, r.updatedAt as updatedAt
      `);

      return result.records.map(record => ({
        userId: record.get('userId'),
        courseId: record.get('courseId'),
        rating: record.get('rating').toNumber(),
        createdAt: new Date(record.get('createdAt')),
        updatedAt: new Date(record.get('updatedAt'))
      }));
    } finally {
      await session.close();
    }
  }

  async findOne(userId: string, courseId: string): Promise<RatingResponse> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (u:User {_id: $userId})-[r:RATED]->(c:Course {_id: $courseId})
        RETURN u._id as userId, c._id as courseId, r.rating as rating,
               r.createdAt as createdAt, r.updatedAt as updatedAt
      `, { userId, courseId });

      if (result.records.length === 0) {
        throw new NotFoundException('Valoración no encontrada');
      }

      const record = result.records[0];
      return {
        userId: record.get('userId'),
        courseId: record.get('courseId'),
        rating: record.get('rating').toNumber(),
        createdAt: new Date(record.get('createdAt')),
        updatedAt: new Date(record.get('updatedAt'))
      };
    } finally {
      await session.close();
    }
  }

  async update(userId: string, courseId: string, rating: number): Promise<RatingResponse> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (u:User {_id: $userId})-[r:RATED]->(c:Course {_id: $courseId})
        SET r.rating = $rating,
            r.updatedAt = datetime()
        RETURN u._id as userId, c._id as courseId, r.rating as rating,
               r.createdAt as createdAt, r.updatedAt as updatedAt
      `, {
        userId,
        courseId,
        rating
      });

      if (result.records.length === 0) {
        throw new NotFoundException('Valoración no encontrada');
      }

      // Actualizar estadísticas del curso
      await this.updateCourseAverageRating(courseId, session);

      const record = result.records[0];
      return {
        userId: record.get('userId'),
        courseId: record.get('courseId'),
        rating: record.get('rating').toNumber(),
        createdAt: new Date(record.get('createdAt')),
        updatedAt: new Date(record.get('updatedAt'))
      };
    } finally {
      await session.close();
    }
  }

  async remove(userId: string, courseId: string): Promise<void> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (u:User {_id: $userId})-[r:RATED]->(c:Course {_id: $courseId})
        DELETE r
        RETURN count(r) as deletedCount
      `, { userId, courseId });

      if (result.records[0].get('deletedCount').toNumber() === 0) {
        throw new NotFoundException('Valoración no encontrada');
      }

      // Actualizar estadísticas del curso
      await this.updateCourseAverageRating(courseId, session);
    } finally {
      await session.close();
    }
  }

  async findByCourse(courseId: string): Promise<RatingResponse[]> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (u:User)-[r:RATED]->(c:Course {_id: $courseId})
        RETURN u._id as userId, c._id as courseId, r.rating as rating,
               r.createdAt as createdAt, r.updatedAt as updatedAt
        ORDER BY r.createdAt DESC
      `, { courseId });

      return result.records.map(record => ({
        userId: record.get('userId'),
        courseId: record.get('courseId'),
        rating: record.get('rating').toNumber(),
        createdAt: new Date(record.get('createdAt')),
        updatedAt: new Date(record.get('updatedAt'))
      }));
    } finally {
      await session.close();
    }
  }

  private async updateCourseAverageRating(courseId: string, session: Session): Promise<void> {
    const result = await session.run(`
      MATCH (c:Course {_id: $courseId})<-[r:RATED]-(u:User)
      WITH c, 
           avg(r.rating) as avgRating,
           count(r) as totalRatings,
           collect(r.rating) as ratingsList,
           collect(u._id) as usersList
      SET c.averageRating = avgRating,
          c.totalRatings = totalRatings,
          c.ratings = ratingsList,
          c.ratedBy = usersList
      RETURN c
    `, { courseId });
  }

  async getCourseRatingStats(courseId: string): Promise<CourseRatingStats> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (c:Course {_id: $courseId})<-[r:RATED]-(u:User)
        WITH c, 
             avg(r.rating) as avgRating,
             count(r) as totalRatings,
             collect(r.rating) as ratingsList,
             collect(u._id) as usersList
        RETURN avgRating, totalRatings, ratingsList, usersList
      `, { courseId });

      if (result.records.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratings: [],
          ratedBy: []
        };
      }

      const record = result.records[0];
      return {
        averageRating: record.get('avgRating'),
        totalRatings: record.get('totalRatings').toNumber(),
        ratings: record.get('ratingsList').map(r => r.toNumber()),
        ratedBy: record.get('usersList')
      };
    } finally {
      await session.close();
    }
  }
}