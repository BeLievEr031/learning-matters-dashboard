import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Loader2, AlertCircle, Wand2 } from 'lucide-react';
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
  teacherFormSchema,
  type TeacherFormValues,
} from '../../../schemas/teachers.schema.ts';
import { teachersApi, type Teacher } from '../../../api/teachers.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface TeacherFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherToEdit?: Teacher | null;
  schoolId: string;
  onSuccess: () => void;
}

export function TeacherFormModal({
  open,
  onOpenChange,
  teacherToEdit,
  schoolId,
  onSuccess,
}: TeacherFormModalProps) {
  const isEditing = Boolean(teacherToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      qualification: '',
      joiningDate: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (teacherToEdit) {
        // Format date string to YYYY-MM-DD for date input
        const formattedDate = teacherToEdit.joiningDate
          ? new Date(teacherToEdit.joiningDate).toISOString().split('T')[0]
          : '';

        reset({
          employeeId: teacherToEdit.employeeId,
          firstName: teacherToEdit.firstName,
          lastName: teacherToEdit.lastName,
          email: teacherToEdit.email,
          phone: teacherToEdit.phone || '',
          qualification: teacherToEdit.qualification || '',
          joiningDate: formattedDate,
          status: teacherToEdit.status,
        });
      } else {
        reset({
          employeeId: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          qualification: '',
          joiningDate: new Date().toISOString().split('T')[0],
          status: 'active',
        });
      }
    }
  }, [open, teacherToEdit, reset]);

  const handleGenerateEmployeeId = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setValue('employeeId', `TCH-${randomSuffix}`, { shouldValidate: true });
  };

  const onSubmit = async (values: TeacherFormValues) => {
    setServerError(null);

    if (!schoolId) {
      setServerError('A target school must be active to register faculty members.');
      return;
    }

    try {
      if (isEditing && teacherToEdit) {
        await teachersApi.update(teacherToEdit.id, values);
        toast.success('Teacher record updated successfully');
      } else {
        await teachersApi.create(schoolId, values);
        toast.success('Faculty member onboarded successfully');
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
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Teacher Record' : 'Onboard Faculty Member'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? `Update faculty details and credentials for ${teacherToEdit?.firstName} ${teacherToEdit?.lastName}`
                  : 'Register a new instructor or teacher profile into the school faculty directory.'}
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
          {/* Employee ID & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="employeeId">
                  Employee ID <span className="text-destructive">*</span>
                </Label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleGenerateEmployeeId}
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <Wand2 className="w-2.5 h-2.5" /> Generate
                  </button>
                )}
              </div>
              <Input
                id="employeeId"
                placeholder="e.g. EMP-1042"
                className="font-mono uppercase"
                {...register('employeeId', {
                  onChange: (e) => {
                    setValue('employeeId', e.target.value.toUpperCase(), { shouldValidate: true });
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.employeeId && (
                <p className="text-xs text-destructive">{errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">
                Employment Status <span className="text-destructive">*</span>
              </Label>
              <select
                id="status"
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                {...register('status')}
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="e.g. Eleanor"
                {...register('firstName')}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="e.g. Vance"
                {...register('lastName')}
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Institutional Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. eleanor.vance@school.edu"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                placeholder="e.g. +1 555 234 5678"
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Qualification & Joining Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="qualification">Academic Qualification</Label>
              <Input
                id="qualification"
                placeholder="e.g. M.Sc. Mathematics, B.Ed"
                {...register('qualification')}
                disabled={isSubmitting}
              />
              {errors.qualification && (
                <p className="text-xs text-destructive">{errors.qualification.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input
                id="joiningDate"
                type="date"
                {...register('joiningDate')}
                disabled={isSubmitting}
              />
              {errors.joiningDate && (
                <p className="text-xs text-destructive">{errors.joiningDate.message}</p>
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
              {isEditing ? 'Save Changes' : 'Onboard Teacher'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
