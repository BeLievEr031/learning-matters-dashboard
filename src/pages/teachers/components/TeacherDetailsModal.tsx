import { useNavigate } from 'react-router';
import {
  Briefcase,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Layers,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog.tsx';
import { Button } from '../../../components/ui/button.tsx';
import type { Teacher, TeacherStatus } from '../../../api/teachers.api.ts';

interface TeacherDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  onEdit: (teacher: Teacher) => void;
  canManage: boolean;
}

export function TeacherDetailsModal({
  open,
  onOpenChange,
  teacher,
  onEdit,
  canManage,
}: TeacherDetailsModalProps) {
  const navigate = useNavigate();
  if (!teacher) return null;

  const getStatusBadge = (status: TeacherStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Active Faculty
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Clock className="w-3 h-3" /> On Leave
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/60">
            <AlertCircle className="w-3 h-3" /> Inactive
          </span>
        );
      case 'terminated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3 h-3" /> Terminated
          </span>
        );
    }
  };

  const handleGoToAssignments = () => {
    onOpenChange(false);
    navigate(`/assignments?teacherId=${teacher.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-lg uppercase shrink-0">
              {teacher.firstName[0]}
              {teacher.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {teacher.firstName} {teacher.lastName}
                </DialogTitle>
              </div>
              <DialogDescription className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border/60">
                  {teacher.employeeId}
                </span>
                {getStatusBadge(teacher.status)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-6 py-2 text-xs">
          {/* Contact Box */}
          <div className="p-3.5 rounded-lg bg-card/60 border border-border/60 space-y-2.5">
            <div className="flex items-center gap-2.5 text-foreground">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Official Email</p>
                <a
                  href={`mailto:${teacher.email}`}
                  className="font-medium hover:underline text-foreground truncate block"
                >
                  {teacher.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-foreground">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">Phone Number</p>
                <p className="font-medium">
                  {teacher.phone || <span className="italic text-muted-foreground">Not provided</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Credentials Box */}
          <div className="p-3.5 rounded-lg bg-card/60 border border-border/60 space-y-2.5">
            <div className="flex items-center gap-2.5 text-foreground">
              <GraduationCap className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">Qualification</p>
                <p className="font-medium">
                  {teacher.qualification || <span className="italic text-muted-foreground">Unspecified</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-foreground">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">Joining Date</p>
                <p className="font-medium">
                  {teacher.joiningDate
                    ? new Date(teacher.joiningDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : <span className="italic text-muted-foreground">Unspecified</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-foreground">
              <Briefcase className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground">Portal Login Link</p>
                <p className="font-medium">
                  {teacher.userId ? (
                    <span className="text-emerald-500 font-semibold">Linked User Account</span>
                  ) : (
                    <span className="text-muted-foreground italic">Unlinked Record</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoToAssignments}
            className="gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" /> Teaching Allocations
          </Button>

          {canManage && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(teacher);
              }}
              className="gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
