import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Layers,
  BookOpen,
  ArrowRight,
  UserPlus,
  CalendarCheck,
  Award
} from 'lucide-react';
import type { useDashboardData } from '../../../hooks/use-dashboard-data.ts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { useAuthStore } from '../../../store/auth.store.ts';

interface SchoolAdminDashboardProps {
  data: ReturnType<typeof useDashboardData>;
}

export function SchoolAdminDashboard({ data }: SchoolAdminDashboardProps) {
  const navigate = useNavigate();
  const { user, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  const { counts } = data;

  const isPrincipal = effectiveRole === 'principal';

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Enrolled Students
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.students}</div>
            <p className="text-xs text-muted-foreground mt-1">Active student body</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Teaching Faculty
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.teachers}</div>
            <p className="text-xs text-muted-foreground mt-1">Appointed faculty members</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Grades & Sections
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.grades}</div>
            <p className="text-xs text-muted-foreground mt-1">Class divisions</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Boards
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.boards}</div>
            <p className="text-xs text-muted-foreground mt-1">Affiliated curricula</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">School Management Actions</CardTitle>
            <CardDescription className="text-xs">
              Direct shortcuts for daily academic administration
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <UserPlus className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">Students & Admissions</p>
                <p className="text-xs text-muted-foreground">Register new students and execute grade transfers</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/teachers')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">Faculty Directory</p>
                <p className="text-xs text-muted-foreground">Staff profiles, qualifications, and employment status</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/grades')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">Grades & Class Teachers</p>
                <p className="text-xs text-muted-foreground">Appoint class teachers and manage section capacities</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/assignments')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">Teaching Assignments</p>
                <p className="text-xs text-muted-foreground">Map instructors to subject & grade schedules</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          </CardContent>
        </Card>

        {/* Institutional Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              School Profile
            </CardTitle>
            <CardDescription className="text-xs">
              {isPrincipal ? 'Principal Leadership View' : 'School Administrator Console'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                Logged In Authority
              </p>
              <p className="text-base font-bold text-foreground">{user?.firstName || user?.email}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                {effectiveRole?.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full justify-between text-xs"
                onClick={() => navigate('/principals')}
              >
                <span>Principal Office</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between text-xs"
                onClick={() => navigate('/subjects')}
              >
                <span>Curriculum Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
