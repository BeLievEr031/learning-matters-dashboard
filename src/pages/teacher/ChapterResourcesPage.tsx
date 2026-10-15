import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  FileText,
  HelpCircle,
  Calendar,
  Clock,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog.tsx';
import {
  UploadMaterialModal,
  type NewMaterialData,
} from './components/chapter-resources/UploadMaterialModal.tsx';

interface TaughtMaterial {
  id: string;
  title: string;
  period: string;
  date: string;
  content?: string;
  fileName?: string;
  notesTitle?: string;
  notesContent?: string[];
  questions?: { question: string; answer: string }[];
}

const INITIAL_MATERIALS: TaughtMaterial[] = [
  {
    id: 'mat-1',
    title: "Newton's Second Law of Motion & Friction",
    period: 'Period 3',
    date: '2026-10-15',
    content:
      'Covered F = ma derivation, static vs kinetic friction, free-body diagrams, and textbook numericals 4.1 to 4.5.',
    fileName: 'Friction_Lecture_Notes.pdf',
    notesTitle: "Study Notes: Newton's 2nd Law & Friction",
    notesContent: [
      'Rate of change of momentum is directly proportional to applied unbalanced force: F = dp/dt = m·a.',
      'Static friction is self-adjusting up to the limiting friction value fs(max) = μs · N.',
      'Kinetic friction (fk = μk · N) is always less than limiting static friction.',
      'Free body diagrams isolate the object and account for all normal, frictional, and gravitational vectors.',
    ],
    questions: [
      {
        question:
          'A 5 kg block rests on a rough horizontal floor (μs = 0.4). A horizontal force of 10 N is applied. What is the frictional force?',
        answer:
          '10 N. Limiting friction is 20 N. Since 10 N < 20 N, static friction self-adjusts to 10 N.',
      },
      {
        question:
          'Why is the coefficient of kinetic friction generally less than that of static friction?',
        answer:
          'Once sliding starts, microscopic contact points do not have enough time to form deep interlocking bonds.',
      },
      {
        question:
          'Write the formula relating the angle of friction (λ) and the coefficient of static friction (μs).',
        answer: 'tan(λ) = μs.',
      },
    ],
  },
  {
    id: 'mat-2',
    title: 'Inertia & Linear Momentum (Newton\'s 1st Law)',
    period: 'Period 2',
    date: '2026-10-14',
    content:
      'Introduced Galilean concept of inertia, linear momentum p = mv, and practical real-life examples like bus stops and seatbelts.',
    fileName: 'Momentum_Class_Slides.docx',
    notesTitle: 'Study Notes: Inertia & Linear Momentum',
    notesContent: [
      'Inertia is the natural tendency of an object to resist changes in its state of motion or rest.',
      'Mass is the direct quantitative measure of an object\'s inertia.',
      'Linear momentum is a vector quantity: p = m · v (Units: kg·m/s).',
    ],
    questions: [
      {
        question:
          'Why does an athlete run a short distance before taking a long jump?',
        answer:
          'Running gives momentum to the body. Due to inertia of motion, the body continues forward while in mid-air.',
      },
      {
        question:
          'State the SI unit and dimensional formula of linear momentum.',
        answer: 'SI unit: kg·m/s; Dimensional formula: [M L T⁻¹].',
      },
    ],
  },
  {
    id: 'mat-3',
    title: 'Centripetal Force & Banking of Roads',
    period: 'Period 5',
    date: '2026-10-13',
    content:
      'Derived optimum speed on banked curves: v = sqrt(r * g * tan θ). Discussed why outer rail is raised on circular railway tracks.',
    fileName: 'Banking_Derivation_Board.txt',
    notesTitle: 'Study Notes: Centripetal Acceleration & Road Banking',
    notesContent: [
      'Centripetal acceleration is directed toward the center of curvature: a_c = v² / r.',
      'Banking of roads eliminates reliance on friction to supply necessary centripetal force.',
      'Angle of banking: tan(θ) = v² / (r · g).',
    ],
    questions: [
      {
        question:
          'What is the optimum angle of banking for a road of radius 50m designed for speed 10 m/s? (g = 10 m/s²)',
        answer:
          'tan(θ) = v²/(rg) = 100/(50*10) = 0.2. Hence θ = tan⁻¹(0.2).',
      },
    ],
  },
];

