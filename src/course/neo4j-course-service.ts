import { Injectable, Inject } from '@nestjs/common';
import { Driver, Session, Record, QueryResult } from 'neo4j-driver';
import { Course } from './schema/course.schema';

@Injectable()
export class Neo4jCourseService {
  constructor(
    @Inject('NEO4J_DRIVER') private readonly driver: Driver,
  ) {}

  private getSession(): Session {
    return this.driver.session();
  }

  async createCourseNode(course: Course): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          CREATE (c:Course {
            _id: $courseId,
            averageRating: 0,
            totalRatings: 0
          })
          `,
          {
            courseId: course._id.toString(),
          }
        );
      });
    } finally {
      await session.close();
    }
  }
/*
  async updateCourseNode(courseId: string, averageRating?: number, totalRatings?: number): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        let updateQuery = 'MATCH (c:Course {_id: $courseId})';
        const params: any = { courseId };

        if (averageRating !== undefined && totalRatings !== undefined) {
          updateQuery += ' SET c.averageRating = $averageRating, c.totalRatings = $totalRatings';
          params.averageRating = averageRating;
          params.totalRatings = totalRatings;
        }

        await tx.run(updateQuery, params);
      });
    } finally {
      await session.close();
    }
  }
*/
  async deleteCourseNode(courseId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        // Eliminar todos los comentarios relacionados con el curso
        await tx.run(
          `
          MATCH (c:Course {_id: $courseId})<-[:BELONGS_TO]-(comment:Comment)
          DETACH DELETE comment
          `,
          { courseId }
        );

        // Eliminar todas las calificaciones relacionadas con el curso
        await tx.run(
          `
          MATCH (u:User)-[:RATED]->(c:Course {_id: $courseId})
          DETACH DELETE c
          `,
          { courseId }
        );

        // Finalmente, eliminar el nodo del curso
        await tx.run(
          `
          MATCH (c:Course {_id: $courseId})
          DETACH DELETE c
          `,
          { courseId }
        );
      });
    } finally {
      await session.close();
    }
  }
}