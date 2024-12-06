
export enum CourseStatus {
    INICIADO = 'INICIADO',
    EN_CURSO = 'EN_CURSO',
    COMPLETADO = 'COMPLETADO'
  }
  
  export interface CourseProgress {
    courseId: string;
    courseName: string;
    status: CourseStatus;
    startDate: Date;
    lastAccessDate: Date;
    completedClasses: {
      classId: string;
      className: string;
      completedAt: Date;
    }[];
    progressPercentage: number;
  }