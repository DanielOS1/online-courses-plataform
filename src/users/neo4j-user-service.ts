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
        // Primero eliminamos todos los comentarios del usuario
        await this.deleteUserComments(userId);

        // Después eliminamos todas las relaciones del usuario
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

  async deleteUserComments(userId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          MATCH (u:User {_id: $userId})-[:COMMENTS]->(c:Comment)
          DETACH DELETE c
          `,
          { userId }
        );
      });
    } finally {
      await session.close();
    }
  }
}
