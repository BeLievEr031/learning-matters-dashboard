import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  Plus,
  RefreshCw,
  School as SchoolIcon,
  ShieldCheck,
  Building2,
  CheckCircle2,
  UserX,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import { principalsApi } from '../../api/principals.api.ts';
import { schoolsApi, type School } from '../../api/schools.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { PrincipalDetailsCard } from './components/PrincipalDetailsCard.tsx';
import { AppointPrincipalModal } from './components/AppointPrincipalModal.tsx';
import { cn } from '../../lib/utils.ts';
import { useNavigate } from 'react-router';

export function PrincipalsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, getEffectiveRole, activeSchoolId, setActiveSchoolId } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const isSuperAdmin = effectiveRole === 'super_admin';
  const canManage = isSuperAdmin || effectiveRole === 'admin';

  // 1. Fetch schools list if super_admin
  const { data: schoolsData, isLoading: isLoadingSchools } = useQuery({
    queryKey: ['schools', { limit: 100 }],
    queryFn: () => schoolsApi.list({ limit: 100 }),
    enabled: isSuperAdmin,
    staleTime: 5 * 60 * 1000,
  });

  const schools = useMemo(() => schoolsData?.data || [], [schoolsData?.data]);

  // Selected school ID
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const targetSchoolId = isSuperAdmin
    ? (selectedSchoolId || activeSchoolId || schools[0]?.id || '')
    : (user?.schoolId || '');

  // 2. Fetch specific school info
  const { data: currentSchool, isLoading: isLoadingSchool } = useQuery({
    queryKey: ['school', targetSchoolId],
    queryFn: () => schoolsApi.getById(targetSchoolId),
    enabled: Boolean(targetSchoolId),
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch principal for target school
  const {
    data: principal,
    isLoading: isLoadingPrincipal,
    isFetching: isFetchingPrincipal,
    refetch,
  } = useQuery({
    queryKey: ['principal', targetSchoolId],
    queryFn: () => principalsApi.getBySchool(targetSchoolId),
    enabled: Boolean(targetSchoolId),
  });

  // Modal State
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);

  // Sync super_admin selector with global tenant store if needed
  const handleSelectSchool = (newSchoolId: string) => {
    setSelectedSchoolId(newSchoolId);
    setActiveSchoolId(newSchoolId);
  };

  const handleRefresh = () => {
    void refetch();
    if (isSuperAdmin) {
      void queryClient.invalidateQueries({ queryKey: ['schools'] });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Institutional Leadership</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Campus Governance
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Appoint, supervise, and oversee institutional principals across school campuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetchingPrincipal}
            className="gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', isFetchingPrincipal && 'animate-spin')} />
            Refresh
          </Button>

          {canManage && targetSchoolId && (
            <Button
              size="sm"
              onClick={() => setIsAppointModalOpen(true)}
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {principal ? 'Update Principal' : 'Appoint Principal'}
            </Button>
          )}
        </div>
      </div>

      {/* Super Admin Campus Switcher */}
      {isSuperAdmin && (
        <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Campus Scope Selector</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Switch Campus:</span>
              <select
                aria-label="Select School Campus"
                value={targetSchoolId}
                onChange={(e) => handleSelectSchool(e.target.value)}
                className="h-8 px-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoadingSchools || schools.length === 0}
              >
                {schools.map((s: School) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick School Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {schools.map((s: School) => {
              const isSelected = s.id === targetSchoolId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSchool(s.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground',
                  )}
                >
                  <SchoolIcon className="w-3.5 h-3.5" />
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Governance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Target Campus
              </p>
              <p className="text-base font-bold mt-1 truncate max-w-[150px]">
                {currentSchool?.name || (isSuperAdmin ? 'Multiple' : 'School Campus')}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <SchoolIcon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Leadership Status
              </p>
              <p
                className={cn(
                  'text-base font-bold mt-1',
                  principal
                    ? principal.status === 'active'
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                    : 'text-muted-foreground',
                )}
              >
                {principal
                  ? principal.status === 'active'
                    ? 'Active in Tenure'
                    : 'Inactive'
                  : 'Post Vacant'}
              </p>
            </div>
            <div
              className={cn(
                'p-2.5 rounded-xl',
                principal
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {principal ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <UserX className="w-5 h-5" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Executive Head
              </p>
              <p className="text-base font-bold mt-1 truncate max-w-[150px]">
                {principal
                  ? `${principal.firstName} ${principal.lastName}`
                  : 'Unassigned'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Governance Level
              </p>
              <p className="text-base font-bold mt-1 text-indigo-500">
                {principal ? 'Authorized' : 'Pending'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Principal Profile Display */}
      {!targetSchoolId ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/40 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <SchoolIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold">No School Campus Selected</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Please select a school campus above or from the top navigation bar to manage its institutional principal appointment.
          </p>
        </div>
      ) : isLoadingPrincipal || isLoadingSchool ? (
        <Card className="animate-pulse">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="h-20 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <PrincipalDetailsCard
          principal={principal || null}
          schoolName={currentSchool?.name || 'School Campus'}
          schoolCode={currentSchool?.code}
          canManage={canManage}
          onAppointOrEdit={() => setIsAppointModalOpen(true)}
        />
      )}

      {/* Quick Navigation Footer Banner */}
      <div className="mt-8 p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>
            Institutional principals have overarching authority over curriculum boards, grades, teachers, and admissions.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/schools')}
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Schools Directory <ArrowRight className="w-3 h-3" />
          </button>
          <span className="text-border">|</span>
          <button
            type="button"
            onClick={() => navigate('/teachers')}
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Staff Directory <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Appoint / Update Principal Modal */}
      {canManage && targetSchoolId && (
        <AppointPrincipalModal
          open={isAppointModalOpen}
          onOpenChange={setIsAppointModalOpen}
          schoolId={targetSchoolId}
          schoolName={currentSchool?.name}
          currentPrincipal={principal}
          onSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ['principal', targetSchoolId] });
          }}
        />
      )}
    </div>
  );
}
