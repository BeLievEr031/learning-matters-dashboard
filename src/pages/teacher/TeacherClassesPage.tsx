import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Search } from 'lucide-react';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card.tsx';

export function TeacherClassesPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Classes & Grades</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              Faculty Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your assigned grade levels, sections, and classroom responsibilities.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search classes or sections..."
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Grid of classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          onClick={() => navigate('/teacher/subjects')}
          className="hover:border-primary/50 transition-all group cursor-pointer"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Academic Grade
                </span>
                <CardTitle className="text-lg font-bold mt-1 group-hover:text-primary transition-colors">
                  Assigned Grades
                </CardTitle>
                <CardDescription className="text-xs">
                  Active academic sections under your instruction
                </CardDescription>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Select any class section to view assigned subjects, curriculum chapters, and course materials.
            </p>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-medium text-primary">
              <span>View Curriculum</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
