import { CourseProgress } from "./course-progress.interface";

export interface User {
    _id: string;
    email: string;
    username: string;
    password: string;
    role: string;
    enrolledCourses: string[];
    instructorCourses: string[];
    coursesProgress: { [courseId: string]: CourseProgress };
  }