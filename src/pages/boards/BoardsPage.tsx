import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Layers,
  ChevronLeft,
  ChevronRight,
  School as SchoolIcon,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import { boardsApi, type Board, type ListBoardsParams } from '../../api/boards.api.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { BoardFormModal } from './components/BoardFormModal.tsx';
import { DeleteBoardDialog } from './components/DeleteBoardDialog.tsx';
import { cn } from '../../lib/utils.ts';
import type { BoardStatus } from '../../schemas/boards.schema.ts';

export function BoardsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, getEffectiveRole, activeSchoolId } = useAuthStore();
  const effectiveRole = getEffectiveRole();

  const canManage = effectiveRole === 'super_admin' || effectiveRole === 'admin';

  // Target school is activeSchoolId for super_admin, or user.schoolId for tenant users
  const targetSchoolId =
    effectiveRole === 'super_admin'
      ? activeSchoolId
      : user?.schoolId || activeSchoolId;

  // View state: grid vs table
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search and filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BoardStatus | ''>('');
  const [sortBy, setSortBy] = useState<ListBoardsParams['sortBy']>('createdAt');
  const [sortOrder, setSortOrder] = useState<ListBoardsParams['sortOrder']>('desc');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Dialogs
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const queryParams: ListBoardsParams = {
    limit: 12,
    cursor,
    status: statusFilter || undefined,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['boards', targetSchoolId, queryParams],
    queryFn: () => {
      if (!targetSchoolId) {
        return Promise.resolve({
          data: [],
          pageInfo: { hasMore: false, nextCursor: null },
        });
      }
      return boardsApi.list(targetSchoolId, queryParams);
    },
    enabled: Boolean(targetSchoolId),
  });

  const boards = data?.data || [];
  const nextCursor = data?.pageInfo?.nextCursor || data?.meta?.nextCursor || null;
  const hasMore = Boolean(data?.pageInfo?.hasMore || data?.meta?.hasMore || nextCursor);

  // Status metrics
  const activeCount = boards.filter((b) => b.status === 'active').length;
  const inactiveCount = boards.filter((b) => b.status === 'inactive').length;
  const archivedCount = boards.filter((b) => b.status === 'archived').length;

  const handleCreateNew = () => {
    setBoardToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (board: Board) => {
    setBoardToEdit(board);
    setFormModalOpen(true);
  };

  const handleDelete = (board: Board) => {
    setBoardToDelete(board);
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
    setSortBy('createdAt');
    setSortOrder('desc');
    setCursor(undefined);
    setCursorHistory([]);
  };

  const getStatusBadge = (status: BoardStatus) => {
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
            <Sparkles className="w-3.5 h-3.5" /> Academic Architecture
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-primary" />
            Curriculum Boards
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Educational boards, syllabi standards, and regional affiliations mapped to this institution.
          </p>
        </div>

        {canManage && targetSchoolId && (
          <div className="flex items-center gap-2.5">
            <Button onClick={handleCreateNew} className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Register Board
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
                Curriculum boards are scoped to individual schools. Please select an active school from the top navigation header switcher to view and manage its curriculum boards.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Target School Details & Counters */}
      {targetSchoolId && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Boards
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{boards.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <BookOpen className="w-5 h-5" />
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
                <Layers className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Inactive / Archived
                </p>
                <p className="text-2xl font-bold text-muted-foreground mt-0.5">
                  {inactiveCount + archivedCount}
                </p>
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
                  placeholder="Search board by name or code (e.g. CBSE)..."
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
                      setStatusFilter(e.target.value as BoardStatus | '');
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
                    setSortBy(field as ListBoardsParams['sortBy']);
                    setSortOrder(order as ListBoardsParams['sortOrder']);
                    setCursor(undefined);
                    setCursorHistory([]);
                  }}
                  className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="code-asc">Code (A-Z)</option>
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

      {/* Main Boards Listing */}
      {targetSchoolId && (
        <>
          {isLoading && (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading curriculum boards...</p>
            </div>
          )}

          {!isLoading && boards.length === 0 && (
            <Card className="border-dashed border-border/80 bg-card/40 py-16 text-center">
              <CardContent className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-base">No Curriculum Boards Found</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {search || statusFilter
                    ? 'No curriculum boards match your current search criteria. Try adjusting your filters.'
                    : 'Start defining your school curriculum structure by registering educational boards like CBSE, ICSE, Cambridge, or State Board.'}
                </p>
                {canManage && !search && !statusFilter && (
                  <Button onClick={handleCreateNew} size="sm" className="mt-2 gap-2">
                    <Plus className="w-4 h-4" /> Register First Board
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {!isLoading && boards.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => (
                <Card
                  key={board.id}
                  className="group border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card/60 backdrop-blur-sm flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-primary/10 text-primary border border-primary/20">
                            {board.code}
                          </span>
                          {getStatusBadge(board.status)}
                        </div>
                        <h3 className="font-bold text-foreground text-base tracking-tight truncate group-hover:text-primary transition-colors">
                          {board.name}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-3 min-h-[3rem] leading-relaxed">
                      {board.description || 'No curriculum description provided for this board.'}
                    </p>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => navigate(`/grades?boardId=${board.id}`)}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Manage Grades</span>
                      </button>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(board)}
                            title="Edit Board"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(board)}
                            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title="Delete Board"
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
          {!isLoading && boards.length > 0 && viewMode === 'table' && (
            <Card className="border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Board Code</th>
                      <th className="py-3 px-4">Board Name</th>
                      <th className="py-3 px-4">Curriculum Description</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {boards.map((board) => (
                      <tr key={board.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {board.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {board.name}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                          {board.description || '—'}
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(board.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/grades?boardId=${board.id}`)}
                              className="text-[11px] h-7 gap-1"
                            >
                              <Layers className="w-3 h-3" /> Grades
                            </Button>
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleEdit(board)}
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDelete(board)}
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
          {!isLoading && boards.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>Showing {boards.length} curriculum boards</span>
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
        <BoardFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          boardToEdit={boardToEdit}
          schoolId={targetSchoolId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['boards', targetSchoolId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      )}

      <DeleteBoardDialog
        open={Boolean(boardToDelete)}
        onOpenChange={(open) => !open && setBoardToDelete(null)}
        board={boardToDelete}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['boards', targetSchoolId] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
}