export function ChapterResourcesPage() {
  const navigate = useNavigate();
  const { chapterId } = useParams<{ chapterId: string }>();

  const [materials, setMaterials] = useState<TaughtMaterial[]>(INITIAL_MATERIALS);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Active item for Notes dialog & Questions dialog
  const [activeNotesItem, setActiveNotesItem] = useState<TaughtMaterial | null>(null);
  const [activeQuestionsItem, setActiveQuestionsItem] = useState<TaughtMaterial | null>(null);

  const handleUpload = (data: NewMaterialData) => {
    const newItem: TaughtMaterial = {
      id: `mat-${Date.now()}`,
      title: data.title,
      period: data.period,
      date: data.date,
      content: data.content,
      fileName: data.fileName,
      notesTitle: `Study Notes: ${data.title}`,
      notesContent: [
        `Summary of classroom lesson on "${data.title}".`,
        data.content || 'Core concepts explained in class.',
        'Key definitions, equations, and examination takeaways generated by AI.',
      ],
      questions: [
        {
          question: `What are the primary principles underlying ${data.title}?`,
          answer:
            data.content ||
            'Review the core concepts discussed during the classroom lecture.',
        },
        {
          question: `State one practical application of ${data.title}.`,
          answer:
            'Derived from real-world engineering and physical mechanisms analyzed in class.',
        },
      ],
    };

    setMaterials((prev) => [newItem, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this teaching material?')) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-1.5 text-xs h-9"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Chapters
        </Button>

        <Button
          size="sm"
          onClick={() => setIsUploadOpen(true)}
          className="gap-1.5 text-xs h-9 bg-primary text-primary-foreground font-semibold"
        >
          <Plus className="w-4 h-4" />
          Upload Today's Material
        </Button>
      </div>

      {/* Chapter Title & Header */}
      <div className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Chapter Taught Materials
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chapter ID: {chapterId || '0be4d741-83c8-460d-b1e7-5516b0a6d503'}
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Total Uploaded: {materials.length}
        </span>
      </div>

      {/* List of Uploaded Content */}
      <div className="space-y-3">
        {materials.length > 0 ? (
          materials.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
            >
              {/* Title, Period, Date */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {item.period}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {item.date}
                  </span>

                  {item.fileName && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Paperclip className="w-3 h-3" />
                      {item.fileName}
                    </span>
                  )}
                </div>
              </div>

              {/* Two Icons: Notes & Questions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {/* Notes Icon */}
                <button
                  type="button"
                  onClick={() => setActiveNotesItem(item)}
                  title="View Generated Notes"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 hover:border-emerald-500/60 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors text-xs font-medium cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Notes</span>
                </button>

                {/* Questions Icon */}
                <button
                  type="button"
                  onClick={() => setActiveQuestionsItem(item)}
                  title="View Generated Questions"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 hover:border-primary/60 hover:bg-primary/10 text-primary transition-colors text-xs font-medium cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Questions</span>
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-xl border-2 border-dashed border-border text-muted-foreground space-y-2">
            <p className="text-sm font-medium">No materials uploaded yet.</p>
            <Button
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="text-xs"
            >
              Upload Today's Material
            </Button>
          </div>
        )}
      </div>

      {/* Upload Material Dialog */}
      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />

      {/* Notes Dialog */}
      {activeNotesItem && (
        <Dialog open={true} onOpenChange={() => setActiveNotesItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                AI Generated Notes
              </div>
              <DialogTitle className="text-base font-bold mt-1">
                {activeNotesItem.notesTitle || activeNotesItem.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {activeNotesItem.period} • {activeNotesItem.date}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="space-y-2 text-xs leading-relaxed text-foreground/90">
                {activeNotesItem.notesContent?.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {activeNotesItem.content && (
                <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1 mt-3">
                  <span className="font-semibold text-foreground block">
                    Teacher's Content:
                  </span>
                  <p>{activeNotesItem.content}</p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                size="sm"
                onClick={() => setActiveNotesItem(null)}
                className="text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Questions Dialog */}
      {activeQuestionsItem && (
        <Dialog open={true} onOpenChange={() => setActiveQuestionsItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                AI Generated Questions
              </div>
              <DialogTitle className="text-base font-bold mt-1">
                Practice Questions: {activeQuestionsItem.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {activeQuestionsItem.period} • {activeQuestionsItem.date}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {activeQuestionsItem.questions &&
              activeQuestionsItem.questions.length > 0 ? (
                activeQuestionsItem.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs"
                  >
                    <p className="font-semibold text-foreground">
                      Q{idx + 1}. {q.question}
                    </p>
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      <span className="font-semibold">Answer: </span>
                      {q.answer}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Questions are being generated for this lesson.
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                size="sm"
                onClick={() => setActiveQuestionsItem(null)}
                className="text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
