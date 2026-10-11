import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  School as SchoolIcon,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Layers,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import {
  assignmentsApi,
  type TeacherAssignmentDetail,
  type ListAssignmentsParams,
} from '../../api/assignments.api.ts';
import { boardsApi } from '../../api/boards.api.ts';
import { gradesApi, type Grade } from '../../api/grades.api.ts';
import { teachersApi, type Teacher } from '../../api/teachers.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { AssignmentFormModal } from './components/AssignmentFormModal.tsx';
import { RevokeAssignmentDialog } from './components/RevokeAssignmentDialog.tsx';
import { cn } from '../../lib/utils.ts';
import { toast } from 'sonner';

export function AssignmentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, getEffectiveRole, activeSchoolId } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const canManage =
    effectiveRole === 'super_admin' ||
    effectiveRole === 'admin' ||
    effectiveRole === 'principal';

  const effectiveSchoolId =
    effectiveRole === 'super_admin' ? (activeSchoolId || '') : (user?.schoolId || '');

  // URL parameters or state
  const paramTeacherId = searchParams.get('teacherId') || '';
  const paramGradeId = searchParams.get('gradeId') || '';
  const paramSubjectId = searchParams.get('subjectId') || '';

  // Local filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(paramTeacherId);
  const [selectedGradeId, setSelectedGradeId] = useState<string>(paramGradeId);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination cursor history
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Modal dialog states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [revokingAssignment, setRevokingAssignment] = useState<TeacherAssignmentDetail | null>(null);

  // Fetch boards & grades for filter dropdown
  const { data: boardsData } = useQuery({
    queryKey: ['boards', effectiveSchoolId],
    queryFn: () => boardsApi.list(effectiveSchoolId, { limit: 100, status: 'active' }),
    enabled: Boolean(effectiveSchoolId),
    staleTime: 5 * 60 * 1000,
  });

  const boards = useMemo(() => boardsData?.data || [], [boardsData?.data]);
  const activeBoardId = boards[0]?.id || '';

  const { data: gradesData } = useQuery({
    queryKey: ['grades', activeBoardId],
    queryFn: () => gradesApi.list(activeBoardId, { limit: 100, status: 'active' }),
    enabled: Boolean(activeBoardId),
    staleTime: 5 * 60 * 1000,
  });

  const grades = useMemo(() => gradesData?.data || [], [gradesData?.data]);

  // Fetch teachers for filter dropdown
  const { data: teachersData } = useQuery({
    queryKey: ['teachers', effectiveSchoolId, { limit: 100 }],
    queryFn: () => teachersApi.listBySchool(effectiveSchoolId, { limit: 100 }),
    enabled: Boolean(effectiveSchoolId),
    staleTime: 5 * 60 * 1000,
  });

  const teachers = useMemo(() => teachersData?.data || [], [teachersData?.data]);

  // Query assignments
  const queryParams: ListAssignmentsParams = useMemo(() => {
    const params: ListAssignmentsParams = {
      schoolId: effectiveSchoolId || undefined,
      limit: 20,
      cursor,
    };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'all') params.status = statusFilter;
    if (selectedGradeId) params.gradeId = selectedGradeId;
    const effectiveTeacher = selectedTeacherId || paramTeacherId;
    if (effectiveTeacher) params.teacherId = effectiveTeacher;
    if (paramSubjectId) params.subjectId = paramSubjectId;
    return params;
  }, [
    effectiveSchoolId,
    search,
    statusFilter,
    selectedGradeId,
    selectedTeacherId,
    paramTeacherId,
    paramSubjectId,
    cursor,
  ]);

  const {
    data: assignmentsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['teacher-assignments', queryParams],
    queryFn: () => assignmentsApi.list(queryParams),
    enabled: Boolean(effectiveSchoolId),
  });

  const assignments = useMemo(
    () => assignmentsData?.data || [],
    [assignmentsData?.data],
  );
  const meta = assignmentsData?.meta;

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
      return assignmentsApi.update(id, { status: newStatus });
    },
    onSuccess: (updated) => {
      toast.success(`Assignment marked as ${updated.status}`);
      void queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    },
    onError: (err: unknown) => {
      const errMessage = err instanceof Error ? err.message : 'Failed to update assignment status';
      toast.error(errMessage);
    },
  });

  // Metrics summary
  const metrics = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter((a: TeacherAssignmentDetail) => a.status === 'active').length;
    const inactive = assignments.filter((a: TeacherAssignmentDetail) => a.status === 'inactive').length;
    const uniqueTeachers = new Set(assignments.map((a: TeacherAssignmentDetail) => a.teacherId)).size;
    return { total, active, inactive, uniqueTeachers };
  }, [assignments]);

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
    setStatusFilter('all');
    setSelectedTeacherId('');
    setSelectedGradeId('');
    setCursor(undefined);
    setCursorHistory([]);
    if (searchParams.toString()) {
      setSearchParams({});
    }
  };

  // Super Admin missing active school guard
  if (effectiveRole === 'super_admin' && !activeSchoolId) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
          <SchoolIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Select a School to Manage Subject Allocations</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Teacher subject assignments belong to specific school campuses. Please choose a school from the tenant selector in the top navigation bar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Teacher Subject Allocations</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Workload Matrix
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Map faculty members to designated academic grades and curriculum subjects.
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
            Refresh
          </Button>

          {canManage && (
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Assign Teacher
            </Button>
          )}
        </div>
      </div>

      {/* Param Filter Alert if filtered by teacherId */}
      {paramTeacherId && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Filtering assignments for a specific teacher.</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 hover:bg-primary/10"
            onClick={handleResetFilters}
          >
            Clear Filter
          </Button>
        </div>
      )}

      {/* Workload Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Allocations
              </p>
              <p className="text-2xl font-bold mt-1">{meta?.total ?? metrics.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Active Workloads
              </p>
              <p className="text-2xl font-bold mt-1 text-emerald-500">{metrics.active}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Inactive / Suspended
              </p>
              <p className="text-2xl font-bold mt-1 text-muted-foreground">{metrics.inactive}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Unique Faculty
              </p>
              <p className="text-2xl font-bold mt-1 text-indigo-500">{metrics.uniqueTeachers}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter Bar and View Mode Switcher */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teacher, subject, or grade..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCursor(undefined);
              }}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Teacher Dropdown */}
          <div className="w-full sm:w-44">
            <select
              aria-label="Filter by Teacher"
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setCursor(undefined);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Teachers</option>
              {teachers.map((t: Teacher) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.employeeId || 'Teacher'})
                </option>
              ))}
            </select>
          </div>

          {/* Grade Dropdown */}
          <div className="w-full sm:w-44">
            <select
              aria-label="Filter by Grade"
              value={selectedGradeId}
              onChange={(e) => {
                setSelectedGradeId(e.target.value);
                setCursor(undefined);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Grades</option>
              {grades.map((g: Grade) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex rounded-md border border-input bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCursor(undefined);
              }}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-sm transition-colors',
                statusFilter === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('active');
                setCursor(undefined);
              }}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-sm transition-colors',
                statusFilter === 'active'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('inactive');
                setCursor(undefined);
              }}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-sm transition-colors',
                statusFilter === 'inactive'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-input rounded-md p-1 bg-muted/30 self-end md:self-auto">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-2.5 gap-1.5 text-xs"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8 px-2.5 gap-1.5 text-xs"
          >
            <TableIcon className="w-3.5 h-3.5" />
            Table
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-4/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-destructive">Failed to load teacher assignments</p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred during query'}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-semibold">No Teacher Allocations Found</h3>
            <p className="text-xs text-muted-foreground">
              {search || selectedGradeId || selectedTeacherId || statusFilter !== 'all'
                ? 'No allocations match your active search filters. Try clearing filters or revising terms.'
                : 'No teachers have been assigned to curriculum subjects and grades yet.'}
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {search || selectedGradeId || selectedTeacherId || statusFilter !== 'all' ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Reset Filters
              </Button>
            ) : canManage ? (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create First Assignment
              </Button>
            ) : null}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment: TeacherAssignmentDetail) => {
            const teacherFullName =
              assignment.teacherFirstName && assignment.teacherLastName
                ? `${assignment.teacherFirstName} ${assignment.teacherLastName}`
                : assignment.teacherFirstName || assignment.teacherLastName || 'Assigned Teacher';

            return (
              <Card
                key={assignment.id}
                className={cn(
                  'border-border/60 hover:border-primary/40 transition-all hover:shadow-sm flex flex-col justify-between group',
                  assignment.status === 'inactive' && 'opacity-70 bg-muted/10'
                )}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top row: Teacher Avatar + Info + Status Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 border border-primary/20">
                        {teacherFullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {teacherFullName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          {assignment.teacherEmployeeId ? (
                            <span className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded">
                              ID: {assignment.teacherEmployeeId}
                            </span>
                          ) : (
                            <span className="truncate">{assignment.teacherEmail || 'Faculty'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0',
                        assignment.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          assignment.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'
                        )}
                      />
                      {assignment.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Mapping Details Pill Box */}
                  <div className="rounded-lg bg-muted/30 border border-border/50 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        Grade
                      </span>
                      <span className="font-medium text-foreground">
                        {assignment.gradeName || 'Assigned Grade'}{' '}
                        {assignment.gradeCode && (
                          <span className="text-muted-foreground font-mono text-[10px]">
                            ({assignment.gradeCode})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        Subject
                      </span>
                      <span className="font-medium text-foreground">
                        {assignment.subjectName || 'Assigned Subject'}{' '}
                        {assignment.subjectCode && (
                          <span className="text-muted-foreground font-mono text-[10px]">
                            ({assignment.subjectCode})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Created timestamp & Quick actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(assignment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 gap-1"
                          title={
                            assignment.status === 'active'
                              ? 'Deactivate assignment'
                              : 'Activate assignment'
                          }
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: assignment.id,
                              newStatus: assignment.status === 'active' ? 'inactive' : 'active',
                            })
                          }
                          disabled={toggleStatusMutation.isPending}
                        >
                          {assignment.status === 'active' ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-500" />
                              <span className="text-[11px]">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                              <span className="text-[11px]">Inactive</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive transition-colors"
                          title="Revoke allocation"
                          onClick={() => setRevokingAssignment(assignment)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Teacher / Faculty</th>
                  <th className="px-4 py-3.5">Grade</th>
                  <th className="px-4 py-3.5">Subject</th>
                  <th className="px-4 py-3.5">Allocated Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  {canManage && <th className="px-4 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assignments.map((assignment: TeacherAssignmentDetail) => {
                  const teacherFullName =
                    assignment.teacherFirstName && assignment.teacherLastName
                      ? `${assignment.teacherFirstName} ${assignment.teacherLastName}`
                      : assignment.teacherFirstName || assignment.teacherLastName || 'Assigned Teacher';

                  return (
                    <tr
                      key={assignment.id}
                      className={cn(
                        'hover:bg-muted/30 transition-colors',
                        assignment.status === 'inactive' && 'opacity-70'
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0 border border-primary/20">
                            {teacherFullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{teacherFullName}</div>
                            <div className="text-xs text-muted-foreground">
                              {assignment.teacherEmployeeId ? (
                                <span className="font-mono">ID: {assignment.teacherEmployeeId}</span>
                              ) : (
                                assignment.teacherEmail
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">
                          {assignment.gradeName || 'Grade'}
                        </div>
                        {assignment.gradeCode && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {assignment.gradeCode}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">
                          {assignment.subjectName || 'Subject'}
                        </div>
                        {assignment.subjectCode && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {assignment.subjectCode}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {new Date(assignment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                            assignment.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border border-border'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              assignment.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'
                            )}
                          />
                          {assignment.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs px-2 gap-1"
                              onClick={() =>
                                toggleStatusMutation.mutate({
                                  id: assignment.id,
                                  newStatus: assignment.status === 'active' ? 'inactive' : 'active',
                                })
                              }
                              disabled={toggleStatusMutation.isPending}
                            >
                              {assignment.status === 'active' ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-emerald-500" />
                                  <span className="hidden sm:inline">Active</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                                  <span className="hidden sm:inline">Inactive</span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              title="Revoke allocation"
                              onClick={() => setRevokingAssignment(assignment)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {meta && (meta.hasMore || cursorHistory.length > 0) && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{assignments.length}</span> allocations
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

      {/* Quick Links banner to Teachers and Subjects */}
      <div className="mt-8 p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Need to register new faculty members or configure curriculum subjects?</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/teachers')}
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Staff Directory <ArrowRight className="w-3 h-3" />
          </button>
          <span className="text-border">|</span>
          <button
            type="button"
            onClick={() => navigate('/subjects')}
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Subject Catalogue <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Assignment Create Modal */}
      {canManage && effectiveSchoolId && (
        <AssignmentFormModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          schoolId={effectiveSchoolId}
          initialTeacherId={paramTeacherId || undefined}
          initialGradeId={paramGradeId || undefined}
          initialSubjectId={paramSubjectId || undefined}
          onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] })}
        />
      )}

      {/* Revoke Assignment Dialog */}
      {canManage && revokingAssignment && (
        <RevokeAssignmentDialog
          open={!!revokingAssignment}
          onOpenChange={(open) => !open && setRevokingAssignment(null)}
          assignment={revokingAssignment}
          onSuccess={() => {
            setRevokingAssignment(null);
            void queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
          }}
        />
      )}
    </div>
  );
}
