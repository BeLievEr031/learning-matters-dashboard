import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button.tsx';
import { Input } from '../../../../components/ui/input.tsx';
import { DailyTeachingCard } from './DailyTeachingCard.tsx';
import type { DailyTeachingLog } from './mock-daily-resources.data.ts';

interface DailyTeachingTimelineProps {
  logs: DailyTeachingLog[];
  onOpenUploadModal: () => void;
  onTriggerAiGenerate: (logId: string) => void;
  onViewNotes: (noteId: string) => void;
  onViewQuiz: (quizId: string) => void;
  onDeleteLog: (logId: string) => void;
  onGenerateAllPending: () => void;
}

export function DailyTeachingTimeline({
  logs,
  onOpenUploadModal,
  onTriggerAiGenerate,
  onViewNotes,
  onViewQuiz,
  onDeleteLog,
  onGenerateAllPending,
}: DailyTeachingTimelineProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Filter by AI status
      if (filterType === 'pending' && log.aiStatus !== 'pending') return false;
      if (filterType === 'completed' && log.aiStatus !== 'completed') return false;

      // Filter by search query
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchTopic = log.topic.toLowerCase().includes(q);
      const matchDate = log.formattedDate.toLowerCase().includes(q);
      const matchPeriod = log.period.toLowerCase().includes(q);
      const matchConcepts = log.conceptsCovered.some((c) =>
        c.toLowerCase().includes(q),
      );
      const matchNotes = log.teacherNotes?.toLowerCase().includes(q) ?? false;
      return matchTopic || matchDate || matchPeriod || matchConcepts || matchNotes;
    });
  }, [logs, search, filterType]);

  const pendingCount = logs.filter((l) => l.aiStatus === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Search, Filter & Actions Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search topics, concepts, or formulas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | 'pending' | 'completed')
              }
              className="text-xs h-9 rounded-md border border-input bg-background px-2.5 py-1 shadow-2xs focus-visible:outline-none"
            >
              <option value="all">All Logs ({logs.length})</option>
              <option value="pending">AI Pending ({pendingCount})</option>
              <option value="completed">AI Generated</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateAllPending}
              className="text-xs h-9 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate All Pending ({pendingCount})
            </Button>
          )}

          <Button
            size="sm"
            onClick={onOpenUploadModal}
            className="text-xs h-9 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Log Today's Teaching
          </Button>
        </div>
      </div>

      {/* List of Daily Teaching Cards */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <DailyTeachingCard
              key={log.id}
              log={log}
              onTriggerAiGenerate={onTriggerAiGenerate}
              onViewNotes={onViewNotes}
              onViewQuiz={onViewQuiz}
              onDeleteLog={onDeleteLog}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">No Teaching Logs Found</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {search
                ? `No lessons matching "${search}". Try clearing your search filter.`
                : 'Upload what was taught in class today to begin generating notes & question papers.'}
            </p>
          </div>
          {search ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch('')}
              className="text-xs"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onOpenUploadModal}
              className="text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Log First Lesson
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
