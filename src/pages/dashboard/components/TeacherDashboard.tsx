import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  BookOpen,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '../../../store/auth.store.ts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card.tsx';

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const isClassTeacher = effectiveRole === 'class_teacher';

  return (
    <div className="space-y-6">
      {/* Faculty Role Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-primary/10 via-indigo-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              {isClassTeacher ? 'Class Teacher' : 'Faculty Member'}
            </span>
            {isClassTeacher && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Assigned Class Lead
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Faculty Workspace · {user?.firstName || user?.email}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isClassTeacher
              ? 'You have administrative lead over your assigned grade section as well as course teaching responsibilities.'
              : 'View your course allocations, student rosters, and curriculum schedules.'}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Courses
            </CardTitle>
            <BookOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground mt-1">Teaching subject schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Class Grade
            </CardTitle>
            <Layers className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClassTeacher ? 'Class Lead' : 'Assigned'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isClassTeacher ? 'Grade & Section Authority' : 'Subject Instructor'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Student Records
            </CardTitle>
            <Users className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Roster</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled class attendees</p>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teaching & Classroom Navigation</CardTitle>
          <CardDescription className="text-xs">Quick shortcuts to your rosters and courses</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => navigate('/assignments')}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-foreground">My Teaching Schedule</p>
              <p className="text-xs text-muted-foreground">View subjects and grades assigned to you</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>

          {isClassTeacher && (
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">My Section Students</p>
                <p className="text-xs text-muted-foreground">Manage class roster and transfer requests</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/subjects')}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                <GraduationCap className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-foreground">Curriculum Syllabus</p>
              <p className="text-xs text-muted-foreground">Course details and grade associations</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
