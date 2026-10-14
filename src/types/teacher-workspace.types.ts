export type MaterialType =
  | 'document'
  | 'worksheet'
  | 'presentation'
  | 'video_link'
  | 'reference_link';

export type NoteType =
  | 'lecture_note'
  | 'revision_summary'
  | 'handwritten_note'
  | 'study_guide';

/**
 * Assigned grade model returned by GET /api/v1/teachers/me/grades
 */
export interface AssignedGrade {
  id: string;
  name: string;
  code: string;
  gradeNumber: number;
  section: string;
  boardId: string;
  boardName: string;
  isClassTeacher: boolean;
  totalAssignedSubjects: number;
}

/**
 * Assigned subject model returned within GET /api/v1/teachers/me/grades/:gradeId/subjects
 * and GET /api/v1/teachers/me/subjects
 */
export interface AssignedSubject {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  assignmentId?: string;
  effectiveDate?: string | null;
  status: 'active' | 'inactive';
  totalChapters: number;
}

/**
 * Response for GET /api/v1/teachers/me/grades/:gradeId/subjects
 */
export interface GradeSubjectsResponse {
  grade: {
    id: string;
    name: string;
  };
  subjects: AssignedSubject[];
}

/**
 * Chapter model returned within GET /api/v1/teachers/me/subjects/:subjectId/chapters
 */
export interface AssignedChapter {
  id: string;
  chapterNumber: number;
  title: string;
  description?: string | null;
  status: 'active' | 'inactive';
  totalMaterials: number;
  totalNotes: number;
}

/**
 * Response for GET /api/v1/teachers/me/subjects/:subjectId/chapters
 */
export interface SubjectChaptersResponse {
  subject: {
    id: string;
    name: string;
    code: string;
  };
  chapters: AssignedChapter[];
}

/**
 * Chapter Material entity
 */
export interface ChapterMaterial {
  id: string;
  schoolId: string;
  chapterId: string;
  subjectId?: string;
  teacherId?: string | null;
  title: string;
  description?: string | null;
  materialType: MaterialType;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  externalUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListMaterialsParams {
  materialType?: MaterialType;
  search?: string;
}

export interface CreateMaterialPayload {
  title: string;
  description?: string;
  materialType: MaterialType;
  externalUrl?: string;
  file?: File | null;
}

/**
 * Chapter Study Note entity
 */
export interface ChapterNote {
  id: string;
  schoolId: string;
  chapterId: string;
  subjectId?: string;
  teacherId?: string | null;
  title: string;
  content?: string | null;
  noteType: NoteType;
  isPublished: boolean;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListNotesParams {
  noteType?: NoteType;
  isPublished?: boolean;
  search?: string;
}

export interface CreateNotePayload {
  title: string;
  content?: string;
  noteType: NoteType;
  isPublished?: boolean;
  file?: File | null;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  noteType?: NoteType;
  isPublished?: boolean;
  file?: File | null;
}
