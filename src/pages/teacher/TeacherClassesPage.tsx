import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Sparkles,
  BookOpen,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  X,
  Users,
} from 'lucide-react';
import { Input } from '../../components/ui/input.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent, CardHeader } from '../../components/ui/card.tsx';
import { useTeacherGrades } from '../../hooks/use-teacher-workspace.ts';

export function TeacherClassesPage() {
  const navigate = useNavigate();
  const { data: grades = [], isLoading, isError, refetch } = useTeacherGrades();

  const [search, setSearch] = useState('');
  const [leadOnly, setLeadOnly] = useState(false);

  // Filtered grades list
  const filteredGrades = useMemo(() => {
    return grades.filter((grade) => {
      if (leadOnly && !grade.isClassTeacher) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const matchName = grade.name.toLowerCase().includes(q);
      const matchCode = grade.code.toLowerCase().includes(q);
      const matchBoard = grade.boardName.toLowerCase().includes(q);
      const matchSection = grade.section.toLowerCase().includes(q);
      const matchGradeNumber = String(grade.gradeNumber).includes(q);

      return matchName || matchCode || matchBoard || matchSection || matchGradeNumber;
    });
  }, [grades, search, leadOnly]);

  const classLeadCount = grades.filter((g) => g.isClassTeacher).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Classes & Grades</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              {grades.length} {grades.length === 1 ? 'Class' : 'Classes'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your assigned academic grade levels, sections, and classroom responsibilities.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by grade, section, code, or board..."
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

        {/* Filter Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={!leadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLeadOnly(false)}
            className="text-xs h-9"
          >
            All Classes ({grades.length})
          </Button>
          <Button
            variant={leadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLeadOnly(true)}
            className="text-xs h-9 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Class Lead ({classLeadCount})
          </Button>
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
                <h3 className="font-semibold text-foreground">Failed to Load Assigned Classes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  An error occurred while fetching your assigned grades from the server.
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
      {!isLoading && !isError && filteredGrades.length === 0 && search && (
        <Card className="p-8 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Classes Match Your Search</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            No assigned classes match "{search}". Try searching with a different term or clearing your search filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setLeadOnly(false);
            }}
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </Card>
      )}

      {/* Empty State - No classes assigned at all */}
      {!isLoading && !isError && grades.length === 0 && (
        <Card className="p-10 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Assigned Classes Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            You do not currently have any class sections assigned to your faculty profile.
            Please coordinate with your school administrator to allocate your teaching assignments.
          </p>
        </Card>
      )}

      {/* Grid of Class Cards */}
      {!isLoading && !isError && filteredGrades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGrades.map((grade) => (
            <Card
              key={grade.id}
              className="flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden border-border/70"
            >
              <div>
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-extrabold text-base flex flex-col items-center justify-center shrink-0 border border-primary/20">
                        <span>{grade.gradeNumber}</span>
                        <span className="text-[10px] font-semibold -mt-1 tracking-wider uppercase">
                          Sec {grade.section}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {grade.name}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Code: <span className="font-mono font-medium">{grade.code}</span>
                        </p>
                      </div>
                    </div>

                    {/* Class Lead Sparkle Pill */}
                    {grade.isClassTeacher && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                        Lead
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold">
                      {grade.boardName} Board
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {grade.totalAssignedSubjects}{' '}
                      {grade.totalAssignedSubjects === 1 ? 'Subject' : 'Subjects'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Access syllabus chapters, study materials, lecture notes, and curriculum subjects for {grade.name}.
                  </p>
                </CardContent>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-2 border-t border-border/40 flex items-center justify-between gap-2 bg-muted/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/teacher/classes/${grade.id}/students`)}
                  className={`text-xs gap-1.5 h-8 ${
                    grade.isClassTeacher
                      ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 border-amber-500/30'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Students
                </Button>

                <Button
                  size="sm"
                  onClick={() => navigate(`/teacher/classes/${grade.id}/subjects`)}
                  className="gap-1.5 text-xs h-8 ml-auto group-hover:bg-primary"
                >
                  View Curriculum
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
