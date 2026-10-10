import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  Activity,
  ArrowRight,
  Server,
  Database,
  CheckCircle2,
  Sliders,
  History,
} from 'lucide-react';
import type { useDashboardData } from '../../../hooks/use-dashboard-data.ts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card.tsx';
import { Button } from '../../../components/ui/button.tsx';
import { cn } from '@/lib/utils';

interface SuperAdminDashboardProps {
  data: ReturnType<typeof useDashboardData>;
}

export function SuperAdminDashboard({ data }: SuperAdminDashboardProps) {
  const navigate = useNavigate();
  const { counts, health, readiness, isHealthy, recentSchools } = data;

  const uptimeSeconds = health?.uptime ? Math.floor(health.uptime) : 0;
  const uptimeHours = Math.floor(uptimeSeconds / 3600);
  const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Schools
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.schools}</div>
            <p className="text-xs text-muted-foreground mt-1">Multi-tenant institutions</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Users
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.users}</div>
            <p className="text-xs text-muted-foreground mt-1">Active user accounts</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Students Enrolled
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.students}</div>
            <p className="text-xs text-muted-foreground mt-1">Total active admissions</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Health
            </CardTitle>
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                isHealthy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive',
              )}
            >
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={cn('w-2.5 h-2.5 rounded-full', isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-destructive')}
              />
              <span className="text-2xl font-bold">{isHealthy ? 'Operational' : 'Degraded'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {uptimeHours}h {uptimeMinutes}m
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infrastructure Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Infrastructure Services
            </CardTitle>
            <CardDescription className="text-xs">Live probe diagnostics from /health and /ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-semibold">PostgreSQL Database</p>
                  <p className="text-[10px] text-muted-foreground">Pool status & composite indexes</p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                  readiness?.services.database.status === 'up'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-destructive/10 text-destructive',
                )}
              >
                {readiness?.services.database.status === 'up' ? 'Online' : 'Degraded'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold">Redis Cache & Rate Limiter</p>
                  <p className="text-[10px] text-muted-foreground">Token store & write limits</p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                  readiness?.services.redis.status === 'up'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-destructive/10 text-destructive',
                )}
              >
                {readiness?.services.redis.status === 'up' ? 'Online' : 'Degraded'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Multi-tenant isolation and per-route rate limiting active.</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Administrative Action Tiles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Administrative Quick Actions</CardTitle>
            <CardDescription className="text-xs">Shortcuts to manage institutions, users, and audit compliance</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/schools')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">Manage Schools</p>
                <p className="text-xs text-muted-foreground">Register new institutions and toggle status</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/users')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">User Administration</p>
                <p className="text-xs text-muted-foreground">Configure roles across all 6 permission tiers</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/audit-logs')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                  <History className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">Security Audit Trail</p>
                <p className="text-xs text-muted-foreground">Inspect chronological mutation diffs</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/settings/screens')}
              className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 text-left transition-all hover:border-primary/50 group flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <Sliders className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-foreground">Screen Role Matrix</p>
                <p className="text-xs text-muted-foreground">Customize screen visibility per role</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Schools Preview Table */}
      {recentSchools.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Registered Schools Overview</CardTitle>
              <CardDescription className="text-xs">Quick preview of registered educational institutions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/schools')} className="text-xs gap-1">
              View All Schools <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {recentSchools.map((school) => (
                <div key={school.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {school.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{school.name}</p>
                      <p className="text-muted-foreground">{school.city ? `${school.city}, ${school.state || ''}` : 'Location unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                      {school.code}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        school.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500',
                      )}
                    >
                      {school.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
