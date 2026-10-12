import { useState, useMemo } from 'react';
import {
  Sliders,
  RotateCcw,
  Download,
  Upload,
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Database,
  Crown,
} from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Card, CardContent } from '../../components/ui/card.tsx';
import {
  CATEGORIES,
  SCREENS_REGISTRY,
} from '../../config/screens.config.ts';
import { useScreenPermissionsStore } from '../../store/screen-permissions.store.ts';
import { ScreenVisibilityMatrix } from './components/ScreenVisibilityMatrix.tsx';
import { ImpersonationSandboxWidget } from './components/ImpersonationSandboxBanner.tsx';
import { cn } from '../../lib/utils.ts';
import { toast } from 'sonner';

export function ScreenSettingsPage() {
  const customPermissions = useScreenPermissionsStore((state) => state.customPermissions);
  const resetToDefaults = useScreenPermissionsStore((state) => state.resetToDefaults);
  const exportConfig = useScreenPermissionsStore((state) => state.exportConfig);
  const importConfig = useScreenPermissionsStore((state) => state.importConfig);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Total modified screens
  const modifiedCount = useMemo(() => {
    return Object.keys(customPermissions).length;
  }, [customPermissions]);

  const handleResetAll = () => {
    if (window.confirm('Reset all screen role visibility rules back to default settings?')) {
      resetToDefaults();
      toast.success('All screen permissions reset to system defaults');
    }
  };

  const handleExport = () => {
    const jsonStr = exportConfig();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-matters-permissions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Permission configuration exported successfully');
  };

  const handleApplyImport = () => {
    if (!importJsonText.trim()) {
      toast.error('Please paste JSON configuration text');
      return;
    }
    const success = importConfig(importJsonText);
    if (success) {
      toast.success('Successfully imported custom role permissions');
      setIsImporting(false);
      setImportJsonText('');
    } else {
      toast.error('Invalid JSON structure. Import failed.');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Role-to-Screen Access Governance</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Zero-Routing RBAC
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure dynamic screen visibility per institutional role with live sidebar &amp; route synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5 text-xs h-8"
            title="Download JSON config"
          >
            <Download className="w-3.5 h-3.5" />
            Export Config
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImporting((prev) => !prev)}
            className="gap-1.5 text-xs h-8"
            title="Upload or paste JSON config"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Config
          </Button>

          {modifiedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="gap-1.5 text-xs h-8 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All ({modifiedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Import Dialog Section */}
      {isImporting && (
        <Card className="border-primary/40 bg-primary/5 animate-in slide-in-from-top-2">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-primary" />
                Import Custom Permission Matrix JSON
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsImporting(false)}
                className="h-6 text-xs px-2"
              >
                Cancel
              </Button>
            </div>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='Paste JSON export here: { "schools": ["super_admin", "admin"], ... }'
              className="w-full h-32 p-3 rounded-lg border border-input bg-background font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={handleApplyImport} className="text-xs h-8">
                Apply Imported Permissions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Sandbox Impersonation Widget */}
      <ImpersonationSandboxWidget />

      {/* Governance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Screens
              </p>
              <p className="text-2xl font-bold mt-1">{SCREENS_REGISTRY.length}</p>
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
                Role Tiers
              </p>
              <p className="text-2xl font-bold mt-1 text-purple-500">6</p>
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
                Modified Rules
              </p>
              <p
                className={cn(
                  'text-2xl font-bold mt-1',
                  modifiedCount > 0 ? 'text-amber-500' : 'text-emerald-500',
                )}
              >
                {modifiedCount}
              </p>
            </div>
            <div
              className={cn(
                'p-2.5 rounded-xl',
                modifiedCount > 0
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-emerald-500/10 text-emerald-500',
              )}
            >
              <Sliders className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-border transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Storage Mode
              </p>
              <p className="text-base font-bold mt-1 text-indigo-500">Persistent</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Database className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search screen title, path, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 text-xs"
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
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-muted-foreground font-medium shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 border',
              categoryFilter === ''
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground',
            )}
          >
            All Categories
          </button>
          {Object.values(CATEGORIES)
            .sort((a, b) => a.order - b.order)
            .map((cat) => {
              const isSelected = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 border',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground',
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
        </div>
      </div>

      {/* Screen Visibility Matrix Grid */}
      <ScreenVisibilityMatrix
        searchQuery={search}
        categoryFilter={categoryFilter}
      />

      {/* Governance Architecture Notice */}
      <div className="mt-8 p-4 rounded-xl border border-border/60 bg-muted/20 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Zero-Routing Dynamic RBAC Architecture</p>
          <p className="text-muted-foreground leading-relaxed">
            Screen visibility settings update the navigation sidebar, global command menu, and route guards in real-time. Changes are safely preserved across browser sessions in local storage.
          </p>
        </div>
      </div>
    </div>
  );
}
