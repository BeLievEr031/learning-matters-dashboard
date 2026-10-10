import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Layers,
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
  UserCheck,
  Users,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import { gradesApi, type Grade, type ListGradesParams } from '../../api/grades.api.ts';
import { boardsApi, type Board } from '../../api/boards.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { GradeFormModal } from './components/GradeFormModal.tsx';
import { AssignClassTeacherModal } from './components/AssignClassTeacherModal.tsx';
import { DeleteGradeDialog } from './components/DeleteGradeDialog.tsx';
import { cn } from '../../lib/utils.ts';
import type { GradeStatus } from '../../schemas/grades.schema.ts';

export function GradesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, getEffectiveRole, activeSchoolId } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const canManage = effectiveRole === 'super_admin' || effectiveRole === 'admin';
  const canAssignTeacher =
    effectiveRole === 'super_admin' || effectiveRole === 'admin' || effectiveRole === 'principal';

  // Target school is activeSchoolId for super_admin, or user.schoolId for tenant users
  const targetSchoolId =
    effectiveRole === 'super_admin'
      ? activeSchoolId
      : user?.schoolId || activeSchoolId;

  // Selected board state
  const urlBoardId = searchParams.get('boardId') || '';
  const [manualBoardId, setManualBoardId] = useState<string>('');

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search and filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GradeStatus | ''>('');
  const [sortBy, setSortBy] = useState<ListGradesParams['sortBy']>('gradeNumber');
  const [sortOrder, setSortOrder] = useState<ListGradesParams['sortOrder']>('asc');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Dialogs
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [gradeToEdit, setGradeToEdit] = useState<Grade | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<Grade | null>(null);
  const [gradeForTeacher, setGradeForTeacher] = useState<Grade | null>(null);

  // Fetch school boards
  const { data: boardsData, isLoading: isLoadingBoards } = useQuery({
    queryKey: ['boards', targetSchoolId],
    queryFn: () => {
      if (!targetSchoolId) return Promise.resolve({ data: [] });
      return boardsApi.list(targetSchoolId, { limit: 100, status: 'active' });
    },
    enabled: Boolean(targetSchoolId),
  });

  const boards: Board[] = boardsData?.data || [];

  // Derived effective board ID (no useEffect required)
  const selectedBoardId =
    manualBoardId && boards.some((b) => b.id === manualBoardId)
      ? manualBoardId
      : urlBoardId && boards.some((b) => b.id === urlBoardId)
        ? urlBoardId
        : boards[0]?.id || '';

  const handleSelectBoard = (newBoardId: string) => {
    setManualBoardId(newBoardId);
    setSearchParams(newBoardId ? { boardId: newBoardId } : {});
    setCursor(undefined);
    setCursorHistory([]);
  };

  const queryParams: ListGradesParams = {
    limit: 15,
    cursor,
    status: statusFilter || undefined,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  };

  // Fetch grades for the selected board
  const { data: gradesData, isLoading: isLoadingGrades, isFetching, refetch } = useQuery({
    queryKey: ['grades', selectedBoardId, queryParams],
    queryFn: () => {
      if (!selectedBoardId) {
        return Promise.resolve({
          data: [],
          pageInfo: { hasMore: false, nextCursor: null },
        });
      }
      return gradesApi.list(selectedBoardId, queryParams);
    },
    enabled: Boolean(selectedBoardId),
  });

  const grades = gradesData?.data || [];
  const nextCursor = gradesData?.pageInfo?.nextCursor || gradesData?.meta?.nextCursor || null;
  const hasMore = Boolean(gradesData?.pageInfo?.hasMore || gradesData?.meta?.hasMore || nextCursor);

  // Metrics
  const activeCount = grades.filter((g) => g.status === 'active').length;
  const assignedTeacherCount = grades.filter((g) => Boolean(g.classTeacherId)).length;
  const totalCapacity = grades.reduce((acc, g) => acc + (g.capacity || 0), 0);

  const handleCreateNew = () => {
    setGradeToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (grade: Grade) => {
    setGradeToEdit(grade);
    setFormModalOpen(true);
  };

  const handleDelete = (grade: Grade) => {
    setGradeToDelete(grade);
  };

  const handleAssignTeacher = (grade: Grade) => {
    setGradeForTeacher(grade);
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
    setSortBy('gradeNumber');
    setSortOrder('asc');
    setCursor(undefined);
    setCursorHistory([]);
  };

  const getStatusBadge = (status: GradeStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/60">
            Inactive
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Archived
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
            <Sparkles className="w-3.5 h-3.5" /> Academic Roster
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-primary" />
            Grades & Sections
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage class levels, classroom sections, student capacities, and faculty class teacher assignments.
          </p>
        </div>

        {canManage && selectedBoardId && (
          <div className="flex items-center gap-2.5">
            <Button onClick={handleCreateNew} className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Create Section
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
                Grades and sections are scoped to individual schools and curriculum boards. Please select an active school from the top navigation switcher.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Board Selector Tabs / Strip */}
      {targetSchoolId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" /> Curriculum Board:
            </span>
            {boards.length === 0 && !isLoadingBoards && (
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/boards')}
                className="text-xs text-primary p-0 h-auto"
              >
                + Register Curriculum Board First
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {boards.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBoard(b.id)}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border flex items-center gap-2',
                  selectedBoardId === b.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/60',
                )}
              >
                <span className="font-mono uppercase font-bold">{b.code}</span>
                <span className="hidden sm:inline font-normal text-xs opacity-90">{b.name}</span>
              </button>
            ))}

            {isLoadingBoards && (
              <div className="text-xs text-muted-foreground flex items-center gap-2 py-1">
                <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin" />
                Loading curriculum boards...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Target Metrics */}
      {selectedBoardId && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Sections
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{grades.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Layers className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Active Sections
                </p>
                <p className="text-2xl font-bold text-emerald-500 mt-0.5">{activeCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Class Teachers Set
                </p>
                <p className="text-2xl font-bold text-primary mt-0.5">{assignedTeacherCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <UserCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Capacity
                </p>
                <p className="text-2xl font-bold text-muted-foreground mt-0.5">{totalCapacity}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-muted text-muted-foreground border border-border/60">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Toolbar */}
      {selectedBoardId && (
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
                  placeholder="Search by grade name or code (e.g. G10-A)..."
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
                      setStatusFilter(e.target.value as GradeStatus | '');
                      setCursor(undefined);
                      setCursorHistory([]);
                    }}
                    className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Sort selector */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as ListGradesParams['sortBy']);
                    setSortOrder(order as ListGradesParams['sortOrder']);
                    setCursor(undefined);
                    setCursorHistory([]);
                  }}
                  className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="gradeNumber-asc">Grade Level (0-12)</option>
                  <option value="gradeNumber-desc">Grade Level (12-0)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="createdAt-desc">Newest Created</option>
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

      {/* Main Grades Listing */}
      {selectedBoardId && (
        <>
          {isLoadingGrades && (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading grades and sections...</p>
            </div>
          )}

          {!isLoadingGrades && grades.length === 0 && (
            <Card className="border-dashed border-border/80 bg-card/40 py-16 text-center">
              <CardContent className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-base">No Grade Sections Found</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {search || statusFilter
                    ? 'No grade sections match your current filters. Try resetting search parameters.'
                    : 'Get started by creating class levels (e.g. Grade 1 to 12) and sections for this curriculum board.'}
                </p>
                {canManage && !search && !statusFilter && (
                  <Button onClick={handleCreateNew} size="sm" className="mt-2 gap-2">
                    <Plus className="w-4 h-4" /> Create First Section
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {!isLoadingGrades && grades.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grades.map((grade) => (
                <Card
                  key={grade.id}
                  className="group border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card/60 backdrop-blur-sm flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-primary/10 text-primary border border-primary/20">
                            {grade.code}
                          </span>
                          {getStatusBadge(grade.status)}
                        </div>
                        <h3 className="font-bold text-foreground text-base tracking-tight truncate group-hover:text-primary transition-colors">
                          {grade.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {grade.gradeNumber === 0 ? 'Kindergarten / Prep' : `Level ${grade.gradeNumber}`}
                          {grade.section && ` • Section ${grade.section}`}
                          {grade.capacity && ` • Max ${grade.capacity} students`}
                        </p>
                      </div>
                    </div>

                    {/* Class Teacher Card Box */}
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserCheck className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                            Class Teacher
                          </p>
                          <p className="font-bold text-foreground truncate">
                            {grade.classTeacher
                              ? `${grade.classTeacher.firstName} ${grade.classTeacher.lastName}`
                              : 'Not Assigned'}
                          </p>
                        </div>
                      </div>

                      {canAssignTeacher && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignTeacher(grade)}
                          className="text-[11px] h-7 px-2 shrink-0"
                        >
                          {grade.classTeacherId ? 'Change' : 'Assign'}
                        </Button>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 font-semibold text-primary">
                        <button
                          type="button"
                          onClick={() => navigate(`/subjects?gradeId=${grade.id}`)}
                          className="hover:underline flex items-center gap-1"
                        >
                          Subjects
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => navigate(`/students?gradeId=${grade.id}`)}
                          className="hover:underline flex items-center gap-1"
                        >
                          Students
                        </button>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(grade)}
                            title="Edit Grade"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(grade)}
                            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title="Delete Grade"
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
          {!isLoadingGrades && grades.length > 0 && viewMode === 'table' && (
            <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Grade Code</th>
                      <th className="py-3 px-4">Display Name</th>
                      <th className="py-3 px-4">Level & Section</th>
                      <th className="py-3 px-4">Capacity</th>
                      <th className="py-3 px-4">Class Teacher</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {grade.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {grade.name}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {grade.gradeNumber === 0 ? 'KG' : `Grade ${grade.gradeNumber}`}
                          {grade.section ? ` (Sec ${grade.section})` : ''}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {grade.capacity ? `${grade.capacity} seats` : 'Unlimited'}
                        </td>
                        <td className="py-3.5 px-4">
                          {grade.classTeacher ? (
                            <span className="font-medium text-foreground">
                              {grade.classTeacher.firstName} {grade.classTeacher.lastName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(grade.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canAssignTeacher && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignTeacher(grade)}
                                className="text-[11px] h-7 gap-1"
                              >
                                <UserCheck className="w-3 h-3" /> Teacher
                              </Button>
                            )}
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleEdit(grade)}
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDelete(grade)}
                                  className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                  title="Delete"
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
          {!isLoadingGrades && grades.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>Showing {grades.length} sections for this board</span>
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
      {selectedBoardId && (
        <GradeFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          gradeToEdit={gradeToEdit}
          boardId={selectedBoardId}
          boards={boards}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['grades', selectedBoardId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      )}

      {targetSchoolId && (
        <AssignClassTeacherModal
          open={Boolean(gradeForTeacher)}
          onOpenChange={(open) => !open && setGradeForTeacher(null)}
          grade={gradeForTeacher}
          schoolId={targetSchoolId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['grades', selectedBoardId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      )}

      <DeleteGradeDialog
        open={Boolean(gradeToDelete)}
        onOpenChange={(open) => !open && setGradeToDelete(null)}
        grade={gradeToDelete}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['grades', selectedBoardId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
}
