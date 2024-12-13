export interface Comment {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  courseId: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  updatedAt: Date;
}