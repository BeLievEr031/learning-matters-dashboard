import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  IdCard,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog.tsx';
import type { Student } from '../../../api/students.api.ts';

interface StudentDetailsModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeName?: string;
}

export function StudentDetailsModal({
  student,
  open,
  onOpenChange,
  gradeName,
}: StudentDetailsModalProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center shrink-0 border border-primary/20">
              {student.firstName[0]}
              {student.lastName ? student.lastName[0] : ''}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {student.firstName} {student.lastName}
              </DialogTitle>
              <DialogDescription className="text-xs flex items-center gap-2 mt-0.5">
                <span className="font-mono text-foreground font-semibold">
                  Adm: {student.admissionNumber}
                </span>
                {gradeName && (
                  <>
                    <span>•</span>
                    <span>{gradeName}</span>
                  </>
                )}
                <span>•</span>
                <span className="capitalize px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                  {student.status}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* General Student Info */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 text-primary" />
              Student Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <p className="font-semibold capitalize text-foreground mt-0.5">
                  {student.gender || 'Not specified'}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Date of Birth:</span>
                <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {student.dateOfBirth
                    ? new Date(student.dateOfBirth).toLocaleDateString()
                    : 'Not provided'}
                </p>
              </div>

              {student.email && (
                <div>
                  <span className="text-muted-foreground">Email Address:</span>
                  <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                    {student.email}
                  </p>
                </div>
              )}

              {student.phone && (
                <div>
                  <span className="text-muted-foreground">Contact Phone:</span>
                  <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                    {student.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Parent & Guardian Contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Guardian Name:</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {student.guardianName || 'Not specified'}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Guardian Phone:</span>
                <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                  {student.guardianPhone || 'Not provided'}
                </p>
              </div>

              {student.guardianEmail && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Guardian Email:</span>
                  <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                    {student.guardianEmail}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address info if available */}
          {student.address && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Residential Address
              </h4>
              <p className="text-xs text-foreground font-medium">{student.address}</p>
            </div>
          )}

          {/* Enrollment timeline */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
            <span>Enrolled: {new Date(student.createdAt).toLocaleDateString()}</span>
            <span>Record ID: {student.id.slice(0, 8)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
