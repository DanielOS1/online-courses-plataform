import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dto/comment.dto';
import { ReactionDto } from './dto/reaction.dto';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'Returns all comments' })
  findAll() {
    return this.commentsService.findAll();
  }

  @Post(':courseId/:userId')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @UsePipes(new ValidationPipe({skipMissingProperties: true}))
  @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true, transform: true}))
  create(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
    @Body() commentDto: CommentDto
  ) {
    return this.commentsService.create(courseId, userId, commentDto);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get comments by course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit the number of results' })
  @ApiResponse({ status: 200, description: 'Returns comments for a specific course' })
  findByCourse(
    @Param('courseId') courseId: string,
    @Query('limit') limit?: number
  ) {
    return this.commentsService.findByCourse(courseId, limit);
  }

  @Get('course/:courseId/top')
  @ApiOperation({ summary: 'Get top comments by course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit the number of results' })
  @ApiResponse({ status: 200, description: 'Returns top comments for a specific course' })
  getTopComments(
    @Param('courseId') courseId: string,
    @Query('limit') limit?: number
  ) {
    return this.commentsService.getTopComments(courseId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Returns a specific comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @UsePipes(new ValidationPipe({skipMissingProperties: true}))
  @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true, transform: true}))
  update(
    @Param('id') id: string,
    @Body() commentDto: CommentDto
  ) {
    return this.commentsService.update(id, commentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }

  @Post(':id/reaction/:userId')
  @ApiOperation({ summary: 'Handle reaction to comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 201, description: 'Reaction handled successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @UsePipes(new ValidationPipe({skipMissingProperties: true}))
  @UsePipes(new ValidationPipe({forbidNonWhitelisted: true, whitelist: true, transform: true}))
  handleReaction(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() reactionDto: ReactionDto
  ) {
    return this.commentsService.handleReaction(id, userId, reactionDto);
  }
}