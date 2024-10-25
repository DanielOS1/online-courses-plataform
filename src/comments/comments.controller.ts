import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    Query 
  } from '@nestjs/common';
  import { CommentService } from './comments.service';
  import { CreateCommentDto } from './dto/create-comment.dto';
  import { UpdateCommentDto } from './dto/update-comment.dto';
  import { ReactionDto } from './dto/reaction.dto';
  
  @Controller('comments')
  export class CommentController {
    constructor(private readonly commentService: CommentService) {}
  
    @Post()
    create(@Body() createCommentDto: CreateCommentDto) {
      return this.commentService.create(createCommentDto);
    }
  
    @Get()
    findAll() {
      return this.commentService.findAll();
    }
  
    @Get('course/:courseId')
    findByCourse(
      @Param('courseId') courseId: string,
      @Query('limit') limit?: number,
    ) {
      return this.commentService.findByCourse(courseId, limit);
    }
  
    @Get('course/:courseId/top')
    getTopComments(
      @Param('courseId') courseId: string,
      @Query('limit') limit?: number,
    ) {
      return this.commentService.getTopComments(courseId, limit);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.commentService.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
      return this.commentService.update(id, updateCommentDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string, @Body('userId') userId: string) {
      return this.commentService.remove(id, userId);
    }
  
    @Post(':id/reaction')
    handleReaction(
      @Param('id') id: string,
      @Body() reactionDto: ReactionDto,
    ) {
      return this.commentService.handleReaction(id, reactionDto);
    }
  }