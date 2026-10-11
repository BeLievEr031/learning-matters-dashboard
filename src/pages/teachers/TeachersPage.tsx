import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  School as SchoolIcon,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  Mail,
  Phone,
  GraduationCap,
  Eye,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import {
  teachersApi,
  type Teacher,
  type ListTeachersParams,
} from '../../api/teachers.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { TeacherFormModal } from './components/TeacherFormModal.tsx';
import { TeacherDetailsModal } from './components/TeacherDetailsModal.tsx';
import { DeleteTeacherDialog } from './components/DeleteTeacherDialog.tsx';
import { cn } from '../../lib/utils.ts';
import type { TeacherStatus } from '../../schemas/teachers.schema.ts';

export function TeachersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, getEffectiveRole, activeSchoolId } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const canManage =
    effectiveRole === 'super_admin' ||
    effectiveRole === 'admin' ||
    effectiveRole === 'principal';

  // Target school is activeSchoolId for super_admin, or user.schoolId for tenant users
  const targetSchoolId =
    effectiveRole === 'super_admin'
      ? activeSchoolId
      : user?.schoolId || activeSchoolId;

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search and filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeacherStatus | ''>('');
  const [sortBy, setSortBy] = useState<ListTeachersParams['sortBy']>('firstName');
  const [sortOrder, setSortOrder] = useState<ListTeachersParams['sortOrder']>('asc');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Dialogs
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const [teacherToView, setTeacherToView] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const queryParams: ListTeachersParams = {
    limit: 15,
    cursor,
    status: statusFilter || undefined,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['teachers', targetSchoolId, queryParams],
    queryFn: () => {
      if (!targetSchoolId) {
        return Promise.resolve({
          data: [],
          pageInfo: { hasMore: false, nextCursor: null },
        });
      }
      return teachersApi.listBySchool(targetSchoolId, queryParams);
    },
    enabled: Boolean(targetSchoolId),
  });

  const teachers = data?.data || [];
  const nextCursor = data?.pageInfo?.nextCursor || data?.meta?.nextCursor || null;
  const hasMore = Boolean(data?.pageInfo?.hasMore || data?.meta?.hasMore || nextCursor);

  // Status metrics
  const activeCount = teachers.filter((t) => t.status === 'active').length;
  const onLeaveCount = teachers.filter((t) => t.status === 'on_leave').length;
  const inactiveCount = teachers.filter((t) => t.status === 'inactive' || t.status === 'terminated').length;

  const handleCreateNew = () => {
    setTeacherToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setFormModalOpen(true);
  };

  const handleView = (teacher: Teacher) => {
    setTeacherToView(teacher);
  };

  const handleDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
  };

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorHistory((prev) => [...prev, cursor || '']);
      setCursor(nextCursor);
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
    setStatusFilter('');
    setSortBy('firstName');
    setSortOrder('asc');
    setCursor(undefined);
    setCursorHistory([]);
  };

  const getStatusBadge = (status: TeacherStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            On Leave
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/60">
            Inactive
          </span>
        );
      case 'terminated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
            Terminated
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Faculty Directory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-primary" />
            Teachers & Staff
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Faculty profiles, employee IDs, academic qualifications, and teaching rosters.
          </p>
        </div>

        {canManage && targetSchoolId && (
          <div className="flex items-center gap-2.5">
            <Button onClick={handleCreateNew} className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Onboard Teacher
            </Button>
          </div>
        )}
      </div>

      {/* Super Admin Missing School Notice */}
      {!targetSchoolId && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <SchoolIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-base">No Active School Selected</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Teacher profiles and staff directories are scoped to individual institutions. Please select an active school from the top navigation header switcher.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Target School Counters */}
      {targetSchoolId && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Faculty
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{teachers.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Briefcase className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Active Teachers
                </p>
                <p className="text-2xl font-bold text-emerald-500 mt-0.5">{activeCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  On Leave
                </p>
                <p className="text-2xl font-bold text-blue-500 mt-0.5">{onLeaveCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Inactive / Terminated
                </p>
                <p className="text-2xl font-bold text-muted-foreground mt-0.5">{inactiveCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-muted text-muted-foreground border border-border/60">
                <Filter className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      {targetSchoolId && (
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCursor(undefined);
                    setCursorHistory([]);
                  }}
                  placeholder="Search teacher by name, email, or employee ID..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Controls right */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status selector */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as TeacherStatus | '');
                      setCursor(undefined);
                      setCursorHistory([]);
                    }}
                    className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>

                {/* Sort selector */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as ListTeachersParams['sortBy']);
                    setSortOrder(order as ListTeachersParams['sortOrder']);
                    setCursor(undefined);
                    setCursorHistory([]);
                  }}
                  className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="firstName-asc">Name (A-Z)</option>
                  <option value="firstName-desc">Name (Z-A)</option>
                  <option value="employeeId-asc">Employee ID (A-Z)</option>
                  <option value="createdAt-desc">Newest Joined</option>
                </select>

                {/* Grid / Table Toggle */}
                <div className="flex items-center border border-input rounded-md p-0.5 bg-muted/40">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded text-xs transition-colors',
                      viewMode === 'grid'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={cn(
                      'p-1.5 rounded text-xs transition-colors',
                      viewMode === 'table'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    title="Table View"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Refresh */}
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  title="Refresh data"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
                </Button>

                {(search || statusFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs h-9 px-2 text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Teachers Listing */}
      {targetSchoolId && (
        <>
          {isLoading && (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading faculty directory...</p>
            </div>
          )}

          {!isLoading && teachers.length === 0 && (
            <Card className="border-dashed border-border/80 bg-card/40 py-16 text-center">
              <CardContent className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-base">No Faculty Members Found</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {search || statusFilter
                    ? 'No faculty members match your current filter parameters.'
                    : 'Start building your teaching staff by onboarding faculty profiles with employee IDs and qualifications.'}
                </p>
                {canManage && !search && !statusFilter && (
                  <Button onClick={handleCreateNew} size="sm" className="mt-2 gap-2">
                    <Plus className="w-4 h-4" /> Onboard First Teacher
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {!isLoading && teachers.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => (
                <Card
                  key={teacher.id}
                  className="group border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card/60 backdrop-blur-sm flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                          {teacher.firstName[0]}
                          {teacher.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-muted border border-border/60">
                              {teacher.employeeId}
                            </span>
                            {getStatusBadge(teacher.status)}
                          </div>
                          <h3 className="font-bold text-foreground text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                      {teacher.phone && (
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          <span className="truncate">{teacher.phone}</span>
                        </div>
                      )}
                      {teacher.qualification && (
                        <div className="flex items-center gap-2 truncate text-foreground font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                          <span className="truncate">{teacher.qualification}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <button
                          type="button"
                          onClick={() => handleView(teacher)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Profile
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => navigate(`/assignments?teacherId=${teacher.id}`)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <Layers className="w-3.5 h-3.5" /> Schedule
                        </button>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(teacher)}
                            title="Edit Teacher"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(teacher)}
                            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title="Deactivate Teacher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Table View */}
          {!isLoading && teachers.length > 0 && viewMode === 'table' && (
            <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Teacher Name</th>
                      <th className="py-3 px-4">Contact Details</th>
                      <th className="py-3 px-4">Qualification</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {teachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {teacher.employeeId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {teacher.firstName[0]}
                              {teacher.lastName[0]}
                            </div>
                            <span>
                              {teacher.firstName} {teacher.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground space-y-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </div>
                          {teacher.phone && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Phone className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                              <span className="truncate">{teacher.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {teacher.qualification || '—'}
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(teacher.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(teacher)}
                              className="text-[11px] h-7 gap-1"
                            >
                              <Eye className="w-3 h-3" /> View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/assignments?teacherId=${teacher.id}`)}
                              className="text-[11px] h-7 gap-1"
                            >
                              <Layers className="w-3 h-3" /> Classes
                            </Button>
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleEdit(teacher)}
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDelete(teacher)}
                                  className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                  title="Deactivate"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Cursor Pagination Bar */}
          {!isLoading && teachers.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>Showing {teachers.length} faculty members</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cursorHistory.length === 0}
                  onClick={handlePrevPage}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={handleNextPage}
                  className="gap-1 text-xs"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {targetSchoolId && (
        <TeacherFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          teacherToEdit={teacherToEdit}
          schoolId={targetSchoolId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['teachers', targetSchoolId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      )}

      <TeacherDetailsModal
        open={Boolean(teacherToView)}
        onOpenChange={(open) => !open && setTeacherToView(null)}
        teacher={teacherToView}
        onEdit={handleEdit}
        canManage={canManage}
      />

      <DeleteTeacherDialog
        open={Boolean(teacherToDelete)}
        onOpenChange={(open) => !open && setTeacherToDelete(null)}
        teacher={teacherToDelete}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['teachers', targetSchoolId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
}
