import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Driver, Session } from 'neo4j-driver';
import { Comment } from './interfaces/comment.interface';
import { CommentDto } from './dto/comment.dto';
import { ReactionDto } from './dto/reaction.dto';

@Injectable()
export class CommentsService {
  constructor(@Inject('NEO4J_DRIVER') private readonly neo4j: Driver) {}

  private getSession(): Session {
    return this.neo4j.session();
  }

  async create(courseId: string, userId: string, commentDto: CommentDto): Promise<Comment> {
    const session = this.getSession();
    try {
      // First verify that both user and course exist
      const existenceCheck = await session.run(`
        MATCH (u:User {_id: $userId})
        MATCH (c:Course {_id: $courseId})
        RETURN u, c
      `, { userId, courseId });

      if (existenceCheck.records.length === 0) {
        throw new NotFoundException('User or Course not found');
      }

      const query = `
        MATCH (u:User {_id: $userId})
        MATCH (c:Course {_id: $courseId})
        CREATE (comment:Comment {
          _id: randomUUID(),
          title: $title,
          content: $content,
          authorId: $userId,
          authorName: u.name,
          courseId: $courseId,
          likeCount: 0,
          dislikeCount: 0,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        CREATE (u)-[:COMMENTS]->(comment)
        CREATE (comment)-[:BELONGS_TO]->(c)
        RETURN comment
      `;
      
      const { records } = await session.run(query, {
        userId,
        courseId,
        ...commentDto,
      });
      
      return this.mapCommentProperties(records[0].get('comment'));
    } finally {
      await session.close();
    }
  }

  async findAll(): Promise<Comment[]> {
    const session = this.getSession();
    try {
      const query = `
        MATCH (comment:Comment)
        RETURN comment
        ORDER BY comment.createdAt DESC
      `;
      
      const { records } = await session.run(query);
      return records.map(record => this.mapCommentProperties(record.get('comment')));
    } finally {
      await session.close();
    }
  }

  async findByCourse(courseId: string, limit?: number): Promise<Comment[]> {
    const session = this.getSession();
    try {
      // First verify that course exists
      const courseExists = await session.run(`
        MATCH (c:Course {_id: $courseId})
        RETURN c
      `, { courseId });

      if (courseExists.records.length === 0) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      const query = `
        MATCH (comment:Comment)-[:BELONGS_TO]->(c:Course {_id: $courseId})
        RETURN comment
        ORDER BY comment.createdAt DESC
        ${limit ? 'LIMIT $limit' : ''}
      `;
      
      const { records } = await session.run(query, { 
        courseId, 
        limit: limit ? parseInt(limit.toString()) : null 
      });
      
      return records.map(record => this.mapCommentProperties(record.get('comment')));
    } finally {
      await session.close();
    }
  }

  async getTopComments(courseId: string, limit?: number): Promise<Comment[]> {
    const session = this.getSession();
    try {
      // First verify that course exists
      const courseExists = await session.run(`
        MATCH (c:Course {_id: $courseId})
        RETURN c
      `, { courseId });

      if (courseExists.records.length === 0) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      const query = `
        MATCH (comment:Comment)-[:BELONGS_TO]->(c:Course {_id: $courseId})
        WITH comment, comment.likeCount - comment.dislikeCount as relevance
        RETURN comment
        ORDER BY relevance DESC
        ${limit ? 'LIMIT $limit' : ''}
      `;
      
      const { records } = await session.run(query, { 
        courseId, 
        limit: limit ? parseInt(limit.toString()) : null 
      });
      
      return records.map(record => this.mapCommentProperties(record.get('comment')));
    } finally {
      await session.close();
    }
  }

  async findOne(id: string): Promise<Comment> {
    const session = this.getSession();
    try {
      const query = `
        MATCH (comment:Comment {_id: $id})
        RETURN comment
      `;
      
      const { records } = await session.run(query, { id });
      if (records.length === 0) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }
      
      return this.mapCommentProperties(records[0].get('comment'));
    } finally {
      await session.close();
    }
  }

  async update(id: string, commentDto: CommentDto): Promise<Comment> {
    const session = this.getSession();
    try {
      const query = `
        MATCH (comment:Comment {_id: $id})
        SET comment += {
          title: $title,
          content: $content,
          updatedAt: datetime()
        }
        RETURN comment
      `;
      
      const { records } = await session.run(query, { id, ...commentDto });
      if (records.length === 0) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }
      
      return this.mapCommentProperties(records[0].get('comment'));
    } finally {
      await session.close();
    }
  }

  async remove(id: string): Promise<void> {
    const session = this.getSession();
    try {
      const query = `
        MATCH (comment:Comment {_id: $id})
        DETACH DELETE comment
      `;
      
      const result = await session.run(query, { id });

      const nodesDeleted = result.summary.counters.updates().nodesDeleted;
      if (nodesDeleted === 0) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }
    } finally {
      await session.close();
    }
  }

  async handleReaction(id: string, userId: string, reactionDto: ReactionDto): Promise<Comment> {
    const session = this.getSession();
    try {
      // First verify that both user and comment exist
      const existenceCheck = await session.run(`
        MATCH (u:User {_id: $userId})
        MATCH (c:Comment {_id: $id})
        RETURN u, c
      `, { userId, id });

      if (existenceCheck.records.length === 0) {
        throw new NotFoundException('User or Comment not found');
      }

      // Remove any existing reaction
      await session.run(`
        MATCH (u:User {_id: $userId})-[r:LIKES|DISLIKES]->(c:Comment {_id: $id})
        DELETE r
      `, { userId, id });

      // Update counters and create new reaction
      const query = `
        MATCH (u:User {_id: $userId})
        MATCH (comment:Comment {_id: $id})
        SET comment.likeCount = comment.likeCount + 
          CASE WHEN $type = 'LIKE' THEN 1 
               WHEN comment.likeCount > 0 THEN -1 
               ELSE 0 END,
        comment.dislikeCount = comment.dislikeCount + 
          CASE WHEN $type = 'DISLIKE' THEN 1 
               WHEN comment.dislikeCount > 0 THEN -1 
               ELSE 0 END
        CREATE (u)-[:${reactionDto.type === 'LIKE' ? 'LIKES' : 'DISLIKES'}]->(comment)
        RETURN comment
      `;
      
      const { records } = await session.run(query, {
        id,
        userId,
        type: reactionDto.type
      });
      
      return this.mapCommentProperties(records[0].get('comment'));
    } finally {
      await session.close();
    }
  }

  private mapCommentProperties(node: any): Comment {
    const properties = node.properties;
    return {
      ...properties,
      createdAt: new Date(properties.createdAt),
      updatedAt: new Date(properties.updatedAt)
    };
  }
}