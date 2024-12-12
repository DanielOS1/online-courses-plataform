// src/rating/interfaces/rating.interface.ts
export interface RatingRelationship {
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingResponse {
  userId: string;
  courseId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseRatingStats {
  averageRating: number;
  totalRatings: number;
  ratings: number[];
  ratedBy: string[];
}