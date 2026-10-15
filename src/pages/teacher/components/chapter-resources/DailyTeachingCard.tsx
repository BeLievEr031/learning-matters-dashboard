import {
  Calendar,
  Clock,
  Sparkles,
  FileText,
  HelpCircle,
  Presentation,
  Image as ImageIcon,
  Headphones,
  FileCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button.tsx';
import type { DailyTeachingLog, UploadedMediaItem } from './mock-daily-resources.data.ts';

interface DailyTeachingCardProps {
  log: DailyTeachingLog;
  onTriggerAiGenerate: (logId: string) => void;
  onViewNotes: (noteId: string) => void;
  onViewQuiz: (quizId: string) => void;
  onDeleteLog: (logId: string) => void;
}

export function DailyTeachingCard({
  log,
  onTriggerAiGenerate,
  onViewNotes,
  onViewQuiz,
  onDeleteLog,
}: DailyTeachingCardProps) {
  const getMediaIcon = (type: UploadedMediaItem['type']) => {
    switch (type) {
      case 'presentation':
        return <Presentation className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'audio':
        return <Headphones className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      default:
        return <FileCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-all duration-200 space-y-4">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs">
            <Calendar className="w-3.5 h-3.5" />
            {log.formattedDate}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium text-xs">
            <Clock className="w-3 h-3" />
            {log.period}
          </span>
        </div>

        {/* Delete option */}
        <button
          type="button"
          onClick={() => onDeleteLog(log.id)}
          title="Delete teaching record"
          className="self-end sm:self-auto text-muted-foreground/60 hover:text-destructive p-1 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Topic Title & Concepts */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <h3 className="text-base font-bold text-foreground tracking-tight">
            {log.topic}
          </h3>
        </div>

        {/* Concepts pills */}
        {log.conceptsCovered && log.conceptsCovered.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {log.conceptsCovered.map((concept, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-medium"
              >
                #{concept}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Teacher remarks / Blackboard summary */}
      {log.teacherNotes && (
        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground mr-1">Lecture Remarks:</span>
          {log.teacherNotes}
        </div>
      )}

      {/* Uploaded Materials Pills */}
      {log.materials && log.materials.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Teaching Media & Uploads ({log.materials.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {log.materials.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border/80 text-xs hover:bg-muted/50 transition-colors shadow-2xs group cursor-pointer"
                title={`Uploaded: ${file.name}`}
              >
                {getMediaIcon(file.type)}
                <span className="font-medium max-w-[200px] truncate text-[11px]">
                  {file.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {file.size}
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors ml-0.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Processing & Deliverables Banner */}
      <div className="pt-2">
        {log.aiStatus === 'completed' && (
          <div className="p-3.5 rounded-xl bg-linear-to-r from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-emerald-500 text-white shrink-0 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  AI Generation Complete
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                    Synced with Lesson
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Structured lecture notes & custom 15-min practice test ready for students.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {log.generatedNoteId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewNotes(log.generatedNoteId!)}
                  className="text-xs h-8 gap-1.5 border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  View AI Notes
                </Button>
              )}

              {log.generatedQuizId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewQuiz(log.generatedQuizId!)}
                  className="text-xs h-8 gap-1.5 border-primary/40 hover:bg-primary/10 hover:text-primary font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-primary" />
                  View Question Paper
                </Button>
              )}
            </div>
          </div>
        )}

        {log.aiStatus === 'generating' && (
          <div className="p-3.5 rounded-xl bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/30 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500 text-white animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  AI is Analyzing Lesson & Formulating Material...
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Extracting key definitions from slides and generating test questions...
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-500">
              Processing...
            </span>
          </div>
        )}

        {log.aiStatus === 'pending' && (
          <div className="p-3.5 rounded-xl bg-linear-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                AI Generation Pending
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                  New Material
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Click generate to automatically create structured notes and a practice quiz for this day.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => onTriggerAiGenerate(log.id)}
              className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate AI Notes & Test
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
