import type { LucideProps } from 'lucide-react';
import {
  LayoutDashboard,
  UserCircle,
  BookOpen,
  Layers,
  GraduationCap,
  Briefcase,
  Users,
  CalendarCheck,
  Building2,
  Award,
  UserCheck,
  History,
  Sliders,
  HelpCircle,
  FileText,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  LayoutDashboard,
  UserCircle,
  BookOpen,
  Layers,
  GraduationCap,
  Briefcase,
  Users,
  CalendarCheck,
  Building2,
  Award,
  UserCheck,
  History,
  Sliders,
  FileText,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent {...props} />;
}
