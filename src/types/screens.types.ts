import type { ComponentType } from 'react';
import type { UserRole } from './auth.types.ts';

export type ScreenCategory =
  | 'core'
  | 'academic'
  | 'people'
  | 'administration'
  | 'system';

export interface ScreenDefinition {
  id: string;
  path: string;
  title: string;
  description?: string;
  iconName: string;
  category: ScreenCategory;
  allowedRoles: UserRole[];
  requiredPermissions?: string[];
  component: ComponentType;
  showInSidebar: boolean;
  order: number;
  badge?: () => string | number | null;
}

export interface CategoryMetadata {
  id: ScreenCategory;
  label: string;
  order: number;
}
