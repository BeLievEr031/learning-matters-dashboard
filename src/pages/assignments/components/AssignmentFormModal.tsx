import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Label } from '../../../components/ui/label.tsx';
import {
  assignmentFormSchema,
  type AssignmentFormValues,
} from '../../../schemas/assignments.schema.ts';
import {
  assignmentsApi,
  type TeacherAssignmentDetail,
} from '../../../api/assignments.api.ts';
import { teachersApi } from '../../../api/teachers.api.ts';
import { boardsApi } from '../../../api/boards.api.ts';
import { gradesApi } from '../../../api/grades.api.ts';
import { subjectsApi } from '../../../api/subjects.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface AssignmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentToEdit?: TeacherAssignmentDetail | null;
  schoolId: string;
  initialTeacherId?: string;
  initialGradeId?: string;
  initialSubjectId?: string;
  onSuccess: () => void;
}

export function AssignmentFormModal({
  open,
  onOpenChange,
  assignmentToEdit,
  schoolId,
  initialTeacherId,
  initialGradeId,
  initialSubjectId,
  onSuccess,
}: AssignmentFormModalProps) {
  const isEditing = Boolean(assignmentToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  // Selected board and grade to filter subjects during creation
  const [manualBoardId, setManualBoardId] = useState<string>('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>(initialGradeId || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      teacherId: '',
      gradeId: '',
      subjectId: '',
      effectiveDate: '',
      status: 'active',
    },
  });

  // 1. Fetch active teachers
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers', schoolId, { status: 'active' }],
    queryFn: () =>
      teachersApi.listBySchool(schoolId, { limit: 100, status: 'active' }),
    enabled: Boolean(schoolId && open && !isEditing),
  });

  // 2. Fetch boards
  const { data: boardsData } = useQuery({
    queryKey: ['boards', schoolId],
    queryFn: () => boardsApi.list(schoolId, { limit: 100, status: 'active' }),
    enabled: Boolean(schoolId && open && !isEditing),
  });

  const boards = useMemo(() => boardsData?.data || [], [boardsData]);

  const activeBoardId = manualBoardId || boards[0]?.id || '';

  // 3. Fetch grades for chosen board
  const { data: gradesData, isLoading: isLoadingGrades } = useQuery({
    queryKey: ['grades', activeBoardId],
    queryFn: () => gradesApi.list(activeBoardId, { limit: 100, status: 'active' }),
    enabled: Boolean(activeBoardId && open && !isEditing),
  });

  const grades = useMemo(() => gradesData?.data || [], [gradesData]);

  // 4. Fetch subjects for selected grade
  const targetGradeId = selectedGradeId || initialGradeId || '';
  const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects', targetGradeId],
    queryFn: () => subjectsApi.listByGrade(targetGradeId, { limit: 100, status: 'active' }),
    enabled: Boolean(targetGradeId && open && !isEditing),
  });

  const subjects = useMemo(() => subjectsData?.data || [], [subjectsData]);

  useEffect(() => {
    if (open) {
      if (assignmentToEdit) {
        const formattedDate = assignmentToEdit.effectiveDate
          ? new Date(assignmentToEdit.effectiveDate).toISOString().split('T')[0]
          : '';

        reset({
          teacherId: assignmentToEdit.teacherId,
          gradeId: assignmentToEdit.gradeId,
          subjectId: assignmentToEdit.subjectId,
          effectiveDate: formattedDate,
          status: assignmentToEdit.status,
        });
      } else {
        reset({
          teacherId: initialTeacherId || '',
          gradeId: initialGradeId || '',
          subjectId: initialSubjectId || '',
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'active',
        });
      }
    }
  }, [open, assignmentToEdit, initialTeacherId, initialGradeId, initialSubjectId, reset]);

  const onSubmit = async (values: AssignmentFormValues) => {
    setServerError(null);

    try {
      if (isEditing && assignmentToEdit) {
        await assignmentsApi.update(assignmentToEdit.id, {
          status: values.status,
          effectiveDate: values.effectiveDate || null,
        });
        toast.success('Teaching assignment updated successfully');
      } else {
        await assignmentsApi.create(values);
        toast.success('Teacher allocated to subject schedule successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setServerError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Assignment Schedule' : 'Allocate Teacher to Subject'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Update allocation status or effective start date.'
                  : 'Map an active faculty instructor to a grade section and curriculum course.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="mx-6 mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-2">
          {/* Read-only details if editing */}
          {isEditing && assignmentToEdit && (
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Faculty Member:</span>
                <span className="font-bold text-foreground">
                  {assignmentToEdit.teacherFirstName} {assignmentToEdit.teacherLastName} (
                  {assignmentToEdit.teacherEmployeeId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Grade Section:</span>
                <span className="font-semibold text-foreground">
                  {assignmentToEdit.gradeName} ({assignmentToEdit.gradeCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-semibold text-primary font-mono">
                  {assignmentToEdit.subjectName} ({assignmentToEdit.subjectCode})
                </span>
              </div>
            </div>
          )}

          {/* Creation Field Selectors */}
          {!isEditing && (
            <>
              {/* Teacher Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="teacherId">
                  Faculty Instructor <span className="text-destructive">*</span>
                </Label>
                <select
                  id="teacherId"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  {...register('teacherId')}
                  disabled={isSubmitting || isLoadingTeachers}
                >
                  <option value="">Select faculty member...</option>
                  {(teachersData?.data || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.employeeId}) • {t.qualification || 'Teacher'}
                    </option>
                  ))}
                </select>
                {errors.teacherId && (
                  <p className="text-xs text-destructive">{errors.teacherId.message}</p>
                )}
              </div>

              {/* Board and Grade Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="boardSelect">Curriculum Board</Label>
                  <select
                    id="boardSelect"
                    value={activeBoardId}
                    onChange={(e) => { setManualBoardId(e.target.value); setSelectedGradeId(''); }}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gradeId">
                    Grade & Section <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="gradeId"
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    {...register('gradeId', {
                      onChange: (e) => setSelectedGradeId(e.target.value),
                    })}
                    disabled={isSubmitting || isLoadingGrades || !activeBoardId}
                  >
                    <option value="">Select section...</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.code})
                      </option>
                    ))}
                  </select>
                  {errors.gradeId && (
                    <p className="text-xs text-destructive">{errors.gradeId.message}</p>
                  )}
                </div>
              </div>

              {/* Subject Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="subjectId">
                  Subject Course <span className="text-destructive">*</span>
                </Label>
                <select
                  id="subjectId"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  {...register('subjectId')}
                  disabled={isSubmitting || isLoadingSubjects || !targetGradeId}
                >
                  <option value="">
                    {targetGradeId
                      ? subjects.length === 0 && !isLoadingSubjects
                        ? 'No subjects mapped to this section'
                        : 'Select subject...'
                      : 'Select a grade section first...'}
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
                {errors.subjectId && (
                  <p className="text-xs text-destructive">{errors.subjectId.message}</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Only subjects assigned to the selected section are available.
                </p>
              </div>
            </>
          )}

          {/* Effective Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="effectiveDate">Effective Start Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                {...register('effectiveDate')}
                disabled={isSubmitting}
              />
              {errors.effectiveDate && (
                <p className="text-xs text-destructive">{errors.effectiveDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">
                Allocation Status <span className="text-destructive">*</span>
              </Label>
              <select
                id="status"
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                {...register('status')}
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Allocation' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
