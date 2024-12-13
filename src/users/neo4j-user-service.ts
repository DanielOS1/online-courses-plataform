import { Injectable, Inject } from '@nestjs/common';
import { Driver, Session } from 'neo4j-driver';
import { User } from './../redis/interfaces/user.interface';

@Injectable()
export class Neo4jUserService {
  constructor(
    @Inject('NEO4J_DRIVER')
    private readonly neo4jDriver: Driver
  ) {}

  private getSession(): Session {
    return this.neo4jDriver.session();
  }

  async createUserNode(user: User): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          CREATE (u:User {
            _id: $userId,
            name: $username
          })
          `,
          {
            userId: user._id,
            username: user.username
          }
        );
      });
    } finally {
      await session.close();
    }
  }

  async updateUserNode(user: User): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          MATCH (u:User {_id: $userId})
          SET u.name = $username
          `,
          {
            userId: user._id,
            username: user.username
          }
        );
      });
    } finally {
      await session.close();
    }
  }

  async deleteUserNode(userId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        // Primero eliminamos todas las relaciones del usuario
        await tx.run(
          `
          MATCH (u:User {_id: $userId})
          OPTIONAL MATCH (u)-[r]-()
          DELETE r
          `,
          { userId }
        );

        // Luego eliminamos el nodo del usuario
        await tx.run(
          `
          MATCH (u:User {_id: $userId})
          DELETE u
          `,
          { userId }
        );
      });
    } finally {
      await session.close();
    }
  }
/*
  async getUserComments(userId: string): Promise<any[]> {
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        const response = await tx.run(
          `
          MATCH (u:User {_id: $userId})-[:COMMENTS]->(c:Comment)-[:BELONGS_TO]->(course:Course)
          RETURN c, course
          `,
          { userId }
        );
        return response.records.map(record => ({
          comment: record.get('c').properties,
          course: record.get('course').properties
        }));
      });
      return result;
    } finally {
      await session.close();
    }
  }

  async getUserRatings(userId: string): Promise<any[]> {
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        const response = await tx.run(
          `
          MATCH (u:User {_id: $userId})-[r:RATED]->(c:Course)
          RETURN c.name as courseName, r.rating as rating, r.createdAt as createdAt
          `,
          { userId }
        );
        return response.records.map(record => ({
          courseName: record.get('courseName'),
          rating: record.get('rating').toNumber(),
          createdAt: record.get('createdAt')
        }));
      });
      return result;
    } finally {
      await session.close();
    }
  }

  async addCommentLike(userId: string, commentId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        // Verificar si ya existe un LIKE o DISLIKE
        await tx.run(
          `
          MATCH (u:User {_id: $userId}), (c:Comment {_id: $commentId})
          OPTIONAL MATCH (u)-[r:LIKES|DISLIKES]->(c)
          DELETE r
          CREATE (u)-[:LIKES]->(c)
          `,
          { userId, commentId }
        );
      });
    } finally {
      await session.close();
    }
  }

  async addCommentDislike(userId: string, commentId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        // Verificar si ya existe un LIKE o DISLIKE
        await tx.run(
          `
          MATCH (u:User {_id: $userId}), (c:Comment {_id: $commentId})
          OPTIONAL MATCH (u)-[r:LIKES|DISLIKES]->(c)
          DELETE r
          CREATE (u)-[:DISLIKES]->(c)
          `,
          { userId, commentId }
        );
      });
    } finally {
      await session.close();
    }
  }

  async removeCommentReaction(userId: string, commentId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          MATCH (u:User {_id: $userId})-[r:LIKES|DISLIKES]->(c:Comment {_id: $commentId})
          DELETE r
          `,
          { userId, commentId }
        );
      });
    } finally {
      await session.close();
    }
  }
*/
}
