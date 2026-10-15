import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Upload, X, FileText, Check } from 'lucide-react';
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

export interface NewMaterialData {
  title: string;
  date: string;
  period: string;
  content: string;
  fileName?: string;
  fileSize?: string;
}

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: NewMaterialData) => void;
}

export function UploadMaterialModal({
  isOpen,
  onClose,
  onUpload,
}: UploadMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('1');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({
        name: file.name,
        size: `${sizeInMb} MB`,
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }

    onUpload({
      title: title.trim(),
      date,
      period: `Period ${period}`,
      content: content.trim(),
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
    });

    // Reset form
    setTitle('');
    setContent('');
    setPeriod('1');
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Upload Today's Material
          </DialogTitle>
          <DialogDescription className="text-xs">
            Enter the details of what you taught today. AI will generate Notes and Questions based on this material.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Newton's Laws of Motion & Friction"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Date & Period Number */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Period Number</Label>
              <Input
                type="number"
                min="1"
                max="12"
                placeholder="e.g. 1"
                value={period}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPeriod(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          {/* Textarea for taught content */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Taught Content / Summary</Label>
            <textarea
              rows={4}
              placeholder="Write or paste what was taught in class today..."
              value={content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Attach PDF, Docs, Text files */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Attach File (PDF, Docs, Text)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border border-dashed border-border rounded-xl text-center hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-xs text-muted-foreground"
              >
                <Upload className="w-4 h-4 text-primary" />
                <span>Click to attach PDF, Word Doc, or Text file</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium truncate">{selectedFile.name}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    ({selectedFile.size})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Check className="w-4 h-4" />
              Upload Material
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
