import { useScreens } from '../../hooks/use-screens.ts';
import { useDashboardData } from '../../hooks/use-dashboard-data.ts';
import { SuperAdminDashboard } from './components/SuperAdminDashboard.tsx';
import { SchoolAdminDashboard } from './components/SchoolAdminDashboard.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';

export function DashboardPage() {
  const { effectiveRole, isImpersonating, viewAsRole } = useScreens();
  const dashboardData = useDashboardData();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {effectiveRole === 'super_admin'
              ? 'System Administration Console'
              : effectiveRole === 'admin'
                ? 'School Administration Console'
                : effectiveRole === 'principal'
                  ? 'Principal Leadership Dashboard'
                  : effectiveRole === 'class_teacher' || effectiveRole === 'teacher'
                    ? 'Faculty & Classroom Workspace'
                    : 'Student Learning Workspace'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time management overview, institutional metrics, and quick operational shortcuts.
          </p>
        </div>

        {/* Status & Preview Pill */}
        <div className="flex items-center gap-2">
          {isImpersonating && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              Preview Mode: {viewAsRole?.replace('_', ' ')}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            {effectiveRole?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Role-Tailored Dashboard Views */}
      {effectiveRole === 'super_admin' && <SuperAdminDashboard data={dashboardData} />}
      {(effectiveRole === 'admin' || effectiveRole === 'principal') && (
        <SchoolAdminDashboard data={dashboardData} />
      )}
      {(effectiveRole === 'teacher' || effectiveRole === 'class_teacher') && <TeacherDashboard />}
      {effectiveRole === 'student' && <StudentDashboard />}
    </div>
  );
}
