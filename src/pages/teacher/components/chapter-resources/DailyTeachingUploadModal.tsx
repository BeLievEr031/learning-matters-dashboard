import {
  useState,
  useRef,
  type KeyboardEvent,
  type ChangeEvent,
  type FormEvent,
  type DragEvent,
} from 'react';
import {
  Calendar,
  Clock,
  UploadCloud,
  FileText,
  FileCheck,
  Image as ImageIcon,
  Headphones,
  Sparkles,
  X,
  Plus,
  AlertCircle,
  Presentation,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui/dialog.tsx';
import { Button } from '../../../../components/ui/button.tsx';
import { Input } from '../../../../components/ui/input.tsx';
import { Label } from '../../../../components/ui/label.tsx';
import type { UploadedMediaItem, DailyTeachingLog } from './mock-daily-resources.data.ts';

interface DailyTeachingUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  onSaveLog: (newLog: DailyTeachingLog, autoGenerateAi: boolean) => void;
}

const CLASS_PERIODS = [
  'Period 1 (08:30 AM - 09:15 AM)',
  'Period 2 (09:20 AM - 10:05 AM)',
  'Period 3 (10:20 AM - 11:05 AM)',
  'Period 4 (11:10 AM - 11:55 AM)',
  'Period 5 (12:45 PM - 01:30 PM)',
  'Period 6 (01:35 PM - 02:20 PM)',
  'Period 7 (02:25 PM - 03:10 PM)',
  'Zero Period / Morning Lab',
  'After-School Extra Class',
];

