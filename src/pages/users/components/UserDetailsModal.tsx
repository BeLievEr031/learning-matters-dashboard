import {
  Shield,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  KeyRound,
  Layers,
  Crown,
  School,
  GraduationCap,
  BookOpen,
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
import type { UserAccount } from '../../../api/users.api.ts';
import type { UserRole } from '../../../types/auth.types.ts';
import { cn } from '../../../lib/utils.ts';

export interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserAccount | null;
  onEdit?: (user: UserAccount) => void;
  onDelete?: (user: UserAccount) => void;
}

export function UserDetailsModal({
  open,
  onOpenChange,
  user,
  onEdit,
  onDelete,
}: UserDetailsModalProps) {
  if (!user) return null;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          classes: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          icon: Crown,
          scope: 'Global System Control',
        };
      case 'admin':
        return {
          label: 'Campus Admin',
          classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          icon: School,
          scope: 'Full School Operations',
        };
      case 'principal':
        return {
          label: 'School Principal',
          classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          icon: Shield,
          scope: 'Academic & Faculty Leadership',
        };
      case 'class_teacher':
        return {
          label: 'Class Teacher',
          classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          icon: GraduationCap,
          scope: 'Grade & Section Classroom',
        };
      case 'teacher':
        return {
          label: 'Subject Teacher',
          classes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          icon: BookOpen,
          scope: 'Subject Curriculum Delivery',
        };
      case 'student':
      default:
        return {
          label: 'Student',
          classes: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          icon: Layers,
          scope: 'Enrolled Academic Courses',
        };
    }
  };

  const roleInfo = getRoleBadge(user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold truncate">
                  {user.email}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-muted-foreground truncate">
                  User ID: {user.id}
                </DialogDescription>
              </div>
            </div>

            <span
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 shrink-0',
                roleInfo.classes,
              )}
            >
              <RoleIcon className="w-3.5 h-3.5" />
              {roleInfo.label}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Status & Scope Pill Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
            <div>
              <p className="text-muted-foreground font-medium">Account Status</p>
              <div className="flex items-center gap-1.5 font-semibold mt-1">
                {user.isActive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Active (Login Allowed)
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-destructive">Suspended (Blocked)</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-muted-foreground font-medium">RBAC Governance</p>
              <p className="font-semibold text-foreground mt-1">{roleInfo.scope}</p>
            </div>
          </div>

          {/* Account Profile Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Metadata
            </h4>
            <div className="p-3.5 rounded-lg border border-border/60 bg-card space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Email Address:
                </span>
                <span className="font-medium text-foreground">{user.email}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  Assigned Role:
                </span>
                <span className="font-semibold text-foreground uppercase tracking-wide">
                  {user.role}
                </span>
              </div>

              {user.schoolId && (
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-primary" />
                    School Scope ID:
                  </span>
                  <span className="font-mono text-muted-foreground">{user.schoolId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Audit Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                Created on{' '}
                {new Date(user.createdAt).toLocaleDateString(undefined, {
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
                {new Date(user.updatedAt).toLocaleDateString(undefined, {
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
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(user);
                }}
              >
                <Edit2 className="w-3.5 h-3.5 text-primary" />
                Edit Account
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(user);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
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
