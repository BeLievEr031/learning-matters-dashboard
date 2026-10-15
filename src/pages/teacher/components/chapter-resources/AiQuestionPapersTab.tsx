import { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Calendar,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  Printer,
  ChevronRight,
  Share2,
  Copy,
  Check,
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
import type { AiQuestionPaper } from './mock-daily-resources.data.ts';

interface AiQuestionPapersTabProps {
  quizzes: AiQuestionPaper[];
  selectedQuizId?: string | null;
  onCloseQuizModal?: () => void;
  onOpenUploadModal: () => void;
}

export function AiQuestionPapersTab({
  quizzes,
  selectedQuizId: controlledSelectedQuizId,
  onCloseQuizModal: controlledCloseModal,
  onOpenUploadModal,
}: AiQuestionPapersTabProps) {
  const [internalSelectedQuiz, setInternalSelectedQuiz] = useState<AiQuestionPaper | null>(
    null,
  );
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeQuiz = controlledSelectedQuizId
    ? quizzes.find((q) => q.id === controlledSelectedQuizId) || null
    : internalSelectedQuiz;

  const handleClose = () => {
    if (controlledCloseModal) controlledCloseModal();
    setInternalSelectedQuiz(null);
  };

  const getDifficultyBadge = (difficulty: AiQuestionPaper['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            Easy
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
            Standard / Medium
          </span>
        );
      case 'Challenging':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
            HOTS / Advanced
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-primary/10 via-indigo-500/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              AI Assessment Studio
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Directly aligned with what was taught
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Daily Practice Question Papers & Quizzes
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Auto-generate 10-15 minute daily exit tickets, MCQs, and revision worksheets
            complete with marking schemes and step-by-step teacher explanations.
          </p>
        </div>

        <Button
          onClick={onOpenUploadModal}
          size="sm"
          className="text-xs h-9 gap-1.5 shrink-0 bg-primary text-primary-foreground font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create Question Paper
        </Button>
      </div>

      {/* Quizzes Grid */}
      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {quiz.date}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getDifficultyBadge(quiz.difficulty)}
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                      {quiz.durationMinutes} Mins
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {quiz.title}
                </h3>

                {/* Quiz stats summary */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40 text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                      Total Marks
                    </span>
                    <span className="text-sm font-bold text-foreground font-mono">
                      {quiz.totalMarks} pts
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                      Questions
                    </span>
                    <span className="text-sm font-bold text-foreground font-mono">
                      {quiz.questions.length} Items
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                      MCQ / Short
                    </span>
                    <span className="text-sm font-bold text-foreground font-mono">
                      {quiz.questions.filter((q) => q.type === 'mcq').length} /{' '}
                      {quiz.questions.filter((q) => q.type === 'short_answer').length}
                    </span>
                  </div>
                </div>

                {/* Sample question snippet */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Question 1 Sample:
                  </span>
                  <p className="text-xs text-muted-foreground line-clamp-2 italic">
                    "{quiz.questions[0]?.questionText}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInternalSelectedQuiz(quiz)}
                  className="text-xs h-8.5 gap-1.5 group-hover:border-primary/40 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  View Questions & Answers
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      alert('Simulated: Exporting formatted printable exam PDF!');
                    }}
                    className="h-8.5 text-xs text-muted-foreground hover:text-foreground"
                    title="Export Printable PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      alert('Simulated: Assigned as today’s practice homework to class!');
                    }}
                    className="h-8.5 text-xs text-muted-foreground hover:text-primary"
                    title="Assign as Homework"
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
          <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-bold text-foreground">No Question Papers Generated</h4>
          <p className="text-xs text-muted-foreground">
            Upload daily taught materials in the Daily Timeline to automatically craft
            practice quizzes and test papers.
          </p>
          <Button size="sm" onClick={onOpenUploadModal} className="text-xs gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Upload Lesson to Generate Quiz
          </Button>
        </div>
      )}

      {/* Question Paper Full Preview Modal */}
      {activeQuiz && (
        <Dialog open={true} onOpenChange={handleClose}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    Practice Test
                  </span>
                  {getDifficultyBadge(activeQuiz.difficulty)}
                  <span className="text-xs text-muted-foreground">
                    • {activeQuiz.durationMinutes} Minutes
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    • Total: {activeQuiz.totalMarks} Marks
                  </span>
                </div>

                {/* Answer key toggle button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className={`text-xs h-7.5 gap-1.5 ${
                    showAnswerKey
                      ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                      : ''
                  }`}
                >
                  {showAnswerKey ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Hide Answer Key
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Show Teacher Answer Key
                    </>
                  )}
                </Button>
              </div>

              <DialogTitle className="text-xl font-bold mt-1 text-foreground">
                {activeQuiz.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Topic: {activeQuiz.topic} • Date: {activeQuiz.date}
              </DialogDescription>
            </DialogHeader>

            {/* Questions List */}
            <div className="space-y-6 pt-2">
              {activeQuiz.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-card border border-border/80 space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 text-foreground">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                        {q.questionText}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono font-bold text-muted-foreground shrink-0">
                      [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                    </span>
                  </div>

                  {/* MCQ Options */}
                  {q.type === 'mcq' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = showAnswerKey && opt === q.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs transition-colors ${
                              isCorrect
                                ? 'border-emerald-500 bg-emerald-500/10 font-semibold text-emerald-800 dark:text-emerald-200'
                                : 'border-border/60 bg-muted/20 text-muted-foreground'
                            }`}
                          >
                            {opt}
                            {isCorrect && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline ml-1.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Teacher Answer Key & Explanation */}
                  {showAnswerKey && (
                    <div className="ml-8 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct Answer: {q.correctAnswer}
                      </div>
                      <p className="text-muted-foreground leading-relaxed pl-5">
                        <span className="font-semibold text-foreground/80">
                          Explanation:
                        </span>{' '}
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="pt-4 border-t border-border/50 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const content = activeQuiz.questions
                    .map(
                      (q, i) =>
                        `Q${i + 1} (${q.marks}M): ${q.questionText}\n` +
                        (q.options ? q.options.join('\n') + '\n' : '') +
                        `Answer: ${q.correctAnswer}\n`,
                    )
                    .join('\n');
                  navigator.clipboard?.writeText(content);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Questions' : 'Copy Test'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Question Paper
              </Button>

              <Button size="sm" onClick={handleClose} className="text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
