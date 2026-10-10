import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, ChevronsUpDown, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store.ts';
import { schoolsApi, type School } from '../../api/schools.api.ts';
import { cn } from '@/lib/utils';

export function SchoolSelector() {
  const queryClient = useQueryClient();
  const { user, activeSchoolId, setActiveSchoolId } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === 'super_admin';

  // Fetch schools list only for super admins
  const { data: schoolsData, isLoading } = useQuery({
    queryKey: ['schools', 'list-selector'],
    queryFn: () => schoolsApi.list({ limit: 100, status: 'active' }),
    enabled: isSuperAdmin,
  });

  const schools = schoolsData?.data || [];
  const selectedSchool = schools.find((s) => s.id === activeSchoolId);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSchool = (schoolId: string | null) => {
    setActiveSchoolId(schoolId);
    setIsOpen(false);
    // Invalidate queries so all screens refresh their school-scoped data
    void queryClient.invalidateQueries();
  };

  // If user is locked to a specific school (school-scoped role)
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/40 text-xs font-medium text-muted-foreground select-none">
        <Building2 className="w-3.5 h-3.5 text-primary" />
        <span className="truncate max-w-[140px]">
          {user?.schoolId ? 'Assigned School' : 'Single School Tenant'}
        </span>
      </div>
    );
  }

  // Super admin dropdown selector
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-xs font-medium shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {selectedSchool ? (
          <>
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[150px] font-semibold text-foreground">
              {selectedSchool.name}
            </span>
          </>
        ) : (
          <>
            <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate max-w-[150px] font-semibold text-foreground">
              All Schools (Global)
            </span>
          </>
        )}
        <ChevronsUpDown className="w-3 h-3 text-muted-foreground shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-64 rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Switch School Scope
          </div>

          <button
            type="button"
            onClick={() => handleSelectSchool(null)}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
              activeSchoolId === null ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground',
            )}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>All Schools (Global View)</span>
            </div>
            {activeSchoolId === null && <Check className="w-3.5 h-3.5 text-primary" />}
          </button>

          <div className="my-1 border-t border-border/40" />

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {isLoading && (
              <div className="p-3 text-center text-xs text-muted-foreground">Loading schools...</div>
            )}

            {!isLoading && schools.length === 0 && (
              <div className="p-3 text-center text-xs text-muted-foreground">No schools found</div>
            )}

            {schools.map((school: School) => {
              const isSelected = activeSchoolId === school.id;
              return (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => handleSelectSchool(school.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground',
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="truncate">
                      <p className="truncate font-medium">{school.name}</p>
                      <p className="text-[10px] text-muted-foreground">{school.code}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
