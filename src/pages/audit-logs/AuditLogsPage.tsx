import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  RefreshCw,
  Table as TableIcon,
  Clock,
  Layers,
  Shield,
  Activity,
  History,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Globe,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import { auditLogsApi, type AuditLog, type ListAuditLogsParams } from '../../api/audit-logs.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { AuditLogFiltersBar } from './components/AuditLogFiltersBar.tsx';
import { AuditLogDiffViewerModal } from './components/AuditLogDiffViewerModal.tsx';
import { cn } from '../../lib/utils.ts';

export function AuditLogsPage() {
  const { user, getEffectiveRole, activeSchoolId } = useAuthStore();
  const effectiveRole = getEffectiveRole();
  const isSuperAdmin = effectiveRole === 'super_admin';

  const effectiveSchoolId = isSuperAdmin ? (activeSchoolId || '') : (user?.schoolId || '');

  // Filter States
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Pagination Cursor History
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Selected Log for JSON Diff Viewer Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Query Params
  const queryParams: ListAuditLogsParams = useMemo(() => {
    return {
      limit: 50,
      cursor,
      schoolId: effectiveSchoolId || undefined,
      resourceType: resourceFilter || undefined,
      action: actionFilter || undefined,
    };
  }, [cursor, effectiveSchoolId, resourceFilter, actionFilter]);

  const {
    data: auditData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs', queryParams],
    queryFn: () => auditLogsApi.list(queryParams),
  });

  const rawLogs = useMemo(() => auditData?.data || [], [auditData?.data]);
  const meta = auditData?.meta;

  // In-memory filter on search query
  const logs = useMemo(() => {
    if (!search.trim()) return rawLogs;
    const query = search.trim().toLowerCase();
    return rawLogs.filter((log) => {
      const matchAction = log.action.toLowerCase().includes(query);
      const matchResource = log.resourceType.toLowerCase().includes(query);
      const matchActorRole = (log.actorRole || '').toLowerCase().includes(query);
      const matchIp = (log.ip || '').toLowerCase().includes(query);
      const matchId = log.id.toLowerCase().includes(query);
      const matchResourceId = (log.resourceId || '').toLowerCase().includes(query);
      return (
        matchAction ||
        matchResource ||
        matchActorRole ||
        matchIp ||
        matchId ||
        matchResourceId
      );
    });
  }, [rawLogs, search]);

  // Metric Summaries
  const metrics = useMemo(() => {
    const total = rawLogs.length;
    const mutations = rawLogs.filter((l) => {
      const act = l.action.toUpperCase();
      return (
        act.includes('CREATE') ||
        act.includes('UPDATE') ||
        act.includes('DELETE') ||
        act.includes('TRANSFER')
      );
    }).length;
    const uniqueResources = new Set(rawLogs.map((l) => l.resourceType)).size;
    const withDiff = rawLogs.filter((l) => l.diff && Object.keys(l.diff).length > 0).length;
    return { total, mutations, uniqueResources, withDiff };
  }, [rawLogs]);

  const handleNextPage = () => {
    if (meta?.nextCursor) {
      setCursorHistory((prev) => [...prev, cursor || '']);
      setCursor(meta.nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prevCursor = cursorHistory[cursorHistory.length - 1];
      setCursorHistory((prev) => prev.slice(0, -1));
      setCursor(prevCursor || undefined);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setResourceFilter('');
    setActionFilter('');
    setCursor(undefined);
    setCursorHistory([]);
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

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Audit Trail & Compliance</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Immutable Ledger
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Chronological audit log tracking administrative state mutations, logins, and API actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            Refresh Trail
          </Button>
        </div>
      </div>

      {/* Compliance Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Audited Events
              </p>
              <p className="text-2xl font-bold mt-1">{meta?.total ?? metrics.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Mutations Tracked
              </p>
              <p className="text-2xl font-bold mt-1 text-emerald-500">{metrics.mutations}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Target Modules
              </p>
              <p className="text-2xl font-bold mt-1 text-blue-500">{metrics.uniqueResources}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Payload Diffs
              </p>
              <p className="text-2xl font-bold mt-1 text-purple-500">{metrics.withDiff}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <History className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-start justify-between">
        <div className="flex-1">
          <AuditLogFiltersBar
            search={search}
            onSearchChange={setSearch}
            resourceFilter={resourceFilter}
            onResourceChange={setResourceFilter}
            actionFilter={actionFilter}
            onActionChange={setActionFilter}
            onReset={handleResetFilters}
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-input rounded-md p-1 bg-muted/30 self-end md:self-auto shrink-0 mt-0 sm:mt-0">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8 px-2.5 gap-1.5 text-xs"
          >
            <TableIcon className="w-3.5 h-3.5" />
            Table
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className="h-8 px-2.5 gap-1.5 text-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            Timeline
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-destructive">Failed to load audit logs</p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred during query'}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-semibold">No Audit Records Found</h3>
            <p className="text-xs text-muted-foreground">
              {search || resourceFilter || actionFilter
                ? 'No audit log entries match your filter criteria. Try clearing search filters.'
                : 'No write mutations or security audit logs recorded yet.'}
            </p>
          </div>
          {(search || resourceFilter || actionFilter) && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Action Event</th>
                  <th className="px-4 py-3.5">Target Resource</th>
                  <th className="px-4 py-3.5">Actor & Role</th>
                  <th className="px-4 py-3.5">Origin IP</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5 text-right">Payload Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                {logs.map((log) => {
                  const hasDiff = Boolean(log.diff && Object.keys(log.diff).length > 0);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/30 transition-colors font-sans cursor-pointer group"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 uppercase tracking-wide',
                            getActionColor(log.action),
                          )}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-sans">
                        <div className="font-semibold text-foreground capitalize">
                          {log.resourceType}
                        </div>
                        {log.resourceId && (
                          <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[140px]">
                            {log.resourceId}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-sans">
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-primary shrink-0" />
                          <span className="uppercase text-[11px]">{log.actorRole || 'System'}</span>
                        </div>
                        {log.actorId && (
                          <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[130px]">
                            {log.actorId}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {log.ip || '127.0.0.1'}
                      </td>

                      <td className="px-4 py-3.5 font-sans text-xs text-muted-foreground">
                        <div className="text-foreground font-medium">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-sans">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'h-7 text-xs gap-1 px-2.5',
                            hasDiff ? 'text-primary hover:text-primary font-medium' : 'text-muted-foreground',
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {hasDiff ? 'View Diff' : 'Details'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline Feed View */
        <div className="space-y-3">
          {logs.map((log) => {
            const hasDiff = Boolean(log.diff && Object.keys(log.diff).length > 0);

            return (
              <Card
                key={log.id}
                className="border-border/60 hover:border-primary/40 transition-all hover:shadow-xs cursor-pointer group"
                onClick={() => setSelectedLog(log)}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-muted/60 text-muted-foreground shrink-0 mt-0.5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Activity className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'text-[11px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide',
                            getActionColor(log.action),
                          )}
                        >
                          {log.action}
                        </span>
                        <span className="font-semibold text-foreground capitalize">
                          {log.resourceType}
                        </span>
                        {log.resourceId && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            ID: {log.resourceId.slice(0, 8)}...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-primary" />
                          {log.actorRole || 'System'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {log.ip || '127.0.0.1'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {hasDiff ? 'Inspect Diff' : 'View Details'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && (meta.hasMore || cursorHistory.length > 0) && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{logs.length}</span> audit records
            {meta.total ? ` of ${meta.total} total` : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={cursorHistory.length === 0 || isFetching}
              onClick={handlePrevPage}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasMore || isFetching}
              onClick={handleNextPage}
              className="gap-1 text-xs"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Institutional Compliance Notice */}
      <div className="mt-8 p-4 rounded-xl border border-border/60 bg-muted/20 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Tamper-Evident Compliance Trail</p>
          <p className="text-muted-foreground leading-relaxed">
            All POST, PUT, PATCH, and DELETE operations across schools, faculty, students, and users are automatically captured and timestamped by the server audit logging engine. Sensitive credentials and secrets are automatically redacted prior to database persistence.
          </p>
        </div>
      </div>

      {/* JSON Diff Viewer Modal */}
      {selectedLog && (
        <AuditLogDiffViewerModal
          open={Boolean(selectedLog)}
          onOpenChange={(open) => !open && setSelectedLog(null)}
          log={selectedLog}
        />
      )}
    </div>
  );
}
