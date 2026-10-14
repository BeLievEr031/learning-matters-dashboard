import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  BookOpen,
  ArrowRight,
  FileText,
  Search,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent, CardHeader } from '../../components/ui/card.tsx';
import { useTeacherSubjectChapters } from '../../hooks/use-teacher-workspace.ts';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export function SubjectChaptersPage() {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useTeacherSubjectChapters(subjectId);

  const [search, setSearch] = useState('');

  const subject = data?.subject;
  const chapters = data?.chapters ?? [];

  // Filter chapters by chapter number or title
  const filteredChapters = useMemo(() => {
    if (!search.trim()) return chapters;
    const q = search.toLowerCase();
    return chapters.filter((c) => {
      const matchNumber = String(c.chapterNumber).includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q) ?? false;
      return matchNumber || matchTitle || matchDesc;
    });
  }, [chapters, search]);

  const apiError = error as ApiError | null;
  const errorMessage =
    apiError?.response?.data?.message ||
    apiError?.message ||
    'Failed to load syllabus chapters for this subject.';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Navigation Breadcrumbs & Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/teacher/subjects')}
          className="gap-1.5 text-xs h-9"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Subjects
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Chapters
        </Button>
      </div>

      {/* Subject Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-primary/10 via-indigo-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              Subject Syllabus
            </span>
            {subject && (
              <span className="text-xs font-mono font-medium text-muted-foreground flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {subject.code}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {subject ? `${subject.name} · Syllabus & Chapters` : 'Syllabus & Chapters'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Structured course units, lecture presentations, worksheets, and study notes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-2xs">
            {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
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
            placeholder="Search chapters by title or chapter number..."
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
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/60 animate-pulse border border-border/40" />
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
                <h3 className="font-semibold text-foreground">Unable to Load Chapters</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {errorMessage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/teacher/subjects')} className="text-xs">
                Back to Subjects
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State - Search filter has no matches */}
      {!isLoading && !isError && filteredChapters.length === 0 && search && (
        <Card className="p-8 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Chapters Match Your Search</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            No syllabus chapters match "{search}". Try searching with another chapter title or number.
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

      {/* Empty State - No chapters registered in this subject */}
      {!isLoading && !isError && chapters.length === 0 && (
        <Card className="p-10 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Syllabus Chapters Registered Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            There are currently no active chapters created for {subject?.name || 'this subject'}.
            Chapters defined in the academic curriculum will appear here along with attached resources.
          </p>
        </Card>
      )}

      {/* Chapters List */}
      {!isLoading && !isError && filteredChapters.length > 0 && (
        <div className="space-y-4">
          {filteredChapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden border-border/70"
            >
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Chapter Number Badge */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-extrabold text-sm flex flex-col items-center justify-center shrink-0 border border-primary/20">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Ch</span>
                      <span className="text-base font-bold -mt-1">
                        {String(chapter.chapterNumber).padStart(2, '0')}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {chapter.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                          {chapter.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {chapter.description || 'No chapter description provided'}
                      </p>
                    </div>
                  </div>

                  {/* Resource Badges */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {chapter.totalMaterials} {chapter.totalMaterials === 1 ? 'Material' : 'Materials'}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {chapter.totalNotes} {chapter.totalNotes === 1 ? 'Note' : 'Notes'}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-3 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>Manage student worksheets, presentations, PDFs, and lecture revision notes</span>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate(`/teacher/chapters/${chapter.id}/resources`)}
                  className="gap-1.5 text-xs h-8.5 shrink-0 group-hover:bg-primary shadow-xs"
                >
                  Manage Learning Resources
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
