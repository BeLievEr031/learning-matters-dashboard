import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Search } from 'lucide-react';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card.tsx';

export function TeacherSubjectsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Subjects & Courses</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              Curriculum Directory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            All academic disciplines and subjects assigned to you across all grade sections.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subjects or course codes..."
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          onClick={() => navigate('/teacher/classes')}
          className="hover:border-primary/50 transition-all group cursor-pointer"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Course
                </span>
                <CardTitle className="text-lg font-bold mt-1 group-hover:text-primary transition-colors">
                  Assigned Subject
                </CardTitle>
                <CardDescription className="text-xs">
                  Academic syllabus and lesson curriculum
                </CardDescription>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Review syllabus units, chapters, lesson goals, and learning resource repositories.
            </p>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-medium text-primary">
              <span>View Chapters</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
