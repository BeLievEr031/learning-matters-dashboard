import {
  Award,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Plus,
  ShieldCheck,
  School as SchoolIcon,
  UserX,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card.tsx';
import { Button } from '../../../components/ui/button.tsx';
import type { Principal } from '../../../api/principals.api.ts';
import { cn } from '../../../lib/utils.ts';

export interface PrincipalDetailsCardProps {
  principal: Principal | null;
  schoolName: string;
  schoolCode?: string;
  canManage: boolean;
  onAppointOrEdit: () => void;
}

export function PrincipalDetailsCard({
  principal,
  schoolName,
  schoolCode,
  canManage,
  onAppointOrEdit,
}: PrincipalDetailsCardProps) {
  if (!principal) {
    return (
      <Card className="border-dashed border-border/80 bg-card/40 hover:bg-card/60 transition-colors">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20">
            <UserX className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-semibold text-foreground">
              No Principal Appointed
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {schoolName} currently has a vacant leadership post. Appointing an institutional principal provides executive campus governance and administrative privileges.
            </p>
          </div>
          {canManage && (
            <div className="pt-2">
              <Button size="sm" onClick={onAppointOrEdit} className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Appoint School Principal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const fullName = `${principal.firstName} ${principal.lastName}`;
  const isActive = principal.status === 'active';

  return (
    <Card className="border-border/80 shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/60">
      <div className="h-2.5 bg-gradient-to-r from-amber-500 via-primary to-indigo-500" />
      <CardContent className="p-6 space-y-6">
        {/* Header: Institutional Context + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">{schoolName}</h3>
                {schoolCode && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {schoolCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <SchoolIcon className="w-3.5 h-3.5" />
                Institutional Leadership & Executive Authority
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs font-medium px-3 py-1 rounded-full border inline-flex items-center gap-1.5 shrink-0',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border-border',
              )}
            >
              {isActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Active (In Tenure)
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  Inactive / On Leave
                </>
              )}
            </span>

            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAppointOrEdit}
                className="gap-1.5 text-xs h-8"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Update Appointment
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Identity & Avatar */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20 shrink-0 shadow-inner">
              {principal.firstName.charAt(0).toUpperCase()}
              {principal.lastName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-base font-bold text-foreground truncate">{fullName}</h4>
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded inline-block">
                ID: {principal.employeeId}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Governance Head</span>
              </div>
            </div>
          </div>

          {/* Column 2: Contact Details */}
          <div className="space-y-2.5 text-xs bg-muted/20 p-3.5 rounded-xl border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                Email Address:
              </span>
              <a
                href={`mailto:${principal.email}`}
                className="font-medium text-foreground hover:text-primary hover:underline truncate max-w-[170px]"
              >
                {principal.email}
              </a>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                Direct Phone:
              </span>
              {principal.phone ? (
                <a
                  href={`tel:${principal.phone}`}
                  className="font-medium text-foreground hover:text-primary hover:underline font-mono"
                >
                  {principal.phone}
                </a>
              ) : (
                <span className="text-muted-foreground italic">None provided</span>
              )}
            </div>
          </div>

          {/* Column 3: Tenure Timestamps */}
          <div className="space-y-2.5 text-xs bg-muted/20 p-3.5 rounded-xl border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Appointed On:
              </span>
              <span className="font-semibold text-foreground">
                {new Date(principal.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Last Record Update:
              </span>
              <span className="text-muted-foreground">
                {new Date(principal.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
