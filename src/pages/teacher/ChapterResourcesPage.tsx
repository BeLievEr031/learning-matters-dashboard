import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText, Upload, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card.tsx';

export function ChapterResourcesPage() {
  const navigate = useNavigate();
  const { chapterId } = useParams<{ chapterId: string }>();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Chapters
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Chapter Learning Resources</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Upload study files, slides, and publish teaching notes for chapter {chapterId || 'selected'}.
          </p>
        </div>
      </div>

      {/* Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Learning Materials</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Upload presentations, PDF documents, or link external learning media.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 border-2 border-dashed border-border rounded-xl text-center space-y-2">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">Chapter Materials Studio</p>
              <p className="text-xs text-muted-foreground">Files attached to this chapter will appear here.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <CardTitle className="text-base">Study & Lecture Notes</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Structured summaries and revision notes for your class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 border-2 border-dashed border-border rounded-xl text-center space-y-2">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">Lecture Notes Studio</p>
              <p className="text-xs text-muted-foreground">Study notes published for this chapter will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
