import { useState } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Share2,
  Check,
  ChevronRight,
  Printer,
  Copy,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui/dialog.tsx';
import type { AiGeneratedNote } from './mock-daily-resources.data.ts';

interface AiGeneratedNotesTabProps {
  notes: AiGeneratedNote[];
  selectedNoteId?: string | null;
  onCloseNoteModal?: () => void;
  onOpenUploadModal: () => void;
}

export function AiGeneratedNotesTab({
  notes,
  selectedNoteId: controlledSelectedNoteId,
  onCloseNoteModal: controlledCloseModal,
  onOpenUploadModal,
}: AiGeneratedNotesTabProps) {
  const [internalSelectedNote, setInternalSelectedNote] = useState<AiGeneratedNote | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  // If a noteId is passed from parent (e.g. clicked "View AI Notes" in timeline), find it
  const activeNote = controlledSelectedNoteId
    ? notes.find((n) => n.id === controlledSelectedNoteId) || null
    : internalSelectedNote;

  const handleClose = () => {
    if (controlledCloseModal) controlledCloseModal();
    setInternalSelectedNote(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
              AI Study Companion
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Auto-generated from daily lectures
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Structured Chapter Revision Notes
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Each day's uploaded materials and blackboard notes are distilled by AI into
            concise definitions, equations, and examination takeaways for students.
          </p>
        </div>

        <Button
          onClick={onOpenUploadModal}
          size="sm"
          className="text-xs h-9 gap-1.5 shrink-0 bg-primary text-primary-foreground font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate New Note
        </Button>
      </div>

      {/* Notes Grid */}
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-border/80 bg-card p-5 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {note.date}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-[11px] font-semibold">
                    {note.readingTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {note.title}
                </h3>

                {/* Key Takeaways preview */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Core Concepts Extracted:
                  </span>
                  <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                    {note.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                      <li key={idx} className="line-clamp-1">
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Formulas preview if present */}
                {note.formulasOrDefinitions && note.formulasOrDefinitions.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 font-mono text-[11px] text-foreground space-y-1">
                    <div className="text-[10px] text-muted-foreground font-sans font-semibold">
                      Key Formulas:
                    </div>
                    {note.formulasOrDefinitions.slice(0, 2).map((formula, fIdx) => (
                      <div key={fIdx} className="truncate text-emerald-600 dark:text-emerald-400">
                        • {formula}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInternalSelectedNote(note)}
                  className="text-xs h-8.5 gap-1.5 group-hover:border-emerald-500/40"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  Read Full Notes
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      alert('Simulated: Note PDF exported to downloads folder!');
                    }}
                    className="h-8.5 text-xs text-muted-foreground hover:text-foreground"
                    title="Export as PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      alert('Simulated: Published to Student Learning App!');
                    }}
                    className="h-8.5 text-xs text-muted-foreground hover:text-emerald-600"
                    title="Publish to Students"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 space-y-3">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-bold text-foreground">No AI Notes Generated Yet</h4>
          <p className="text-xs text-muted-foreground">
            Upload daily taught materials in the Daily Timeline to automatically formulate
            structured notes.
          </p>
          <Button size="sm" onClick={onOpenUploadModal} className="text-xs gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Upload Lesson to Generate Notes
          </Button>
        </div>
      )}

      {/* Note Reader Modal */}
      {activeNote && (
        <Dialog open={true} onOpenChange={handleClose}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  AI Revision Notes
                </span>
                <span className="text-xs text-muted-foreground">• {activeNote.date}</span>
                <span className="text-xs text-muted-foreground">• {activeNote.readingTime}</span>
              </div>
              <DialogTitle className="text-xl font-bold mt-1 text-foreground">
                {activeNote.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Topic: {activeNote.topic}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Key Takeaways Callout */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Summary & Key Takeaways
                </div>
                <ul className="space-y-1.5 text-xs text-foreground/90 leading-relaxed list-disc list-inside">
                  {activeNote.keyTakeaways.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* Formulas / Equation Box */}
              {activeNote.formulasOrDefinitions &&
                activeNote.formulasOrDefinitions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-2">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      Important Formulas & Law Statements
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      {activeNote.formulasOrDefinitions.map((f, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-card border border-border/60 text-emerald-600 dark:text-emerald-400 font-semibold"
                        >
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Note Content Sections */}
              <div className="space-y-5">
                {activeNote.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <h4 className="text-sm font-bold text-foreground border-b border-border/40 pb-1">
                      {sec.heading}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/50 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopy(
                    `${activeNote.title}\n\n` +
                      activeNote.sections
                        .map((s) => `${s.heading}\n${s.content}`)
                        .join('\n\n'),
                  )
                }
                className="text-xs gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Text'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </Button>

              <Button
                size="sm"
                onClick={handleClose}
                className="text-xs"
              >
                Close Reader
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
