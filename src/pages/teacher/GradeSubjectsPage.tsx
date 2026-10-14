import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Search,
  Calendar,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  X,
  Layers,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent, CardHeader } from '../../components/ui/card.tsx';
import { useTeacherGradeSubjects } from '../../hooks/use-teacher-workspace.ts';

export function GradeSubjectsPage() {
  const navigate = useNavigate();
  const { gradeId } = useParams<{ gradeId: string }>();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useTeacherGradeSubjects(gradeId);

  const [search, setSearch] = useState('');

  const grade = data?.grade;
  const subjects = data?.subjects ?? [];

  // Filter subjects by search query
  const filteredSubjects = useMemo(() => {
    if (!search.trim()) return subjects;
    const q = search.toLowerCase();
    return subjects.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchCode = s.code.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q) ?? false;
      return matchName || matchCode || matchDesc;
    });
  }, [subjects, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Navigation Breadcrumb & Back button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/teacher/classes')}
            className="gap-1.5 text-xs h-9"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to My Classes
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/teacher/classes/${gradeId}/students`)}
            className="gap-1.5 text-xs h-9 text-foreground hover:text-primary"
          >
            <Users className="w-4 h-4 text-primary" />
            Students Roster
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Curriculum
        </Button>
      </div>

      {/* Grade Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-primary/10 via-indigo-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              Grade Curriculum
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {grade ? grade.name : 'Class Curriculum'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {grade ? `${grade.name} · Courses & Subjects` : 'Assigned Grade Subjects'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Active courses, syllabus units, and instructional curriculum you are assigned to teach for this grade.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-2xs">
            {subjects.length} {subjects.length === 1 ? 'Course' : 'Courses'} Assigned
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects by name or course code..."
            className="pl-9 pr-8 bg-card"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-xl bg-muted/60 animate-pulse border border-border/40" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Failed to Load Grade Curriculum</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unable to load the curriculum subjects for this grade from the server.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State - Search filter has no matches */}
      {!isLoading && !isError && filteredSubjects.length === 0 && search && (
        <Card className="p-8 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Subjects Match Your Search</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            No assigned courses match "{search}". Try searching by another keyword.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearch('')}
            className="mt-4 text-xs"
          >
            Clear Search
          </Button>
        </Card>
      )}

      {/* Empty State - No subjects assigned in this grade */}
      {!isLoading && !isError && subjects.length === 0 && (
        <Card className="p-10 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Subjects Assigned to this Grade</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            You are associated with this grade section, but no individual subject teaching allocations have been registered yet.
          </p>
        </Card>
      )}

      {/* Subjects Grid */}
      {!isLoading && !isError && filteredSubjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => (
            <Card
              key={subject.id}
              className="flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden border-border/70"
            >
              <div>
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-xs font-mono font-medium text-muted-foreground mt-0.5">
                          {subject.code}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      {subject.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {subject.totalChapters} {subject.totalChapters === 1 ? 'Chapter' : 'Chapters'}
                    </span>

                    {subject.effectiveDate && (
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Effective {new Date(subject.effectiveDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {subject.description || 'Access syllabus modules, chapter notes, and learning resources for this course.'}
                  </p>
                </CardContent>
              </div>

              {/* Action Footer */}
              <div className="p-4 pt-2 border-t border-border/40 flex items-center justify-between bg-muted/10">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Course Syllabus
                </span>
                <Button
                  size="sm"
                  onClick={() => navigate(`/teacher/subjects/${subject.id}/chapters`)}
                  className="gap-1.5 text-xs h-8 group-hover:bg-primary"
                >
                  View Chapters
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
