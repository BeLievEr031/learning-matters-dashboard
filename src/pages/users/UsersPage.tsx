import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  Shield,
  Crown,
  School,
  GraduationCap,
  BookOpen,
  Layers,
  Calendar,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import {
  usersApi,
  type UserAccount,
  type ListUsersParams,
} from '../../api/users.api.ts';
import type { UserRole } from '../../types/auth.types.ts';
import { UserFormModal } from './components/UserFormModal.tsx';
import { UserDetailsModal } from './components/UserDetailsModal.tsx';
import { DeleteUserDialog } from './components/DeleteUserDialog.tsx';
import { cn } from '../../lib/utils.ts';
import { toast } from 'sonner';

export function UsersPage() {
  const queryClient = useQueryClient();

  // Filters & State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination Cursor History
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);
  const [userToView, setUserToView] = useState<UserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Query Users
  const queryParams: ListUsersParams = useMemo(() => {
    return {
      limit: 50,
      cursor,
    };
  }, [cursor]);

  const {
    data: usersData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => usersApi.list(queryParams),
  });

  const rawUsers = useMemo(() => usersData?.data || [], [usersData?.data]);
  const meta = usersData?.meta;

  // Filter users in memory
  const users = useMemo(() => {
    return rawUsers.filter((u) => {
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesEmail = u.email.toLowerCase().includes(query);
        const matchesRole = u.role.toLowerCase().includes(query);
        const matchesId = u.id.toLowerCase().includes(query);
        if (!matchesEmail && !matchesRole && !matchesId) return false;
      }

      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }

      if (statusFilter === 'active' && !u.isActive) {
        return false;
      }
      if (statusFilter === 'inactive' && u.isActive) {
        return false;
      }

      return true;
    });
  }, [rawUsers, search, roleFilter, statusFilter]);

  // Metric Summaries
  const metrics = useMemo(() => {
    const total = rawUsers.length;
    const superAdmins = rawUsers.filter((u) => u.role === 'super_admin').length;
    const campusLeaders = rawUsers.filter(
      (u) => u.role === 'admin' || u.role === 'principal',
    ).length;
    const faculty = rawUsers.filter(
      (u) => u.role === 'class_teacher' || u.role === 'teacher',
    ).length;
    const active = rawUsers.filter((u) => u.isActive).length;
    return { total, superAdmins, campusLeaders, faculty, active };
  }, [rawUsers]);

  // Inline status toggle mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: boolean }) => {
      return usersApi.update(id, { isActive: newStatus });
    },
    onSuccess: (updated) => {
      toast.success(
        `Account for ${updated.email} is now ${updated.isActive ? 'Active' : 'Suspended'}`,
      );
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: unknown) => {
      const errMessage = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(errMessage);
    },
  });

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
    setRoleFilter('all');
    setStatusFilter('all');
    setCursor(undefined);
    setCursorHistory([]);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          classes: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          icon: Crown,
        };
      case 'admin':
        return {
          label: 'Campus Admin',
          classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          icon: School,
        };
      case 'principal':
        return {
          label: 'Principal',
          classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          icon: Shield,
        };
      case 'class_teacher':
        return {
          label: 'Class Teacher',
          classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          icon: GraduationCap,
        };
      case 'teacher':
        return {
          label: 'Teacher',
          classes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          icon: BookOpen,
        };
      case 'student':
      default:
        return {
          label: 'Student',
          classes: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          icon: Layers,
        };
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">User Accounts & RBAC Directory</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Identity Management
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Provision user credentials, manage role tier permissions, and oversee account access.
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

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Provision User
          </Button>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Accounts
              </p>
              <p className="text-2xl font-bold mt-1">{meta?.total ?? metrics.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Super Admins
              </p>
              <p className="text-2xl font-bold mt-1 text-purple-500">{metrics.superAdmins}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Crown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Campus Leaders
              </p>
              <p className="text-2xl font-bold mt-1 text-blue-500">{metrics.campusLeaders}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <School className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Faculty & Teachers
              </p>
              <p className="text-2xl font-bold mt-1 text-emerald-500">{metrics.faculty}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Role Filters, and View Switcher */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email address, role, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

            {/* Status Filter */}
            <div className="flex rounded-md border border-input bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-sm transition-colors',
                  statusFilter === 'all'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-sm transition-colors',
                  statusFilter === 'active'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-sm transition-colors',
                  statusFilter === 'inactive'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Suspended
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-input rounded-md p-1 bg-muted/30 self-end md:self-auto">
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
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-2.5 gap-1.5 text-xs"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </Button>
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-muted-foreground font-medium shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Roles:
          </span>
          {(
            [
              { id: 'all', label: 'All Roles' },
              { id: 'super_admin', label: 'Super Admin' },
              { id: 'admin', label: 'Campus Admin' },
              { id: 'principal', label: 'Principal' },
              { id: 'class_teacher', label: 'Class Teacher' },
              { id: 'teacher', label: 'Teacher' },
              { id: 'student', label: 'Student' },
            ] as const
          ).map((tab) => {
            const isSelected = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id as 'all' | UserRole)}
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
                <div className="h-4 bg-muted rounded w-4/5 pt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-destructive">Failed to load user accounts</p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred during query'}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-semibold">No User Accounts Found</h3>
            <p className="text-xs text-muted-foreground">
              {search || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'No user accounts match your search filters. Try revising criteria.'
                : 'No users have been registered in the authentication system yet.'}
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            {search || roleFilter !== 'all' || statusFilter !== 'all' ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Reset Filters
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Provision First User
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const roleInfo = getRoleBadge(user.role);
            const RoleIcon = roleInfo.icon;

            return (
              <Card
                key={user.id}
                className={cn(
                  'border-border/60 hover:border-primary/40 transition-all hover:shadow-xs flex flex-col justify-between group',
                  !user.isActive && 'opacity-70 bg-muted/10',
                )}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top: Avatar, Email, Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {user.email}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono truncate">
                          <span>ID: {user.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 border',
                        roleInfo.classes,
                      )}
                    >
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                  </div>

                  {/* Status & Scope Pill */}
                  <div className="rounded-lg bg-muted/30 border border-border/50 p-2.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Account Access:</span>
                    <span
                      className={cn(
                        'font-medium inline-flex items-center gap-1',
                        user.isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-destructive',
                      )}
                    >
                      {user.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-destructive" />
                          Suspended
                        </>
                      )}
                    </span>
                  </div>

                  {/* Footer Timestamps & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
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
                        title="View account details"
                        onClick={() => setUserToView(user)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                        title="Edit credentials"
                        onClick={() => setUserToEdit(user)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        title="Delete account"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Account User</th>
                  <th className="px-4 py-3.5">Role Tier</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Registered On</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const roleInfo = getRoleBadge(user.role);
                  const RoleIcon = roleInfo.icon;

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        'hover:bg-muted/30 transition-colors',
                        !user.isActive && 'opacity-70',
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{user.email}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'text-xs font-semibold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5',
                            roleInfo.classes,
                          )}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 gap-1"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: user.id,
                                newStatus: !user.isActive,
                              })
                            }
                            disabled={toggleStatusMutation.isPending}
                          >
                            {user.isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                                  Active
                                </span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground font-medium text-[11px]">
                                  Suspended
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="View account"
                            onClick={() => setUserToView(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            title="Edit credentials"
                            onClick={() => setUserToEdit(user)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            title="Delete account"
                            onClick={() => setUserToDelete(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
            Showing <span className="font-medium text-foreground">{users.length}</span> accounts
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

      {/* RBAC Security Policy Callout */}
      <div className="mt-8 p-4 rounded-xl border border-border/60 bg-muted/20 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Role-Based Access Control Governance</p>
          <p className="text-muted-foreground leading-relaxed">
            Roles dictate accessible navigation tabs and administrative features. Suspended accounts are immediately forbidden from obtaining JWT sessions or invoking API endpoints.
          </p>
        </div>
      </div>

      {/* User Form Modal (Create & Edit) */}
      <UserFormModal
        open={isCreateModalOpen || Boolean(userToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setUserToEdit(null);
          }
        }}
        userToEdit={userToEdit}
        onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['users'] })}
      />

      {/* User Details Modal */}
      {userToView && (
        <UserDetailsModal
          open={Boolean(userToView)}
          onOpenChange={(open) => !open && setUserToView(null)}
          user={userToView}
          onEdit={(u) => {
            setUserToView(null);
            setUserToEdit(u);
          }}
          onDelete={(u) => {
            setUserToView(null);
            setUserToDelete(u);
          }}
        />
      )}

      {/* Delete User Dialog */}
      {userToDelete && (
        <DeleteUserDialog
          open={Boolean(userToDelete)}
          onOpenChange={(open) => !open && setUserToDelete(null)}
          user={userToDelete}
          onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['users'] })}
        />
      )}
    </div>
  );
}
