import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2 } from 'lucide-react';
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
import { schoolFormSchema, type SchoolFormValues } from '../../../schemas/schools.schema.ts';
import { schoolsApi, type School } from '../../../api/schools.api.ts';
import { getApiErrorMessage } from '../../../api/client.ts';

interface SchoolFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolToEdit?: School | null;
  onSuccess: () => void;
}

export function SchoolFormModal({
  open,
  onOpenChange,
  schoolToEdit,
  onSuccess,
}: SchoolFormModalProps) {
  const isEditing = Boolean(schoolToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      name: '',
      code: '',
      status: 'active',
      address: '',
      city: '',
      state: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (schoolToEdit) {
      reset({
        name: schoolToEdit.name,
        code: schoolToEdit.code,
        status: schoolToEdit.status,
        address: schoolToEdit.address || '',
        city: schoolToEdit.city || '',
        state: schoolToEdit.state || '',
        country: schoolToEdit.country || '',
        phone: schoolToEdit.phone || '',
        email: schoolToEdit.email || '',
        website: schoolToEdit.website || '',
        logoUrl: schoolToEdit.logoUrl || '',
      });
    } else {
      reset({
        name: '',
        code: '',
        status: 'active',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        logoUrl: '',
      });
    }
  }, [schoolToEdit, reset]);

  const onSubmit = async (values: SchoolFormValues) => {
    try {
      if (isEditing && schoolToEdit) {
        await schoolsApi.update(schoolToEdit.id, values);
        toast.success(`School "${values.name}" updated successfully`);
      } else {
        await schoolsApi.create(values);
        toast.success(`School "${values.name}" registered successfully`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const msg = getApiErrorMessage(error);
      toast.error(isEditing ? 'Failed to update school' : 'Failed to register school', {
        description: msg,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? () => {} : onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Building2 className="w-5 h-5" />
          </div>
          <DialogTitle>{isEditing ? 'Edit School Details' : 'Register New School'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update institution profile, contact details, and operational status.'
              : 'Add an educational institution into the multi-tenant system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* General Information Section */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Institutional Profile
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Delhi Public School"
                  {...register('name')}
                />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code">Unique Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g. DPS-DELHI"
                  disabled={isEditing}
                  {...register('code')}
                />
                {errors.code && <p className="text-destructive text-xs">{errors.code.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Operational Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('status')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                {errors.status && <p className="text-destructive text-xs">{errors.status.message}</p>}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-3 pt-2 border-t border-border/40">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Campus Location
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Street address" {...register('address')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="e.g. New Delhi" {...register('city')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" placeholder="e.g. Delhi" {...register('state')} />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="e.g. India" {...register('country')} />
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="space-y-3 pt-2 border-t border-border/40">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Contact & Web
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Official Phone</Label>
                <Input id="phone" placeholder="+91 11 2345 6789" {...register('phone')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Official Email</Label>
                <Input id="email" type="email" placeholder="contact@school.edu" {...register('email')} />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" placeholder="https://www.school.edu" {...register('website')} />
                {errors.website && <p className="text-destructive text-xs">{errors.website.message}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="logoUrl">Logo Image URL</Label>
                <Input id="logoUrl" placeholder="https://example.com/logo.png" {...register('logoUrl')} />
                {errors.logoUrl && <p className="text-destructive text-xs">{errors.logoUrl.message}</p>}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 font-semibold">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Register School'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
