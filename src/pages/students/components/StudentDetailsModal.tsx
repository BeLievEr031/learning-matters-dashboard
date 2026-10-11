import {
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Users,
  Clock,
  ArrowRightLeft,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
import type { Student, StudentStatus } from '../../../api/students.api.ts';
import { cn } from '../../../lib/utils.ts';

export interface StudentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  gradeName?: string;
  onEdit?: (student: Student) => void;
  onTransfer?: (student: Student) => void;
}

export function StudentDetailsModal({
  open,
  onOpenChange,
  student,
  gradeName,
  onEdit,
  onTransfer,
}: StudentDetailsModalProps) {
  if (!student) return null;

  const fullName = `${student.firstName} ${student.lastName}`;

  const formattedDob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active (Enrolled)',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'transferred':
        return {
          label: 'Transferred',
          classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          dot: 'bg-blue-500',
          icon: ArrowRightLeft,
        };
      case 'graduated':
        return {
          label: 'Graduated',
          classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          dot: 'bg-purple-500',
          icon: GraduationCap,
        };
      case 'suspended':
        return {
          label: 'Suspended',
          classes: 'bg-destructive/10 text-destructive border-destructive/20',
          dot: 'bg-destructive',
          icon: AlertTriangle,
        };
      case 'inactive':
      default:
        return {
          label: 'Inactive',
          classes: 'bg-muted text-muted-foreground border-border',
          dot: 'bg-muted-foreground',
          icon: XCircle,
        };
    }
  };

  const statusInfo = getStatusBadge(student.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                {student.firstName.charAt(0).toUpperCase()}
                {student.lastName.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">{fullName}</DialogTitle>
                <DialogDescription className="font-mono text-xs text-muted-foreground">
                  Admission No: {student.admissionNumber}
                </DialogDescription>
              </div>
            </div>

            <span
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 shrink-0',
                statusInfo.classes,
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Academic & Biographical Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs">
            <div>
              <p className="text-muted-foreground font-medium">Assigned Grade</p>
              <p className="font-semibold text-foreground mt-0.5">
                {gradeName || 'Enrolled Grade'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Gender</p>
              <p className="font-semibold text-foreground mt-0.5 capitalize">
                {student.gender || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Date of Birth</p>
              <p className="font-semibold text-foreground mt-0.5">
                {formattedDob || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact & Address
            </h4>
            <div className="p-3 rounded-lg border border-border/60 bg-card space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Email:
                </span>
                <span className="font-medium text-foreground">
                  {student.email || <span className="text-muted-foreground italic">None</span>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  Phone:
                </span>
                <span className="font-medium text-foreground">
                  {student.phone || <span className="text-muted-foreground italic">None</span>}
                </span>
              </div>
              {student.address && (
                <div className="pt-2 border-t border-border/40 flex items-start gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{student.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information Card */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Guardian & Emergency Contacts
            </h4>
            <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Guardian Name:</span>
                <span className="font-semibold text-foreground">
                  {student.guardianName || (
                    <span className="text-muted-foreground italic font-normal">Not provided</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Guardian Phone:</span>
                {student.guardianPhone ? (
                  <a
                    href={`tel:${student.guardianPhone}`}
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {student.guardianPhone}
                  </a>
                ) : (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Guardian Email:</span>
                {student.guardianEmail ? (
                  <a
                    href={`mailto:${student.guardianEmail}`}
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    {student.guardianEmail}
                  </a>
                ) : (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                Admitted on{' '}
                {new Date(student.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                Updated:{' '}
                {new Date(student.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onTransfer && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onTransfer(student);
                }}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                Transfer Grade
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(student);
                }}
              >
                <Edit2 className="w-3.5 h-3.5 text-primary" />
                Edit Profile
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
