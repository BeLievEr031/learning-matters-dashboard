import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  X,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Sparkles,
  Layers,
  BookOpen,
  Eye,
  Phone,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent, CardHeader } from '../../components/ui/card.tsx';
import {
  useTeacherGradeStudents,
  useTeacherGrades,
} from '../../hooks/use-teacher-workspace.ts';
import { StudentDetailsModal } from './components/StudentDetailsModal.tsx';
import type { Student, StudentStatus, StudentGender, ListStudentsParams } from '../../api/students.api.ts';

export function GradeStudentsPage() {
  const navigate = useNavigate();
  const { gradeId } = useParams<{ gradeId: string }>();

  // Resolve Grade metadata
  const { data: allGrades = [] } = useTeacherGrades();
  const grade = useMemo(() => allGrades.find((g) => g.id === gradeId), [allGrades, gradeId]);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('');
  const [genderFilter, setGenderFilter] = useState<StudentGender | ''>('');
  const [sortBy, setSortBy] = useState<ListStudentsParams['sortBy']>('firstName');
  const [sortOrder, setSortOrder] = useState<ListStudentsParams['sortOrder']>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Keyset cursor pagination state
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Modal inspection state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Query parameters object
  const queryParams: ListStudentsParams = useMemo(
    () => ({
      limit: 15,
      cursor,
      search: search.trim() || undefined,
      status: statusFilter || undefined,
      gender: genderFilter || undefined,
      sortBy,
      sortOrder,
    }),
    [cursor, search, statusFilter, genderFilter, sortBy, sortOrder],
  );

  const {
    data: studentsResult,
    isLoading,
    isError,
    error,
    refetch,
  } = useTeacherGradeStudents(gradeId, queryParams);

  const students = studentsResult?.data ?? [];
  const pageInfo = studentsResult?.pageInfo || studentsResult?.meta;

  // Pagination navigation handlers
  const handleNextPage = () => {
    if (pageInfo?.nextCursor) {
      setCursorHistory((prev) => [...prev, cursor ?? '']);
      setCursor(pageInfo.nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prevCursor = cursorHistory[cursorHistory.length - 1];
      setCursorHistory((prev) => prev.slice(0, -1));
      setCursor(prevCursor || undefined);
    }
  };

  const handleOpenStudentModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const errorMessage =
    (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
      ?.message ||
    (error as Error)?.message ||
    'Failed to load class students from server.';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Navigation Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/teacher/classes')}
            className="gap-1.5 text-xs h-9"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Classes
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/teacher/classes/${gradeId}/subjects`)}
            className="gap-1.5 text-xs h-9 text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="w-4 h-4" />
            View Curriculum
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Roster
        </Button>
      </div>

      {/* Grade Header Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-primary/10 via-indigo-500/10 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              Class Roster
            </span>
            {grade && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                <Layers className="w-3.5 h-3.5" />
                {grade.name} · {grade.boardName} Board
              </span>
            )}
            {grade?.isClassTeacher && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                Class Lead
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {grade ? `${grade.name} · Students Roster` : 'Class Students Roster'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enrolled student profiles, contact details, attendance statuses, and emergency information.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-2xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            {students.length} Student{students.length === 1 ? '' : 's'} on Page
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              placeholder="Search by student name or admission number..."
              className="pl-9 pr-8 bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCursor(undefined);
                  setCursorHistory([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & View Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StudentStatus | '');
                setCursor(undefined);
                setCursorHistory([]);
              }}
              className="h-9 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="transferred">Transferred</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value as StudentGender | '');
                setCursor(undefined);
                setCursorHistory([]);
              }}
              className="h-9 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground outline-none"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            {/* Sort Order */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [
                  ListStudentsParams['sortBy'],
                  ListStudentsParams['sortOrder'],
                ];
                setSortBy(sb);
                setSortOrder(so);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              className="h-9 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground outline-none"
            >
              <option value="firstName-asc">Name (A-Z)</option>
              <option value="firstName-desc">Name (Z-A)</option>
              <option value="admissionNumber-asc">Admission # (Asc)</option>
              <option value="admissionNumber-desc">Admission # (Desc)</option>
              <option value="createdAt-desc">Recently Enrolled</option>
            </select>

            {/* Table / Grid Toggle */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 ml-auto">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-background text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-background text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/60 animate-pulse border border-border/40" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Card className="border-destructive/40 bg-destructive/5 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Failed to Load Class Roster</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State - No match for search or filters */}
      {!isLoading && !isError && students.length === 0 && (search || statusFilter || genderFilter) && (
        <Card className="p-8 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Students Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            No enrolled students match your active filters. Try adjusting your search term or clearing filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setGenderFilter('');
              setCursor(undefined);
              setCursorHistory([]);
            }}
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </Card>
      )}

      {/* Empty State - No students in class */}
      {!isLoading && !isError && students.length === 0 && !search && !statusFilter && !genderFilter && (
        <Card className="p-10 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Students Enrolled in this Section</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            There are currently no students registered or admitted under {grade?.name || 'this grade'}.
            Student admissions managed by school administration will appear here automatically.
          </p>
        </Card>
      )}

      {/* TABLE VIEW */}
      {!isLoading && !isError && students.length > 0 && viewMode === 'table' && (
        <div className="rounded-xl border border-border/70 overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Guardian</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => handleOpenStudentModal(student)}
                  >
                    {/* Student Avatar & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                          {student.firstName[0]}
                          {student.lastName ? student.lastName[0] : ''}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                            {student.firstName} {student.lastName}
                          </p>
                          {student.email && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              {student.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Admission Number */}
                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      {student.admissionNumber}
                    </td>

                    {/* Gender */}
                    <td className="py-3 px-4 capitalize text-muted-foreground">
                      {student.gender || '—'}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          student.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : student.status === 'transferred'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    {/* Contact Phone */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {student.phone ? (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {student.phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Guardian Name & Phone */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {student.guardianName || '—'}
                        </p>
                        {student.guardianPhone && (
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {student.guardianPhone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudentModal(student);
                        }}
                        className="h-8 text-xs gap-1 text-primary hover:text-primary"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {!isLoading && !isError && students.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Card
              key={student.id}
              onClick={() => handleOpenStudentModal(student)}
              className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
                        {student.firstName[0]}
                        {student.lastName ? student.lastName[0] : ''}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-xs font-mono text-muted-foreground">
                          Adm: {student.admissionNumber}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        student.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-3 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>
                      <span className="text-[11px] block">Gender:</span>
                      <span className="capitalize font-medium text-foreground">
                        {student.gender || 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] block">Guardian:</span>
                      <span className="font-medium text-foreground truncate block">
                        {student.guardianName || '—'}
                      </span>
                    </div>
                  </div>

                  {student.guardianPhone && (
                    <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono text-foreground font-medium">
                        {student.guardianPhone}
                      </span>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-3 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-primary font-medium bg-muted/10">
                <span>View Full Profile</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !isError && students.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {students.length} students {cursorHistory.length > 0 ? `· Page ${cursorHistory.length + 1}` : ''}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={cursorHistory.length === 0}
              className="text-xs gap-1 h-8"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pageInfo?.hasMore}
              className="text-xs gap-1 h-8"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Student Details Inspection Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        gradeName={grade?.name}
      />
    </div>
  );
}
