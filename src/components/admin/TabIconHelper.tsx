import React from 'react';
import {
  BookOpen,
  Award,
  Trophy,
  FileCode,
  Folder,
  Tag,
  Bookmark,
  GraduationCap,
  Briefcase,
  Star,
  Globe,
  Share2,
  Cpu,
  Database,
  Lightbulb,
  Layers,
  CheckSquare,
  Heart,
  Compass,
  Sparkles,
  Code,
  FileText,
  BarChart3,
  Target,
  LucideIcon
} from 'lucide-react';

export interface TabIconOption {
  name: string;
  label: string;
  icon: LucideIcon;
}

export const AVAILABLE_TAB_ICONS: TabIconOption[] = [
  { name: 'BookOpen', label: 'Book / Publication', icon: BookOpen },
  { name: 'Award', label: 'Award', icon: Award },
  { name: 'Trophy', label: 'Trophy / Hackathon', icon: Trophy },
  { name: 'FileCode', label: 'Code / Scripts', icon: FileCode },
  { name: 'Folder', label: 'Folder / Project', icon: Folder },
  { name: 'Tag', label: 'Tags / Topics', icon: Tag },
  { name: 'Bookmark', label: 'Bookmark / Notes', icon: Bookmark },
  { name: 'GraduationCap', label: 'Academic', icon: GraduationCap },
  { name: 'Briefcase', label: 'Work / Clients', icon: Briefcase },
  { name: 'Star', label: 'Featured / Favorites', icon: Star },
  { name: 'Globe', label: 'Web / Community', icon: Globe },
  { name: 'Share2', label: 'Social / Outreach', icon: Share2 },
  { name: 'Cpu', label: 'Tech / Hardware', icon: Cpu },
  { name: 'Database', label: 'Data / SQL', icon: Database },
  { name: 'Lightbulb', label: 'Ideas / Research', icon: Lightbulb },
  { name: 'Layers', label: 'Stacks / Systems', icon: Layers },
  { name: 'CheckSquare', label: 'Tasks / Milestones', icon: CheckSquare },
  { name: 'Heart', label: 'Volunteering', icon: Heart },
  { name: 'Compass', label: 'Exploration', icon: Compass },
  { name: 'Sparkles', label: 'Innovations', icon: Sparkles },
  { name: 'Code', label: 'Algorithms', icon: Code },
  { name: 'FileText', label: 'Documentation', icon: FileText },
  { name: 'BarChart3', label: 'Analytics / Reports', icon: BarChart3 },
  { name: 'Target', label: 'Goals / Metrics', icon: Target },
];

export const TAB_ICON_MAP: Record<string, LucideIcon> = AVAILABLE_TAB_ICONS.reduce(
  (acc, item) => {
    acc[item.name] = item.icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);

export function getTabIconComponent(iconName: string): LucideIcon {
  return TAB_ICON_MAP[iconName] || Folder;
}

export function renderTabIcon(iconName: string, className = 'w-4 h-4'): React.ReactElement {
  const IconComponent = getTabIconComponent(iconName);
  return <IconComponent className={className} />;
}
