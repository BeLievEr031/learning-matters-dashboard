import { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Globe,
  Calendar,
  Layers,
  Shield,
  Laptop,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog.tsx';
import { Button } from '../../../components/ui/button.tsx';
import type { AuditLog } from '../../../api/audit-logs.api.ts';
import { cn } from '../../../lib/utils.ts';

export interface AuditLogDiffViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
}

export function AuditLogDiffViewerModal({
  open,
  onOpenChange,
  log,
}: AuditLogDiffViewerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(log.diff ?? {}, null, 2);
    void navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    toast.success('Audit log diff JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('POST')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (act.includes('UPDATE') || act.includes('PATCH') || act.includes('PUT')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
    if (act.includes('DELETE')) {
      return 'bg-destructive/10 text-destructive border-destructive/20';
    }
    if (act.includes('TRANSFER')) {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  const diffEntries = log.diff && typeof log.diff === 'object' ? Object.entries(log.diff) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Audit Event Inspection</DialogTitle>
                <DialogDescription className="font-mono text-xs text-muted-foreground">
                  Event ID: {log.id}
                </DialogDescription>
              </div>
            </div>

            <span
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 uppercase tracking-wide',
                getActionColor(log.action),
              )}
            >
              {log.action}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60">
            <div>
              <p className="text-muted-foreground font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Resource
              </p>
              <p className="font-semibold text-foreground mt-0.5 capitalize">
                {log.resourceType}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-primary" />
                Actor Role
              </p>
              <p className="font-semibold text-foreground mt-0.5 uppercase">
                {log.actorRole || 'System'}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-primary" />
                Origin IP
              </p>
              <p className="font-mono text-foreground mt-0.5">
                {log.ip || '127.0.0.1'}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Timestamp
              </p>
              <p className="font-medium text-foreground mt-0.5">
                {new Date(log.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Actor & Target ID row */}
          <div className="p-3 rounded-lg border border-border/60 bg-card space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-sans">Actor ID:</span>
              <span className="text-foreground">{log.actorId || 'system-service'}</span>
            </div>
            {log.resourceId && (
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-muted-foreground font-sans">Target Resource ID:</span>
                <span className="text-foreground">{log.resourceId}</span>
              </div>
            )}
            {log.schoolId && (
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-muted-foreground font-sans">Campus School ID:</span>
                <span className="text-foreground">{log.schoolId}</span>
              </div>
            )}
            {log.userAgent && (
              <div className="flex items-start justify-between pt-1 border-t border-border/40 gap-2">
                <span className="text-muted-foreground font-sans shrink-0 flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-muted-foreground" />
                  User Agent:
                </span>
                <span className="text-muted-foreground truncate text-right font-sans">
                  {log.userAgent}
                </span>
              </div>
            )}
          </div>

          {/* Diff Payload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                State Mutation Payload & Diff
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJson}
                className="h-6 text-[11px] gap-1 px-2"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </Button>
            </div>

            {diffEntries.length > 0 ? (
              <div className="rounded-xl border border-border/70 bg-muted/20 overflow-hidden divide-y divide-border/50">
                {diffEntries.map(([key, val]) => {
                  const isRedacted = val === '[Redacted]';
                  const formattedValue =
                    typeof val === 'object' && val !== null
                      ? JSON.stringify(val, null, 2)
                      : String(val);

                  return (
                    <div
                      key={key}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/40 transition-colors"
                    >
                      <span className="font-mono text-xs font-semibold text-primary">
                        {key}
                      </span>
                      <div className="font-mono text-xs">
                        {isRedacted ? (
                          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-sans italic border">
                            Redacted Sensitive
                          </span>
                        ) : typeof val === 'boolean' ? (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[11px] font-semibold',
                              val
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-destructive/10 text-destructive',
                            )}
                          >
                            {String(val)}
                          </span>
                        ) : (
                          <span className="text-foreground bg-background/80 px-2 py-1 rounded border border-border/50 inline-block break-all max-w-sm">
                            {formattedValue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl border border-dashed border-border/80 bg-muted/10 text-muted-foreground">
                <p className="text-xs italic">
                  No state delta payload recorded for this action.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-end">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
