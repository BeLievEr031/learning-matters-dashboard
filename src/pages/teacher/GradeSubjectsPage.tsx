import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card.tsx';

export function GradeSubjectsPage() {
  const navigate = useNavigate();
  const { gradeId } = useParams<{ gradeId: string }>();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Navigation & Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/teacher/classes')}
          className="gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Classes
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Grade Curriculum & Subjects</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Subjects and courses for grade {gradeId || 'selected'}.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          onClick={() => navigate('/teacher/subjects')}
          className="hover:border-primary/50 transition-all group cursor-pointer"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-[11px] font-semibold text-primary uppercase tracking-wide">
                  Subject Course
                </span>
                <CardTitle className="text-lg font-bold mt-1 group-hover:text-primary transition-colors">
                  Assigned Subjects
                </CardTitle>
                <CardDescription className="text-xs">
                  Course curriculum assigned to this grade
                </CardDescription>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Explore chapters, lessons, study materials, and faculty notes for this subject.
            </p>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-medium text-primary">
              <span>View Chapters & Syllabus</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
