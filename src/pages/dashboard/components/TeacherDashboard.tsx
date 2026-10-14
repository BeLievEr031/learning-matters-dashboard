import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { useAuthStore } from '../../../store/auth.store.ts';
import { useTeacherGrades, useTeacherSubjects } from '../../../hooks/use-teacher-workspace.ts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/card.tsx';
import { Button } from '../../../components/ui/button.tsx';

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, getEffectiveRole } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const {
    data: grades = [],
    isLoading: isLoadingGrades,
    isError: isErrorGrades,
    refetch: refetchGrades,
  } = useTeacherGrades();

  const {
    data: subjects = [],
    isLoading: isLoadingSubjects,
    isError: isErrorSubjects,
    refetch: refetchSubjects,
  } = useTeacherSubjects();

  const isLoading = isLoadingGrades || isLoadingSubjects;
  const isError = isErrorGrades || isErrorSubjects;

  const leadGrade = grades.find((g) => g.isClassTeacher);
  const isClassTeacher = Boolean(leadGrade) || effectiveRole === 'class_teacher';

  const totalGrades = grades.length;
  const totalSubjects = subjects.length;
  const totalChapters = subjects.reduce((sum, s) => sum + (s.totalChapters || 0), 0);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'Faculty Member';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-28 rounded-2xl bg-muted/60" />

        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/60" />
          ))}
        </div>

        {/* Content Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-xl bg-muted/60" />
          <div className="h-64 rounded-xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Failed to Load Teacher Workspace</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                We couldn't synchronize your assigned classes or subjects from the server.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchGrades();
              refetchSubjects();
            }}
            className="gap-2 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Faculty Role Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-primary/10 via-indigo-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
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
            Welcome back, {displayName}
          </h2>
          <p className="text-xs text-muted-foreground">
            {leadGrade
              ? `You are the Class Teacher for Grade ${leadGrade.gradeNumber} - Section ${leadGrade.section} (${leadGrade.boardName}) with ${totalSubjects} assigned course(s).`
              : `You are currently assigned to instruct ${totalSubjects} course(s) across ${totalGrades} academic class section(s).`}
          </p>
        </div>

        {/* Quick action button */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/teacher/classes')}
            className="gap-1.5 shadow-xs"
          >
            <Layers className="w-4 h-4" />
            View My Classes
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned Classes */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Classes
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrades}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalGrades === 1 ? '1 active section' : `${totalGrades} active sections`}
            </p>
          </CardContent>
        </Card>

        {/* Total Courses Assigned */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Teaching Courses
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSubjects === 1 ? '1 distinct subject' : `${totalSubjects} distinct subjects`}
            </p>
          </CardContent>
        </Card>

        {/* Curriculum Chapters */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Chapters
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChapters}</div>
            <p className="text-xs text-muted-foreground mt-1">Active syllabus units</p>
          </CardContent>
        </Card>

        {/* Class Lead Status */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Class Lead
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadGrade ? `G${leadGrade.gradeNumber}-${leadGrade.section}` : 'Faculty'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {leadGrade ? `${leadGrade.boardName} Class Lead` : 'Subject Instructor'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State when no classes or subjects are assigned */}
      {totalGrades === 0 && totalSubjects === 0 && (
        <Card className="p-8 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Classes or Courses Assigned Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            Your school administrator has not assigned you to any grade sections or subjects yet.
            Once assignments are made, your classes, curriculum chapters, and student rosters will appear here automatically.
          </p>
        </Card>
      )}

      {/* Main Content Layout: Active Classes & Courses Overview */}
      {(totalGrades > 0 || totalSubjects > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Classes Quick Jump */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">My Assigned Classes</CardTitle>
                <CardDescription className="text-xs">
                  Grades and sections where you have teaching duties
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/teacher/classes')}
                className="text-xs gap-1 text-primary hover:text-primary"
              >
                View All ({totalGrades})
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {grades.slice(0, 4).map((grade) => (
                <div
                  key={grade.id}
                  onClick={() => navigate(`/teacher/classes/${grade.id}/subjects`)}
                  className="p-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {grade.gradeNumber}
                      <span className="text-xs font-medium">{grade.section}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {grade.name}
                        </p>
                        {grade.isClassTeacher && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            Lead
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {grade.boardName} Board · {grade.totalAssignedSubjects} assigned subject(s)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Assigned Courses Quick Jump */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Teaching Subjects</CardTitle>
                <CardDescription className="text-xs">
                  Courses and academic syllabus you are responsible for
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/teacher/subjects')}
                className="text-xs gap-1 text-primary hover:text-primary"
              >
                View All ({totalSubjects})
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjects.slice(0, 4).map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => navigate(`/teacher/subjects/${subject.id}/chapters`)}
                  className="p-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {subject.code.slice(0, 4)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {subject.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Code: {subject.code} · {subject.totalChapters} syllabus chapter(s)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Shortcuts Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Workspace Shortcuts</CardTitle>
          <CardDescription className="text-xs">
            Direct access to class management, curriculum, and student records
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => navigate('/teacher/classes')}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Layers className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-foreground">My Assigned Classes</p>
              <p className="text-xs text-muted-foreground">View grades, sections, and classroom leads</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
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
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/teacher/subjects')}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <GraduationCap className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-foreground">My Subjects & Syllabus</p>
              <p className="text-xs text-muted-foreground">Course details, chapters, and study materials</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
