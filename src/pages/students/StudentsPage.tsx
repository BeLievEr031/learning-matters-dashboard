import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import {
  Users,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  School as SchoolIcon,
  LayoutGrid,
  Table as TableIcon,
  GraduationCap,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Phone,
  Layers,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import {
  studentsApi,
  type Student,
  type StudentStatus,
  type StudentGender,
  type ListStudentsParams,
} from '../../api/students.api.ts';
import { boardsApi, type Board } from '../../api/boards.api.ts';
import { gradesApi, type Grade } from '../../api/grades.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { StudentFormModal } from './components/StudentFormModal.tsx';
import { StudentDetailsModal } from './components/StudentDetailsModal.tsx';
import { TransferGradeModal } from './components/TransferGradeModal.tsx';
import { DeleteStudentDialog } from './components/DeleteStudentDialog.tsx';
import { cn } from '../../lib/utils.ts';

export function StudentsPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { user, getEffectiveRole, activeSchoolId } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const canManage =
    effectiveRole === 'super_admin' ||
    effectiveRole === 'admin' ||
    effectiveRole === 'principal';

  const effectiveSchoolId =
    effectiveRole === 'super_admin' ? (activeSchoolId || '') : (user?.schoolId || '');

  // URL parameters or initial selection
  const paramGradeId = searchParams.get('gradeId') || '';

  // Board & Grade Selection State
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>(paramGradeId);

  // Filters & View Mode
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StudentStatus>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | StudentGender>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination Cursor History
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Modal Dialogs
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToView, setStudentToView] = useState<Student | null>(null);
  const [studentToTransfer, setStudentToTransfer] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // 1. Fetch Boards for current school
  const { data: boardsData, isLoading: isLoadingBoards } = useQuery({
    queryKey: ['boards', effectiveSchoolId],
    queryFn: () => boardsApi.list(effectiveSchoolId, { limit: 100, status: 'active' }),
    enabled: Boolean(effectiveSchoolId),
    staleTime: 5 * 60 * 1000,
  });

  const boards = useMemo(() => boardsData?.data || [], [boardsData?.data]);
  const activeBoardId = selectedBoardId || boards[0]?.id || '';

  // 2. Fetch Grades for active board
  const { data: gradesData, isLoading: isLoadingGrades } = useQuery({
    queryKey: ['grades', activeBoardId],
    queryFn: () => gradesApi.list(activeBoardId, { limit: 100, status: 'active' }),
    enabled: Boolean(activeBoardId),
    staleTime: 5 * 60 * 1000,
  });

  const grades = useMemo(() => gradesData?.data || [], [gradesData?.data]);
  const activeGradeId = selectedGradeId || paramGradeId || grades[0]?.id || '';

  const activeGrade = useMemo(
    () => grades.find((g) => g.id === activeGradeId),
    [grades, activeGradeId],
  );

  // 3. Query Students for active grade
  const queryParams: ListStudentsParams = useMemo(() => {
    const params: ListStudentsParams = {
      limit: 20,
      cursor,
    };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'all') params.status = statusFilter;
    if (genderFilter !== 'all') params.gender = genderFilter;
    return params;
  }, [search, statusFilter, genderFilter, cursor]);

  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['students', activeGradeId, queryParams],
    queryFn: () => studentsApi.listByGrade(activeGradeId, queryParams),
    enabled: Boolean(activeGradeId),
  });

  const students = useMemo(() => studentsData?.data || [], [studentsData?.data]);
  const meta = studentsData?.meta;

  // Workload / Enrollment Metric Counters
  const metrics = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === 'active').length;
    const transferred = students.filter(
      (s) => s.status === 'transferred' || s.status === 'graduated',
    ).length;
    const suspended = students.filter(
      (s) => s.status === 'suspended' || s.status === 'inactive',
    ).length;
    return { total, active, transferred, suspended };
  }, [students]);

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
    setGenderFilter('all');
    setCursor(undefined);
    setCursorHistory([]);
  };

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
      case 'transferred':
        return {
          label: 'Transferred',
          classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          dot: 'bg-blue-500',
        };
      case 'graduated':
        return {
          label: 'Graduated',
          classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          dot: 'bg-purple-500',
        };
      case 'suspended':
        return {
          label: 'Suspended',
          classes: 'bg-destructive/10 text-destructive border-destructive/20',
          dot: 'bg-destructive',
        };
      case 'inactive':
      default:
        return {
          label: 'Inactive',
          classes: 'bg-muted text-muted-foreground border-border',
          dot: 'bg-muted-foreground',
        };
    }
  };

  // Super Admin missing active school guard
  if (effectiveRole === 'super_admin' && !activeSchoolId) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
          <SchoolIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Select a School to Manage Student Admissions</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Student enrollment records belong to specific school campuses. Please choose a school from the tenant selector in the top navigation bar.
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
            <h1 className="text-2xl font-bold tracking-tight">Student Admissions & Enrollment</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Grade Roster
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admitted students, profile records, and grade transfer operations.
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
              disabled={!activeGradeId}
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Admission
            </Button>
          )}
        </div>
      </div>

      {/* Board & Grade Cascading Selector Bar */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>Academic Curriculum Scope</span>
          </div>

          {/* Board Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Board:</span>
            <select
              aria-label="Filter by Board"
              value={activeBoardId}
              onChange={(e) => {
                setSelectedBoardId(e.target.value);
                setSelectedGradeId('');
                setCursor(undefined);
              }}
              className="h-8 px-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoadingBoards || boards.length === 0}
            >
              {boards.map((b: Board) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grade Pills Roster */}
        {isLoadingGrades ? (
          <div className="flex gap-2 overflow-x-auto py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-28 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : grades.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-1">
            No grades configured for this academic board. Add grades in the Grades & Sections screen.
          </p>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {grades.map((grade: Grade) => {
              const isActive = grade.id === activeGradeId;
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => {
                    setSelectedGradeId(grade.id);
                    setCursor(undefined);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border flex items-center gap-1.5',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground',
                  )}
                >
                  <span>{grade.name}</span>
                  {grade.section && (
                    <span
                      className={cn(
                        'text-[10px] px-1 rounded font-mono',
                        isActive ? 'bg-primary-foreground/20' : 'bg-background/80',
                      )}
                    >
                      {grade.section}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Metric Summary Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Enrolled
              </p>
              <p className="text-2xl font-bold mt-1">{meta?.total ?? metrics.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Active Students
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
                Transferred / Alumni
              </p>
              <p className="text-2xl font-bold mt-1 text-blue-500">{metrics.transferred}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Inactive / Suspended
              </p>
              <p className="text-2xl font-bold mt-1 text-muted-foreground">{metrics.suspended}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student name or admission number..."
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

          {/* Gender Filter */}
          <div className="w-full sm:w-36">
            <select
              aria-label="Filter by Gender"
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value as 'all' | StudentGender);
                setCursor(undefined);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <select
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | StudentStatus);
                setCursor(undefined);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Enrolled)</option>
              <option value="transferred">Transferred</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* View Mode Switcher */}
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

      {/* Main Student Directory Content Area */}
      {!activeGradeId ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/40 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold">No Academic Grade Selected</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Please select an academic grade above to view its student enrollment roster and admit candidates.
          </p>
        </div>
      ) : isLoadingStudents ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted" />
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
          <p className="text-sm font-medium text-destructive">Failed to load enrolled students</p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred during query'}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-semibold">No Students Enrolled in this Grade</h3>
            <p className="text-xs text-muted-foreground">
              {search || statusFilter !== 'all' || genderFilter !== 'all'
                ? 'No students match your active search terms and filters.'
                : `Currently no students are enrolled in ${activeGrade?.name || 'this grade'}.`}
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {search || statusFilter !== 'all' || genderFilter !== 'all' ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Reset Filters
              </Button>
            ) : canManage ? (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Admit First Student
              </Button>
            ) : null}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const statusInfo = getStatusBadge(student.status);
            const fullName = `${student.firstName} ${student.lastName}`;

            return (
              <Card
                key={student.id}
                className={cn(
                  'border-border/60 hover:border-primary/40 transition-all hover:shadow-sm flex flex-col justify-between group',
                  student.status !== 'active' && 'opacity-75 bg-muted/10',
                )}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top: Avatar, Name, Admission No, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                        {student.firstName.charAt(0).toUpperCase()}
                        {student.lastName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {fullName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono truncate">
                          <span>{student.admissionNumber}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 border',
                        statusInfo.classes,
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', statusInfo.dot)} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Details Pill Box */}
                  <div className="rounded-lg bg-muted/30 border border-border/50 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Grade / Section</span>
                      <span className="font-medium text-foreground">
                        {activeGrade?.name || 'Assigned Grade'}
                        {activeGrade?.section ? ` (${activeGrade.section})` : ''}
                      </span>
                    </div>

                    {student.guardianName && (
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-muted-foreground">Guardian</span>
                        <span className="font-medium text-foreground truncate max-w-[160px]">
                          {student.guardianName}
                        </span>
                      </div>
                    )}

                    {student.guardianPhone && (
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-muted-foreground">Guardian Contact</span>
                        <a
                          href={`tel:${student.guardianPhone}`}
                          className="font-mono text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {student.guardianPhone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Footer Timestamps & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(student.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="View student profile"
                        onClick={() => setStudentToView(student)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {canManage && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-500"
                            title="Transfer grade"
                            onClick={() => setStudentToTransfer(student)}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                            title="Edit student profile"
                            onClick={() => setStudentToEdit(student)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            title="Remove student record"
                            onClick={() => setStudentToDelete(student)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
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
                  <th className="px-4 py-3.5">Admission No</th>
                  <th className="px-4 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Gender</th>
                  <th className="px-4 py-3.5">Guardian Contact</th>
                  <th className="px-4 py-3.5">Admitted On</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => {
                  const statusInfo = getStatusBadge(student.status);
                  const fullName = `${student.firstName} ${student.lastName}`;

                  return (
                    <tr
                      key={student.id}
                      className={cn(
                        'hover:bg-muted/30 transition-colors',
                        student.status !== 'active' && 'opacity-70',
                      )}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-primary">
                        {student.admissionNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                            {student.firstName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{fullName}</div>
                            {student.email && (
                              <div className="text-xs text-muted-foreground">{student.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground capitalize">
                        {student.gender || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="font-medium text-foreground">
                          {student.guardianName || '—'}
                        </div>
                        {student.guardianPhone && (
                          <div className="text-muted-foreground font-mono">
                            {student.guardianPhone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {new Date(student.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 border',
                            statusInfo.classes,
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', statusInfo.dot)} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="View student profile"
                            onClick={() => setStudentToView(student)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canManage && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-indigo-500"
                                title="Transfer grade"
                                onClick={() => setStudentToTransfer(student)}
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                title="Edit profile"
                                onClick={() => setStudentToEdit(student)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Remove student"
                                onClick={() => setStudentToDelete(student)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
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
            Showing <span className="font-medium text-foreground">{students.length}</span> students
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

      {/* Student Admission / Edit Modal */}
      {canManage && activeGradeId && (
        <StudentFormModal
          open={isCreateModalOpen || Boolean(studentToEdit)}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateModalOpen(false);
              setStudentToEdit(null);
            }
          }}
          gradeId={activeGradeId}
          studentToEdit={studentToEdit}
          onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['students'] })}
        />
      )}

      {/* Student Profile Details Drawer Modal */}
      {studentToView && (
        <StudentDetailsModal
          open={Boolean(studentToView)}
          onOpenChange={(open) => !open && setStudentToView(null)}
          student={studentToView}
          gradeName={activeGrade?.name}
          onEdit={(s) => {
            setStudentToView(null);
            setStudentToEdit(s);
          }}
          onTransfer={(s) => {
            setStudentToView(null);
            setStudentToTransfer(s);
          }}
        />
      )}

      {/* Transfer Grade Modal */}
      {canManage && studentToTransfer && (
        <TransferGradeModal
          open={Boolean(studentToTransfer)}
          onOpenChange={(open) => !open && setStudentToTransfer(null)}
          student={studentToTransfer}
          currentGradeName={activeGrade?.name}
          availableGrades={grades}
          onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['students'] })}
        />
      )}

      {/* Delete / De-enrollment Confirmation Dialog */}
      {canManage && studentToDelete && (
        <DeleteStudentDialog
          open={Boolean(studentToDelete)}
          onOpenChange={(open) => !open && setStudentToDelete(null)}
          student={studentToDelete}
          onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['students'] })}
        />
      )}
    </div>
  );
}
