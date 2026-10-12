import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '../../../components/ui/input.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { cn } from '../../../lib/utils.ts';

export interface AuditLogFiltersBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  resourceFilter: string;
  onResourceChange: (resource: string) => void;
  actionFilter: string;
  onActionChange: (action: string) => void;
  onReset: () => void;
}

const RESOURCE_OPTIONS = [
  { value: '', label: 'All Resources' },
  { value: 'schools', label: 'Schools' },
  { value: 'boards', label: 'Boards' },
  { value: 'grades', label: 'Grades' },
  { value: 'subjects', label: 'Subjects' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'students', label: 'Students' },
  { value: 'teacher-assignments', label: 'Assignments' },
  { value: 'principals', label: 'Principals' },
  { value: 'users', label: 'User Accounts' },
];

const ACTION_TABS = [
  { id: '', label: 'All Actions' },
  { id: 'CREATE', label: 'Create' },
  { id: 'UPDATE', label: 'Update' },
  { id: 'DELETE', label: 'Delete' },
  { id: 'TRANSFER', label: 'Transfer' },
];

export function AuditLogFiltersBar({
  search,
  onSearchChange,
  resourceFilter,
  onResourceChange,
  actionFilter,
  onActionChange,
  onReset,
}: AuditLogFiltersBarProps) {
  const hasActiveFilters = Boolean(search || resourceFilter || actionFilter);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by action, actor, resource ID, or IP..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Resource Type Dropdown */}
        <div className="w-full sm:w-48">
          <select
            aria-label="Filter by Resource"
            value={resourceFilter}
            onChange={(e) => onResourceChange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {RESOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Action */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Action Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs text-muted-foreground font-medium shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Action:
        </span>
        {ACTION_TABS.map((tab) => {
          const isSelected = actionFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onActionChange(tab.id)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 border',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
