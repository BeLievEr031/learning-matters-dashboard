import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import {
  GraduationCap,
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
  BookOpen,
  Layers,
  Unlink,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import {
  subjectsApi,
  type GradeSubjectItem,
  type Subject,
  type ListSubjectsParams,
} from '../../api/subjects.api.ts';
import { boardsApi, type Board } from '../../api/boards.api.ts';
import { gradesApi, type Grade } from '../../api/grades.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { SubjectFormModal } from './components/SubjectFormModal.tsx';
import { RemoveGradeSubjectDialog } from './components/RemoveGradeSubjectDialog.tsx';
import { DeleteSubjectDialog } from './components/DeleteSubjectDialog.tsx';
import { SubjectChaptersDrawer } from './components/SubjectChaptersDrawer.tsx';
import { cn } from '../../lib/utils.ts';
import type { SubjectStatus } from '../../schemas/subjects.schema.ts';

export function SubjectsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, getEffectiveRole, activeSchoolId } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const canManage = effectiveRole === 'super_admin' || effectiveRole === 'admin';

  // Target school is activeSchoolId for super_admin, or user.schoolId for tenant users
  const targetSchoolId =
    effectiveRole === 'super_admin'
      ? activeSchoolId
      : user?.schoolId || activeSchoolId;

  // URL parameters & manual selection
  const urlBoardId = searchParams.get('boardId') || '';
  const urlGradeId = searchParams.get('gradeId') || '';
  const [manualBoardId, setManualBoardId] = useState<string>('');
  const [manualGradeId, setManualGradeId] = useState<string>('');

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search and filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubjectStatus | ''>('');
  const [sortBy, setSortBy] = useState<ListSubjectsParams['sortBy']>('name');
  const [sortOrder, setSortOrder] = useState<ListSubjectsParams['sortOrder']>('asc');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Dialogs
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [subjectToRemove, setSubjectToRemove] = useState<GradeSubjectItem | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [subjectForChapters, setSubjectForChapters] = useState<Subject | null>(null);

  // 1. Fetch school boards
  const { data: boardsData, isLoading: isLoadingBoards } = useQuery({
    queryKey: ['boards', targetSchoolId],
    queryFn: () => {
      if (!targetSchoolId) return Promise.resolve({ data: [] });
      return boardsApi.list(targetSchoolId, { limit: 100, status: 'active' });
    },
    enabled: Boolean(targetSchoolId),
  });

  const boards: Board[] = useMemo(() => boardsData?.data || [], [boardsData]);

  // Derived active board ID
  const activeBoardId = useMemo(() => {
    if (manualBoardId && boards.some((b) => b.id === manualBoardId)) {
      return manualBoardId;
    }
    if (urlBoardId && boards.some((b) => b.id === urlBoardId)) {
      return urlBoardId;
    }
    return boards[0]?.id || '';
  }, [manualBoardId, urlBoardId, boards]);

  // 2. Fetch grades for active board
  const { data: gradesData, isLoading: isLoadingGrades } = useQuery({
    queryKey: ['grades', activeBoardId],
    queryFn: () => {
      if (!activeBoardId) return Promise.resolve({ data: [] });
      return gradesApi.list(activeBoardId, { limit: 100, status: 'active' });
    },
    enabled: Boolean(activeBoardId),
  });

  const grades: Grade[] = useMemo(() => gradesData?.data || [], [gradesData]);

  // Derived active grade ID
  const activeGradeId = useMemo(() => {
    if (manualGradeId && grades.some((g) => g.id === manualGradeId)) {
      return manualGradeId;
    }
    if (urlGradeId && grades.some((g) => g.id === urlGradeId)) {
      return urlGradeId;
    }
    return grades[0]?.id || '';
  }, [manualGradeId, urlGradeId, grades]);

  const activeGrade = grades.find((g) => g.id === activeGradeId);

  const handleSelectBoard = (newBoardId: string) => {
    setManualBoardId(newBoardId);
    setManualGradeId('');
    setSearchParams({ boardId: newBoardId });
    setCursor(undefined);
    setCursorHistory([]);
  };

  const handleSelectGrade = (newGradeId: string) => {
    setManualGradeId(newGradeId);
    setSearchParams({ boardId: activeBoardId, gradeId: newGradeId });
    setCursor(undefined);
    setCursorHistory([]);
  };

  // 3. Fetch subjects for active grade
  const queryParams: ListSubjectsParams = {
    limit: 15,
    cursor,
    status: statusFilter || undefined,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  };

  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['subjects', activeGradeId, queryParams],
    queryFn: () => {
      if (!activeGradeId) {
        return Promise.resolve({
          data: [],
          pageInfo: { hasMore: false, nextCursor: null },
        });
      }
      return subjectsApi.listByGrade(activeGradeId, queryParams);
    },
    enabled: Boolean(activeGradeId),
  });

  const subjects = subjectsData?.data || [];
  const nextCursor = subjectsData?.pageInfo?.nextCursor || subjectsData?.meta?.nextCursor || null;
  const hasMore = Boolean(subjectsData?.pageInfo?.hasMore || subjectsData?.meta?.hasMore || nextCursor);

  // Metrics
  const activeCount = subjects.filter((s) => s.status === 'active').length;
  const inactiveCount = subjects.filter((s) => s.status === 'inactive' || s.status === 'archived').length;

  const handleCreateNew = () => {
    setSubjectToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setSubjectToEdit(subject);
    setFormModalOpen(true);
  };

  const handleRemoveGradeSubject = (subject: GradeSubjectItem) => {
    setSubjectToRemove(subject);
  };

  const handleDelete = (subject: Subject) => {
    setSubjectToDelete(subject);
  };

  const handleOpenChapters = (subject: Subject) => {
    setSubjectForChapters(subject);
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
    setSortBy('name');
    setSortOrder('asc');
    setCursor(undefined);
    setCursorHistory([]);
  };

  const getStatusBadge = (status: SubjectStatus) => {
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Academic Curriculum
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-primary" />
            Subjects Catalogue
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Curriculum courses, syllabi mappings, and academic course loads assigned per grade level.
          </p>
        </div>

        {canManage && activeGradeId && (
          <div className="flex items-center gap-2.5">
            <Button onClick={handleCreateNew} className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add Subject
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
                Curriculum courses and subjects are scoped to individual schools and grades. Please select an active school from the top navigation switcher.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hierarchy Selectors (Board & Grade) */}
      {targetSchoolId && (
        <div className="space-y-4">
          {/* 1. Board Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" /> Curriculum Board:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {boards.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBoard(b.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-2',
                    activeBoardId === b.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/60',
                  )}
                >
                  <span className="font-mono font-bold">{b.code}</span>
                  <span className="hidden sm:inline font-normal opacity-90">{b.name}</span>
                </button>
              ))}
              {isLoadingBoards && (
                <span className="text-xs text-muted-foreground">Loading boards...</span>
              )}
            </div>
          </div>

          {/* 2. Grade Section Selector */}
          {activeBoardId && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Grade Level & Section:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {grades.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectGrade(g.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5',
                      activeGradeId === g.id
                        ? 'bg-primary/10 text-primary border-primary font-bold shadow-xs'
                        : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/60',
                    )}
                  >
                    <span>{g.name}</span>
                    <span className="font-mono text-[10px] opacity-75">({g.code})</span>
                  </button>
                ))}

                {grades.length === 0 && !isLoadingGrades && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>No grade sections found for this board.</span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate(`/grades?boardId=${activeBoardId}`)}
                      className="p-0 h-auto text-xs text-primary"
                    >
                      + Create Grade Section First
                    </Button>
                  </div>
                )}

                {isLoadingGrades && (
                  <span className="text-xs text-muted-foreground">Loading sections...</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Target Grade Banner & Stats */}
      {activeGrade && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Subjects Mapped
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{subjects.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <GraduationCap className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Active Curriculum
                </p>
                <p className="text-2xl font-bold text-emerald-500 mt-0.5">{activeCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Inactive / Archived
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
      {activeGrade && (
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
                  placeholder="Search subject by name or code (e.g. MATH)..."
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
                      setStatusFilter(e.target.value as SubjectStatus | '');
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
                    setSortBy(field as ListSubjectsParams['sortBy']);
                    setSortOrder(order as ListSubjectsParams['sortOrder']);
                    setCursor(undefined);
                    setCursorHistory([]);
                  }}
                  className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="code-asc">Code (A-Z)</option>
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

      {/* Main Subjects Listing */}
      {activeGrade && (
        <>
          {isLoadingSubjects && (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading curriculum subjects...</p>
            </div>
          )}

          {!isLoadingSubjects && subjects.length === 0 && (
            <Card className="border-dashed border-border/80 bg-card/40 py-16 text-center">
              <CardContent className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-base">No Subjects Assigned</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {search || statusFilter
                    ? 'No subjects match your current filter parameters.'
                    : `Assign or create academic subjects for ${activeGrade.name} to begin planning courses and teacher allocations.`}
                </p>
                {canManage && !search && !statusFilter && (
                  <Button onClick={handleCreateNew} size="sm" className="mt-2 gap-2">
                    <Plus className="w-4 h-4" /> Add First Subject
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {!isLoadingSubjects && subjects.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="group border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card/60 backdrop-blur-sm flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-primary/10 text-primary border border-primary/20">
                            {subject.code}
                          </span>
                          {getStatusBadge(subject.status)}
                        </div>
                        <h3 className="font-bold text-foreground text-base tracking-tight truncate group-hover:text-primary transition-colors">
                          {subject.name}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-3 min-h-[3rem] leading-relaxed">
                      {subject.description || 'No curriculum syllabus details specified.'}
                    </p>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenChapters(subject)}
                          className="text-xs h-7.5 px-2.5 gap-1.5 font-semibold text-primary hover:text-primary hover:bg-primary/10 border-primary/20"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          <span>Chapters</span>
                        </Button>
                        <button
                          type="button"
                          onClick={() => navigate(`/assignments?subjectId=${subject.id}`)}
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium pl-1 text-[11px]"
                          title="Assign Teachers"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Faculty</span>
                        </button>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(subject)}
                            title="Edit Subject Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveGradeSubject(subject)}
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                            title="Unlink from Section"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(subject)}
                            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title="Delete Master Subject"
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
          {!isLoadingSubjects && subjects.length > 0 && viewMode === 'table' && (
            <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Subject Code</th>
                      <th className="py-3 px-4">Subject Name</th>
                      <th className="py-3 px-4">Curriculum Description</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {subject.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {subject.name}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                          {subject.description || '—'}
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(subject.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenChapters(subject)}
                              className="text-[11px] h-7 gap-1 text-primary border-primary/20 hover:bg-primary/10 font-semibold"
                            >
                              <BookOpen className="w-3 h-3" /> Chapters
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/assignments?subjectId=${subject.id}`)}
                              className="text-[11px] h-7 gap-1"
                            >
                              <UserCheck className="w-3 h-3" /> Faculty
                            </Button>
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleEdit(subject)}
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleRemoveGradeSubject(subject)}
                                  className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                                  title="Unlink from Section"
                                >
                                  <Unlink className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDelete(subject)}
                                  className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                  title="Delete Master Subject"
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
          {!isLoadingSubjects && subjects.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>Showing {subjects.length} curriculum subjects</span>
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
      <SubjectFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        subjectToEdit={subjectToEdit}
        gradeId={activeGradeId}
        gradeName={activeGrade?.name}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['subjects', activeGradeId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />

      {activeGradeId && (
        <RemoveGradeSubjectDialog
          open={Boolean(subjectToRemove)}
          onOpenChange={(open) => !open && setSubjectToRemove(null)}
          subject={subjectToRemove}
          gradeId={activeGradeId}
          gradeName={activeGrade?.name}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['subjects', activeGradeId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      )}

      <DeleteSubjectDialog
        open={Boolean(subjectToDelete)}
        onOpenChange={(open) => !open && setSubjectToDelete(null)}
        subject={subjectToDelete}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['subjects', activeGradeId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />

      <SubjectChaptersDrawer
        open={Boolean(subjectForChapters)}
        onOpenChange={(open) => !open && setSubjectForChapters(null)}
        subject={subjectForChapters}
      />
    </div>
  );
}
