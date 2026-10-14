import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  Search,
  BookOpen,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  X,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent, CardHeader } from '../../components/ui/card.tsx';
import { useTeacherSubjects } from '../../hooks/use-teacher-workspace.ts';

export function TeacherSubjectsPage() {
  const navigate = useNavigate();
  const { data: subjects = [], isLoading, isError, refetch } = useTeacherSubjects();

  const [search, setSearch] = useState('');

  // Filter subjects by search keyword
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

  const totalChapters = subjects.reduce((sum, s) => sum + (s.totalChapters || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Subjects & Courses</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              {subjects.length} {subjects.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            All academic disciplines and courses assigned to you across all grade sections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/teacher/classes')}
            className="gap-1.5 text-xs h-9"
          >
            <Layers className="w-4 h-4" />
            View Classes
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 text-xs h-9"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-muted/20 border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Active Courses Assigned
              </p>
              <p className="text-xl font-bold text-foreground">{subjects.length} Subjects</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/20 border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Syllabus Chapters
              </p>
              <p className="text-xl font-bold text-foreground">{totalChapters} Lessons</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-md">
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

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/60 animate-pulse border border-border/40" />
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
                <h3 className="font-semibold text-foreground">Failed to Load Assigned Subjects</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  An error occurred while fetching your assigned subjects from the server.
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

      {/* Empty State - No search matches */}
      {!isLoading && !isError && filteredSubjects.length === 0 && search && (
        <Card className="p-8 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Subjects Match Your Search</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            No assigned courses match "{search}". Try searching with a different keyword or course code.
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

      {/* Empty State - No subjects assigned at all */}
      {!isLoading && !isError && subjects.length === 0 && (
        <Card className="p-10 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Assigned Courses Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            You do not currently have any subjects assigned across the school curriculum.
            Once subjects are mapped by your school administrator, they will appear here.
          </p>
        </Card>
      )}

      {/* Grid of Subject Cards */}
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
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {subject.totalChapters} {subject.totalChapters === 1 ? 'Chapter' : 'Chapters'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {subject.description || 'Access syllabus units, lecture slides, and study notes for this course.'}
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
