import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Card, CardContent } from '../../../components/ui/card.tsx';
import { chaptersApi, type Chapter } from '../../../api/chapters.api.ts';
import type { Subject } from '../../../api/subjects.api.ts';
import { ChapterFormModal } from './ChapterFormModal.tsx';
import { DeleteChapterDialog } from './DeleteChapterDialog.tsx';
import { useAuthStore } from '../../../store/auth.store.ts';
import { cn } from '../../../lib/utils.ts';

interface SubjectChaptersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
}

export function SubjectChaptersDrawer({
  open,
  onOpenChange,
  subject,
}: SubjectChaptersDrawerProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === 'super_admin' || user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<Chapter | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);

  // Fetch chapters for this subject
  const { data, isLoading } = useQuery({
    queryKey: ['chapters', subject?.id],
    queryFn: async () => {
      if (!subject) return { data: [], pagination: { limit: 100, hasMore: false } };
      return chaptersApi.listBySubject(subject.id, {
        limit: 100,
        sortBy: 'chapterNumber',
        sortOrder: 'asc',
      });
    },
    enabled: Boolean(open && subject?.id),
  });

  const rawChapters = (data?.data as Chapter[]) || [];

  // Sort by chapterNumber
  const sortedChapters = [...rawChapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

  // Filtered chapters for display
  const filteredChapters = sortedChapters.filter((ch) => {
    if (statusFilter !== 'all' && ch.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchTitle = ch.title.toLowerCase().includes(q);
      const matchDesc = ch.description?.toLowerCase().includes(q);
      const matchNum = ch.chapterNumber.toString() === q;
      if (!matchTitle && !matchDesc && !matchNum) return false;
    }
    return true;
  });

  const nextChapterNumber = sortedChapters.length > 0
    ? Math.max(...sortedChapters.map((c) => c.chapterNumber)) + 1
    : 1;

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedList: { id: string; chapterNumber: number }[]) => {
      if (!subject) return;
      return chaptersApi.reorder(subject.id, reorderedList);
    },
    onSuccess: () => {
      toast.success('Curriculum sequence updated');
      queryClient.invalidateQueries({ queryKey: ['chapters', subject?.id] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to reorder chapters');
    },
  });

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedChapters.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...sortedChapters];
    
    // Swap items
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Renumber sequentially 1..N
    const payload = newItems.map((ch, idx) => ({
      id: ch.id,
      chapterNumber: idx + 1,
    }));

    reorderMutation.mutate(payload);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
            Inactive
          </span>
        );
      case 'archived':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  if (!subject) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    <span>{subject.name}</span>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-primary/10 text-primary border border-primary/20">
                      {subject.code}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Curriculum Syllabus & Structured Chapter Units
                  </DialogDescription>
                </div>
              </div>

              {canManage && (
                <Button
                  size="sm"
                  onClick={() => {
                    setChapterToEdit(null);
                    setFormModalOpen(true);
                  }}
                  className="text-xs h-8 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Chapter
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Filter & Search Bar */}
          <div className="py-3 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between border-b border-border/40">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search chapters by title or index..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-muted-foreground" />
              {['all', 'active', 'inactive', 'archived'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all capitalize',
                    statusFilter === st
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
            {isLoading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : filteredChapters.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-border/80 text-muted-foreground space-y-2">
                <Layers className="w-8 h-8 mx-auto text-muted-foreground/60" />
                <p className="text-xs font-semibold text-foreground">No chapters found</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  {sortedChapters.length === 0
                    ? 'Start organizing this subject by adding its syllabus chapters.'
                    : 'No chapters match your search filter.'}
                </p>
                {canManage && sortedChapters.length === 0 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setChapterToEdit(null);
                      setFormModalOpen(true);
                    }}
                    className="mt-2 text-xs h-8 gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add First Chapter
                  </Button>
                )}
              </div>
            ) : (
              filteredChapters.map((chapter) => {
                const globalIndex = sortedChapters.findIndex((c) => c.id === chapter.id);
                const isFirst = globalIndex === 0;
                const isLast = globalIndex === sortedChapters.length - 1;

                return (
                  <Card
                    key={chapter.id}
                    className="border-border/60 hover:border-border transition-all bg-card/80 shadow-xs"
                  >
                    <CardContent className="p-3.5 flex items-start justify-between gap-3">
                      {/* Left: Chapter Index & Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-mono font-bold text-xs border border-primary/20">
                          #{chapter.chapterNumber}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-foreground truncate">
                              {chapter.title}
                            </h4>
                            {getStatusBadge(chapter.status)}
                          </div>
                          {chapter.description ? (
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {chapter.description}
                            </p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/60 italic">
                              No description provided
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Reorder & Actions */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        {canManage && (
                          <>
                            <div className="flex flex-col gap-0.5 mr-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={isFirst || reorderMutation.isPending}
                                onClick={() => handleMove(globalIndex, 'up')}
                                title="Move Up"
                                className="h-5 w-5"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={isLast || reorderMutation.isPending}
                                onClick={() => handleMove(globalIndex, 'down')}
                                title="Move Down"
                                className="h-5 w-5"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setChapterToEdit(chapter);
                                setFormModalOpen(true);
                              }}
                              title="Edit Chapter"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setChapterToDelete(chapter)}
                              className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                              title="Delete Chapter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Chapter Form Modal */}
      <ChapterFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        subjectId={subject.id}
        subjectName={subject.name}
        nextChapterNumber={nextChapterNumber}
        chapterToEdit={chapterToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteChapterDialog
        open={Boolean(chapterToDelete)}
        onOpenChange={(openState) => !openState && setChapterToDelete(null)}
        chapter={chapterToDelete}
        subjectName={subject.name}
      />
    </>
  );
}
