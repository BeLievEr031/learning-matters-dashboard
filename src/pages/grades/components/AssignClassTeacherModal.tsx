import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCheck, Loader2, Search, UserX, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { gradesApi, type Grade } from '../../../api/grades.api.ts';
import { teachersApi } from '../../../api/teachers.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';
import { cn } from '../../../lib/utils.ts';

interface AssignClassTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
  schoolId: string;
  onSuccess: () => void;
}

export function AssignClassTeacherModal({
  open,
  onOpenChange,
  grade,
  schoolId,
  onSuccess,
}: AssignClassTeacherModalProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    grade?.classTeacherId ?? null,
  );
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch school teachers
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers', schoolId, { status: 'active' }],
    queryFn: () =>
      teachersApi.listBySchool(schoolId, { limit: 100, status: 'active' }),
    enabled: Boolean(schoolId && open),
  });

  // Filter teachers by search query
  const filteredTeachers = useMemo(() => {
    const list = teachersData?.data || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) =>
        t.firstName.toLowerCase().includes(q) ||
        t.lastName.toLowerCase().includes(q) ||
        t.employeeId.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q),
    );
  }, [teachersData, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await gradesApi.assignClassTeacher(grade.id, selectedTeacherId);
      if (selectedTeacherId) {
        toast.success(`Class teacher assigned to ${grade.name}`);
      } else {
        toast.success(`Class teacher removed from ${grade.name}`);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setServerError(null);
          setSearch('');
        } else if (grade) {
          setSelectedTeacherId(grade.classTeacherId ?? null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Assign Class Teacher</DialogTitle>
              <DialogDescription>
                Designate a primary faculty member responsible for this section's attendance and class affairs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {grade && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">Target Section: </span>
              <span className="font-bold text-foreground">{grade.name}</span>
              <span className="ml-2 font-mono text-[11px] px-1.5 py-0.5 rounded bg-background border border-border/60">
                {grade.code}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Current: </span>
              <span className="font-semibold text-foreground">
                {grade.classTeacher
                  ? `${grade.classTeacher.firstName} ${grade.classTeacher.lastName}`
                  : 'Unassigned'}
              </span>
            </div>
          </div>
        )}

        {serverError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teacher by name or employee ID..."
              className="pl-9 h-9 text-xs"
              disabled={isSubmitting}
            />
          </div>

          {/* Teacher Selection List */}
          <div className="max-h-60 overflow-y-auto border border-border/60 rounded-lg divide-y divide-border/40">
            {/* Option to Unassign */}
            <label
              className={cn(
                'flex items-center justify-between p-3 cursor-pointer text-xs transition-colors',
                selectedTeacherId === null
                  ? 'bg-primary/5 text-primary'
                  : 'hover:bg-muted/40 text-foreground',
              )}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="classTeacher"
                  checked={selectedTeacherId === null}
                  onChange={() => setSelectedTeacherId(null)}
                  className="text-primary focus:ring-primary h-4 w-4"
                  disabled={isSubmitting}
                />
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">No Class Teacher</p>
                    <p className="text-[11px] text-muted-foreground">
                      Leave this grade section without a designated class teacher
                    </p>
                  </div>
                </div>
              </div>
              {selectedTeacherId === null && (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              )}
            </label>

            {/* Loading teachers state */}
            {isLoadingTeachers && (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-xs">Loading school faculty...</span>
              </div>
            )}

            {/* No teachers found */}
            {!isLoadingTeachers && filteredTeachers.length === 0 && (
              <div className="py-6 text-center text-muted-foreground text-xs">
                {search
                  ? 'No faculty members match your search criteria.'
                  : 'No active teachers found for this school institution.'}
              </div>
            )}

            {/* List of Teachers */}
            {!isLoadingTeachers &&
              filteredTeachers.map((teacher) => {
                const isSelected = selectedTeacherId === teacher.id;
                return (
                  <label
                    key={teacher.id}
                    className={cn(
                      'flex items-center justify-between p-3 cursor-pointer text-xs transition-colors',
                      isSelected
                        ? 'bg-primary/5 text-primary'
                        : 'hover:bg-muted/40 text-foreground',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="radio"
                        name="classTeacher"
                        checked={isSelected}
                        onChange={() => setSelectedTeacherId(teacher.id)}
                        className="text-primary focus:ring-primary h-4 w-4"
                        disabled={isSubmitting}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="font-mono font-medium">{teacher.employeeId}</span>
                          <span>•</span>
                          <span className="truncate">{teacher.email}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 ml-2" />
                    )}
                  </label>
                );
              })}
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
