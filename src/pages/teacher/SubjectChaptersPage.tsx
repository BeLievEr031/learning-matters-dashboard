import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card.tsx';

export function SubjectChaptersPage() {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/teacher/subjects')}
          className="gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Subjects
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Syllabus & Chapters</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Chapters and learning modules for subject {subjectId || 'selected'}.
          </p>
        </div>
      </div>

      {/* Chapters list */}
      <div className="space-y-4">
        <Card
          onClick={() => navigate('/teacher/subjects')}
          className="hover:border-primary/50 transition-all cursor-pointer"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-[11px] font-semibold text-primary uppercase tracking-wide">
                  Chapter Unit
                </span>
                <CardTitle className="text-lg font-bold mt-1">
                  Active Syllabus Units
                </CardTitle>
                <CardDescription className="text-xs">
                  Chapter lesson plan and teaching modules
                </CardDescription>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Manage learning materials, lecture slide decks, student reading notes, and reference links.
            </p>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-medium text-primary">
              <span>Manage Learning Resources</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
