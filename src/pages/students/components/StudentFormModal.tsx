import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Loader2, AlertCircle, Wand2, User, Users } from 'lucide-react';
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
  studentFormSchema,
  type StudentFormValues,
} from '../../../schemas/students.schema.ts';
import { studentsApi, type Student } from '../../../api/students.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

export interface StudentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeId: string;
  studentToEdit?: Student | null;
  onSuccess: () => void;
}

export function StudentFormModal({
  open,
  onOpenChange,
  gradeId,
  studentToEdit,
  onSuccess,
}: StudentFormModalProps) {
  const isEditing = Boolean(studentToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      admissionNumber: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: undefined,
      email: '',
      phone: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      address: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (studentToEdit) {
        reset({
          admissionNumber: studentToEdit.admissionNumber,
          firstName: studentToEdit.firstName,
          lastName: studentToEdit.lastName,
          dateOfBirth: studentToEdit.dateOfBirth
            ? studentToEdit.dateOfBirth.split('T')[0]
            : '',
          gender: studentToEdit.gender || undefined,
          email: studentToEdit.email || '',
          phone: studentToEdit.phone || '',
          guardianName: studentToEdit.guardianName || '',
          guardianPhone: studentToEdit.guardianPhone || '',
          guardianEmail: studentToEdit.guardianEmail || '',
          address: studentToEdit.address || '',
          status: studentToEdit.status,
        });
      } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        reset({
          admissionNumber: `STU-${new Date().getFullYear()}-${randomNum}`,
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: undefined,
          email: '',
          phone: '',
          guardianName: '',
          guardianPhone: '',
          guardianEmail: '',
          address: '',
          status: 'active',
        });
      }
    }
  }, [open, studentToEdit, reset]);

  const handleGenerateAdmissionNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setValue('admissionNumber', `STU-${new Date().getFullYear()}-${randomNum}`, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: StudentFormValues) => {

    try {
      if (isEditing && studentToEdit) {
        await studentsApi.update(studentToEdit.id, values);
        toast.success(`Student profile updated for ${values.firstName} ${values.lastName}`);
      } else {
        if (!gradeId) {
          throw new Error('Please select an active grade for student admission');
        }
        await studentsApi.create(gradeId, values);
        toast.success(`Student admitted successfully: ${values.firstName} ${values.lastName}`);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Student Profile' : 'New Student Admission'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Update enrolled student biographical records and guardian information.'
                  : 'Enroll a new student into the active academic grade roster.'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {/* Section 1: Admission & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Identity & Personal Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="admissionNumber" className="text-xs">
                  Admission Number <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="admissionNumber"
                    placeholder="e.g. STU-2026-1042"
                    className="font-mono text-sm"
                    {...register('admissionNumber')}
                  />
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateAdmissionNumber}
                      title="Generate random admission code"
                      className="gap-1.5 shrink-0 text-xs"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Generate
                    </Button>
                  )}
                </div>
                {errors.admissionNumber && (
                  <p className="text-xs text-destructive">{errors.admissionNumber.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Aarav"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Sharma"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth" className="text-xs">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs">
                  Gender
                </Label>
                <select
                  id="gender"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('gender')}
                >
                  <option value="">Select gender (optional)</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-xs text-destructive">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
              <span>Contact & Residence</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Student Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="aarav.s@school.edu"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">
                  Student Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address" className="text-xs">
                  Residential Address
                </Label>
                <Input
                  id="address"
                  placeholder="e.g. 14B, Green Avenue, Bangalore"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Guardian Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Guardian & Emergency Contact</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guardianName" className="text-xs">
                  Guardian Full Name
                </Label>
                <Input
                  id="guardianName"
                  placeholder="e.g. Ramesh Sharma"
                  {...register('guardianName')}
                />
                {errors.guardianName && (
                  <p className="text-xs text-destructive">{errors.guardianName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guardianPhone" className="text-xs">
                  Guardian Phone
                </Label>
                <Input
                  id="guardianPhone"
                  placeholder="+91 98111 22334"
                  {...register('guardianPhone')}
                />
                {errors.guardianPhone && (
                  <p className="text-xs text-destructive">{errors.guardianPhone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guardianEmail" className="text-xs">
                  Guardian Email
                </Label>
                <Input
                  id="guardianEmail"
                  type="email"
                  placeholder="ramesh@example.com"
                  {...register('guardianEmail')}
                />
                {errors.guardianEmail && (
                  <p className="text-xs text-destructive">{errors.guardianEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
              <span>Enrollment Status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs">
                  Academic Status
                </Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('status')}
                >
                  <option value="active">Active (Enrolled)</option>
                  <option value="inactive">Inactive</option>
                  <option value="transferred">Transferred</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2">
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
              {isEditing ? 'Save Changes' : 'Confirm Admission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
