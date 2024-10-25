import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReactionDto, ReactionType } from './dto/reaction.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const newComment = new this.commentModel({
      author: createCommentDto.authorId,
      course: createCommentDto.courseId,
      title: createCommentDto.title,
      content: createCommentDto.content,
    });

    return newComment.save();
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel
      .find()
      .populate('author', 'name')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate('author', 'name');
    
    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }
    return comment;
  }

  async findByCourse(courseId: string, limit?: number): Promise<Comment[]> {
    let query = this.commentModel
      .find({ course: courseId })
      .populate('author', 'name')
      .sort({ likeCount: -1, createdAt: -1 });

    if (limit) {
      query = query.limit(limit);
    }

    return query.exec();
  }

  async getTopComments(courseId: string, limit: number = 3): Promise<Comment[]> {
    return this.commentModel
      .find({ course: courseId })
      .populate('author', 'name')
      .sort({ likeCount: -1 })
      .limit(limit)
      .exec();
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentModel.findById(id);
    
    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.author.toString() !== updateCommentDto.authorId) {
      throw new BadRequestException('No tienes permiso para modificar este comentario');
    }

    return this.commentModel.findByIdAndUpdate(
      id,
      {
        title: updateCommentDto.title,
        content: updateCommentDto.content,
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(id);
    
    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.author.toString() !== userId) {
      throw new BadRequestException('No tienes permiso para eliminar este comentario');
    }

    await this.commentModel.findByIdAndDelete(id);
  }

  async handleReaction(commentId: string, reactionDto: ReactionDto): Promise<Comment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const { userId, type } = reactionDto;

    // Remover reacciones existentes del usuario
    await this.removeExistingReactions(comment, userId);

    // Agregar nueva reacción
    if (type === ReactionType.LIKE) {
      comment.likes.push(userId as any);
      comment.likeCount = comment.likes.length;
    } else {
      comment.dislikes.push(userId as any);
      comment.dislikeCount = comment.dislikes.length;
    }

    return comment.save();
  }

  private async removeExistingReactions(comment: CommentDocument, userId: string) {
    const userIdString = userId.toString();
    
    // Remover de likes
    const likeIndex = comment.likes.findIndex(id => id.toString() === userIdString);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    }

    // Remover de dislikes
    const dislikeIndex = comment.dislikes.findIndex(id => id.toString() === userIdString);
    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    }

    // Actualizar contadores
    comment.likeCount = comment.likes.length;
    comment.dislikeCount = comment.dislikes.length;
  }
}