export function DailyTeachingUploadModal({
  isOpen,
  onClose,
  chapterId,
  onSaveLog,
}: DailyTeachingUploadModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState(CLASS_PERIODS[2]);
  const [topic, setTopic] = useState('');
  const [conceptInput, setConceptInput] = useState('');
  const [concepts, setConcepts] = useState<string[]>([
    'Core Derivation',
    'Practical Examples',
  ]);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [autoGenerateAi, setAutoGenerateAi] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected files list
  const [selectedFiles, setSelectedFiles] = useState<UploadedMediaItem[]>([
    {
      id: 'demo-slide-1',
      name: 'Class_Lecture_Slides_Taught.pptx',
      type: 'presentation',
      size: '3.6 MB',
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddConcept = () => {
    if (conceptInput.trim() && !concepts.includes(conceptInput.trim())) {
      setConcepts([...concepts, conceptInput.trim()]);
      setConceptInput('');
    }
  };

  const handleRemoveConcept = (conceptToRemove: string) => {
    setConcepts(concepts.filter((c) => c !== conceptToRemove));
  };

  const handleKeyDownConcept = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddConcept();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: UploadedMediaItem[] = Array.from(e.target.files).map((file, idx) => {
        let type: UploadedMediaItem['type'] = 'document';
        const name = file.name.toLowerCase();
        if (name.endsWith('.ppt') || name.endsWith('.pptx')) type = 'presentation';
        else if (name.endsWith('.pdf')) type = 'pdf';
        else if (name.match(/\.(png|jpg|jpeg|webp)$/)) type = 'image';
        else if (name.match(/\.(mp3|m4a|wav|aac)$/)) type = 'audio';

        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        return {
          id: `upload-${Date.now()}-${idx}`,
          name: file.name,
          type,
          size: `${sizeInMb} MB`,
        };
      });
      setSelectedFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles(selectedFiles.filter((f) => f.id !== fileId));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newItems: UploadedMediaItem[] = Array.from(e.dataTransfer.files).map(
        (file, idx) => {
          let type: UploadedMediaItem['type'] = 'document';
          const name = file.name.toLowerCase();
          if (name.endsWith('.ppt') || name.endsWith('.pptx')) type = 'presentation';
          else if (name.endsWith('.pdf')) type = 'pdf';
          else if (name.match(/\.(png|jpg|jpeg|webp)$/)) type = 'image';
          else if (name.match(/\.(mp3|m4a|wav|aac)$/)) type = 'audio';

          const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
          return {
            id: `drop-${Date.now()}-${idx}`,
            name: file.name,
            type,
            size: `${sizeInMb} MB`,
          };
        },
      );
      setSelectedFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!topic.trim()) {
      setErrorMsg('Please specify the lecture topic taught today.');
      return;
    }

    if (selectedFiles.length === 0 && !teacherNotes.trim()) {
      setErrorMsg(
        'Please upload at least one teaching material (slides, whiteboard photo, etc.) or provide lecture notes.',
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Format human friendly date string
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      const newLog: DailyTeachingLog = {
        id: `log-${Date.now()}`,
        chapterId,
        date,
        formattedDate: `Today, ${formattedDate}`,
        period,
        topic: topic.trim(),
        conceptsCovered: concepts.length > 0 ? concepts : ['General Chapter Topics'],
        teacherNotes: teacherNotes.trim() || undefined,
        materials: selectedFiles,
        aiStatus: autoGenerateAi ? 'generating' : 'pending',
        createdAt: new Date().toISOString(),
      };

      onSaveLog(newLog, autoGenerateAi);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const getMediaIcon = (type: UploadedMediaItem['type']) => {
    switch (type) {
      case 'presentation':
        return <Presentation className="w-4 h-4 text-amber-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-purple-500" />;
      default:
        return <FileCheck className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Log Today's Taught Material
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload slides, blackboard snapshots, or lecture memos. Our AI will
                synthesize revision notes and practice questions from this session.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Date and Class Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Teaching Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Lecture Period / Slot
              </Label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CLASS_PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Topic / Section Taught Today <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Newton's Third Law & Conservation of Linear Momentum"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Concept Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Key Concepts & Formulas Covered (Press Enter to add)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Action-Reaction Pairs, Rocket Propulsion"
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                onKeyDown={handleKeyDownConcept}
                className="text-xs h-8.5"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddConcept}
                className="h-8.5 text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Tag
              </Button>
            </div>

            {concepts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {concepts.map((concept) => (
                  <span
                    key={concept}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-medium"
                  >
                    {concept}
                    <button
                      type="button"
                      onClick={() => handleRemoveConcept(concept)}
                      className="hover:text-destructive transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Drag & Drop File Upload Area */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Attach Teaching Media (Slides, Board Photos, Audio, Worksheets)
            </Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border/70 hover:border-primary/50 hover:bg-muted/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.mp3,.m4a,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-7 h-7 mx-auto text-primary mb-1.5 animate-bounce-subtle" />
              <p className="text-xs font-medium text-foreground">
                Click to browse or drop your lecture files here
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Supports PPT/PPTX slides, Board snapshots (JPG, PNG), PDF notes & Classroom voice notes
              </p>
            </div>

            {/* Selected files preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Ready to upload ({selectedFiles.length} item
                  {selectedFiles.length > 1 ? 's' : ''}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/80 text-xs shadow-2xs group"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {getMediaIcon(file.type)}
                        <span className="truncate font-medium text-[11px]" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                          ({file.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(file.id);
                        }}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teacher's Summary & Spoken Points */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Teacher's Classroom Remarks / Board Summary (Optional)
            </Label>
            <textarea
              rows={2}
              placeholder="e.g. Focused on why passengers feel a jerk when a bus starts. Assigned homework problem 5 & 6 from page 112."
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* AI Auto-generation Switch Banner */}
          <div className="p-3 rounded-xl bg-linear-to-r from-indigo-500/10 via-primary/10 to-transparent border border-indigo-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Auto-Generate AI Study Notes & Question Paper
                </p>
                <p className="text-[10px] text-muted-foreground">
                  AI will instantly structure student revision notes and a 10-min practice quiz.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateAi}
                onChange={(e) => setAutoGenerateAi(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading & Recording...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Log Daily Teaching Material
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
