import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { schoolsApi, type School, type ListSchoolsParams } from '../../api/schools.api.ts';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card } from '../../components/ui/card.tsx';
import { SchoolFormModal } from './components/SchoolFormModal.tsx';
import { DeleteSchoolDialog } from './components/DeleteSchoolDialog.tsx';
import { cn } from '@/lib/utils';

export function SchoolsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'suspended' | ''>('');
  const [sortBy, setSortBy] = useState<ListSchoolsParams['sortBy']>('createdAt');
  const [sortOrder, setSortOrder] = useState<ListSchoolsParams['sortOrder']>('desc');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [schoolToEdit, setSchoolToEdit] = useState<School | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  const queryParams: ListSchoolsParams = {
    limit: 10,
    cursor,
    status: statusFilter || undefined,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['schools', 'list', queryParams],
    queryFn: () => schoolsApi.list(queryParams),
  });

  const schools = data?.data || [];
  const meta = data?.meta;

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

  const handleCreateNew = () => {
    setSchoolToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (school: School) => {
    setSchoolToEdit(school);
    setFormModalOpen(true);
  };

  const handleDelete = (school: School) => {
    setSchoolToDelete(school);
    setDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['schools'] });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Schools Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage multi-tenant school institutions, educational affiliations, and access credentials.
          </p>
        </div>

        <Button onClick={handleCreateNew} className="gap-2 font-semibold shadow-md shrink-0">
          <Plus className="w-4 h-4" />
          Register School
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCursor(undefined);
              setCursorHistory([]);
            }}
            placeholder="Search by school name or code..."
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'active' | 'inactive' | 'suspended' | '');
              setCursor(undefined);
              setCursorHistory([]);
            }}
            className="h-10 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Sort selector */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [
                ListSchoolsParams['sortBy'],
                ListSchoolsParams['sortOrder'],
              ];
              setSortBy(field);
              setSortOrder(order);
            }}
            className="h-10 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="code-asc">Code (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Schools Table */}
      <Card className="overflow-hidden border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4">School Institution</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading schools directory...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && schools.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="w-10 h-10 text-muted-foreground/40" />
                      <p className="font-semibold text-foreground text-sm">No schools registered</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {search || statusFilter
                          ? 'No institutions match the current filters. Try resetting the search or filter.'
                          : 'Get started by registering your first educational institution.'}
                      </p>
                      {!search && !statusFilter && (
                        <Button size="sm" onClick={handleCreateNew} className="mt-2 gap-1.5">
                          <Plus className="w-4 h-4" /> Register School
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                schools.map((school) => (
                  <tr key={school.id} className="hover:bg-muted/30 transition-colors group">
                    {/* School Name & Avatar */}
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {school.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate text-foreground">{school.name}</p>
                          {school.website && (
                            <a
                              href={school.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                            >
                              <span>Visit Website</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-[11px] text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-muted border border-border/60">
                        {school.code}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {school.city || 'City unassigned'}
                      </p>
                      <p className="text-[11px]">
                        {[school.state, school.country].filter(Boolean).join(', ') || 'No location set'}
                      </p>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 text-muted-foreground space-y-0.5">
                      {school.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{school.email}</span>
                        </div>
                      )}
                      {school.phone && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{school.phone}</span>
                        </div>
                      )}
                      {!school.email && !school.phone && (
                        <span className="text-muted-foreground/60 italic text-[11px]">No contact added</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          school.status === 'active' && 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                          school.status === 'inactive' && 'bg-muted text-muted-foreground border border-border/60',
                          school.status === 'suspended' && 'bg-destructive/10 text-destructive border border-destructive/20',
                        )}
                      >
                        {school.status}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(school)}
                          title="Edit School"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(school)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Deactivate School"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && (
          <div className="p-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Total registered schools: <strong className="text-foreground">{meta.total}</strong>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={cursorHistory.length === 0 || isLoading}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!meta.hasMore || isPlaceholderData || isLoading}
                className="gap-1 text-xs"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <SchoolFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        schoolToEdit={schoolToEdit}
        onSuccess={handleRefresh}
      />

      <DeleteSchoolDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        school={schoolToDelete}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
