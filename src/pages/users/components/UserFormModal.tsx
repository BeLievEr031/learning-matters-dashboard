import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserPlus,
  KeyRound,
  Shield,
  Loader2,
  AlertCircle,
  Wand2,
  Eye,
  EyeOff,
} from 'lucide-react';
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
  createUserFormSchema,
  type CreateUserFormValues,
} from '../../../schemas/users.schema.ts';
import { usersApi, type UserAccount } from '../../../api/users.api.ts';
import type { UserRole } from '../../../types/auth.types.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

export interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: UserAccount | null;
  onSuccess: () => void;
}

const ROLE_OPTIONS: { role: UserRole; title: string; description: string }[] = [
  {
    role: 'super_admin',
    title: 'Super Admin',
    description: 'Global system-wide control across all schools and settings',
  },
  {
    role: 'admin',
    title: 'Campus Admin',
    description: 'School campus management, staff, curriculum, and students',
  },
  {
    role: 'principal',
    title: 'School Principal',
    description: 'Executive academic authority, grades, and faculty oversight',
  },
  {
    role: 'class_teacher',
    title: 'Class Teacher',
    description: 'Sectional classroom management, attendance, and roster',
  },
  {
    role: 'teacher',
    title: 'Subject Teacher',
    description: 'Curriculum delivery and subject evaluations',
  },
  {
    role: 'student',
    title: 'Student',
    description: 'Enrolled learner access to courses and reports',
  },
];

export function UserFormModal({
  open,
  onOpenChange,
  userToEdit,
  onSuccess,
}: UserFormModalProps) {
  const isEditing = Boolean(userToEdit);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [manualActiveStatus, setManualActiveStatus] = useState<boolean | null>(null);
  const effectiveActiveStatus = manualActiveStatus ?? (userToEdit ? userToEdit.isActive : true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'student',
    },
  });

  useEffect(() => {
    if (open) {
      if (userToEdit) {
        reset({
          email: userToEdit.email,
          password: 'TEMPORARY_UNCHANGED_PASSWORD',
          role: userToEdit.role,
        });
      } else {
        reset({
          email: '',
          password: '',
          role: 'student',
        });
      }
    }
  }, [open, userToEdit, reset]);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('password', result, { shouldValidate: true });
    setShowPassword(true);
  };

  const onSubmit = async (values: CreateUserFormValues) => {
    setServerError(null);

    try {
      if (isEditing && userToEdit) {
        await usersApi.update(userToEdit.id, {
          email: values.email,
          role: values.role,
          isActive: effectiveActiveStatus,
        });
        toast.success(`Updated account credentials for ${values.email}`);
      } else {
        await usersApi.create(values);
        toast.success(`User account provisioned successfully for ${values.email}`);
      }
      setManualActiveStatus(null);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Edit User Account' : 'Provision User Credentials'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Update user identity, role authority, and account status.'
                  : 'Create a new authenticated account and assign institutional RBAC permissions.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">
              Account Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Initial Password (only required during creation) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">
                  Initial Password <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGeneratePassword}
                  className="h-6 text-[11px] gap-1 px-1.5 text-primary hover:text-primary"
                >
                  <Wand2 className="w-3 h-3" />
                  Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  className="pr-10 font-mono text-sm"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Role & Permissions Tier <span className="text-destructive">*</span>
            </Label>
            <select
              id="role"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('role')}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.role} value={opt.role}>
                  {opt.title} ({opt.role})
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* In Edit mode: Active Status Toggle */}
          {isEditing && (
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/60">
              <Label className="text-xs font-semibold">Account Login Status</Label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="activeStatus"
                    checked={effectiveActiveStatus}
                    onChange={() => setManualActiveStatus(true)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Active (Allowed Login)
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="activeStatus"
                    checked={!effectiveActiveStatus}
                    onChange={() => setManualActiveStatus(false)}
                    className="accent-destructive"
                  />
                  <span className="font-medium text-muted-foreground">
                    Suspended (Blocked)
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Security & Credential Policy
            </p>
            <p>
              Users will authenticate using their email and assigned password. Permissions adapt instantly based on their designated role tier.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Provision User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
