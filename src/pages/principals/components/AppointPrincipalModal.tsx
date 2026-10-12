import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Loader2,
  AlertCircle,
  Wand2,
  UserCheck,
  KeyRound,
  ShieldAlert,
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
  principalFormSchema,
  type PrincipalFormValues,
} from '../../../schemas/principals.schema.ts';
import { principalsApi, type Principal } from '../../../api/principals.api.ts';
import { usersApi } from '../../../api/users.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

export interface AppointPrincipalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolName?: string;
  currentPrincipal?: Principal | null;
  onSuccess: () => void;
}

export function AppointPrincipalModal({
  open,
  onOpenChange,
  schoolId,
  schoolName,
  currentPrincipal,
  onSuccess,
}: AppointPrincipalModalProps) {
  const isEditing = Boolean(currentPrincipal);
  const [serverError, setServerError] = useState<string | null>(null);

  // Toggle whether to link an existing user or create a new user account inline
  const [manualAccountMode, setManualAccountMode] = useState<'existing' | 'new' | null>(null);
  const accountMode = manualAccountMode ?? (isEditing ? 'existing' : 'new');
  const [newAccountPassword, setNewAccountPassword] = useState('');

  // Fetch users with potential leadership roles
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', { limit: 100 }],
    queryFn: () => usersApi.list({ limit: 100 }),
    enabled: Boolean(open && accountMode === 'existing'),
    staleTime: 5 * 60 * 1000,
  });

  const availableUsers = useMemo(
    () => usersData?.data || [],
    [usersData?.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PrincipalFormValues>({
    resolver: zodResolver(principalFormSchema),
    defaultValues: {
      userId: '',
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (open) {
      if (currentPrincipal) {
        reset({
          userId: currentPrincipal.userId,
          employeeId: currentPrincipal.employeeId,
          firstName: currentPrincipal.firstName,
          lastName: currentPrincipal.lastName,
          email: currentPrincipal.email,
          phone: currentPrincipal.phone || '',
          status: currentPrincipal.status,
        });
      } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        reset({
          userId: '',
          employeeId: `PRN-${new Date().getFullYear()}-${randomNum}`,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          status: 'active',
        });
      }
    }
  }, [open, currentPrincipal, reset]);

  const handleGenerateEmployeeId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setValue('employeeId', `PRN-${new Date().getFullYear()}-${randomNum}`, {
      shouldValidate: true,
    });
  };

  const handleSelectExistingUser = (selectedUserId: string) => {
    setValue('userId', selectedUserId, { shouldValidate: true });
    const foundUser = availableUsers.find((u) => u.id === selectedUserId);
    if (foundUser && !getValues('email')) {
      setValue('email', foundUser.email, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: PrincipalFormValues) => {
    setServerError(null);

    try {
      let finalUserId = values.userId;

      // If user chose to create a new user account inline
      if (!isEditing && accountMode === 'new') {
        if (!newAccountPassword || newAccountPassword.length < 8) {
          throw new Error('Password for new principal user account must be at least 8 characters');
        }

        const newUser = await usersApi.create({
          email: values.email,
          password: newAccountPassword,
          role: 'principal',
        });
        finalUserId = newUser.id;
      }

      if (!finalUserId) {
        throw new Error('Please select or create a user account for the principal');
      }

      const payload: PrincipalFormValues = {
        ...values,
        userId: finalUserId,
      };

      await principalsApi.upsert(schoolId, payload);
      toast.success(
        isEditing
          ? `Updated principal appointment for ${values.firstName} ${values.lastName}`
          : `Successfully appointed ${values.firstName} ${values.lastName} as School Principal`,
      );
      setManualAccountMode(null);
      setNewAccountPassword('');
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
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Update Principal Appointment' : 'Appoint School Principal'}
              </DialogTitle>
              <DialogDescription>
                {schoolName
                  ? `Assign institutional leadership for ${schoolName}.`
                  : 'Assign institutional leadership and administrative oversight for this campus.'}
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

        {isEditing && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Updating or reassigning will update the institutional principal profile record for this school. Existing administrative authority will be transferred.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {/* Section 1: User Account Association */}
          {!isEditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  User Account Credentials
                </span>

                <div className="flex rounded-md border border-input bg-muted/40 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setManualAccountMode('new')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      accountMode === 'new'
                        ? 'bg-background text-foreground shadow-xs font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Create New Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualAccountMode('existing')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      accountMode === 'existing'
                        ? 'bg-background text-foreground shadow-xs font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Link Existing User
                  </button>
                </div>
              </div>

              {accountMode === 'existing' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="existingUserId" className="text-xs">
                    Select User Account with Principal Role <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="existingUserId"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    onChange={(e) => handleSelectExistingUser(e.target.value)}
                    disabled={isLoadingUsers}
                  >
                    <option value="">Select a user account</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} ({u.role})
                      </option>
                    ))}
                  </select>
                  {errors.userId && (
                    <p className="text-xs text-destructive">{errors.userId.message}</p>
                  )}
                  {availableUsers.length === 0 && !isLoadingUsers && (
                    <p className="text-[11px] text-muted-foreground">
                      No user accounts found. Switch to &quot;Create New Account&quot; to provision credentials.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <Label htmlFor="newAccountPassword" className="text-xs flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    Initial Password for Principal Login <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="newAccountPassword"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newAccountPassword}
                    onChange={(e) => setNewAccountPassword(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    A user account with role <strong>principal</strong> will be automatically provisioned with the email specified below.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Biographical & Institutional Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Biographical & Staff Records</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="employeeId" className="text-xs">
                  Institutional Employee ID <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="employeeId"
                    placeholder="e.g. PRN-2026-001"
                    className="font-mono text-sm"
                    {...register('employeeId')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateEmployeeId}
                    className="gap-1.5 shrink-0 text-xs"
                    title="Generate code"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Generate
                  </Button>
                </div>
                {errors.employeeId && (
                  <p className="text-xs text-destructive">{errors.employeeId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Dr. Rajesh"
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
                  placeholder="e.g. Varma"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Official Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="principal@school.edu"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">
                  Contact Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 98450 11223"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="status" className="text-xs">
                  Appointment Status
                </Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('status')}
                >
                  <option value="active">Active (In Tenure)</option>
                  <option value="inactive">Inactive / On Leave</option>
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
              {isEditing ? 'Save Appointment Changes' : 'Confirm Principal Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
