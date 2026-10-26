export type ProjectStatus = 'draft' | 'published';
export type VlogCategory = 'College Days' | 'Solo Dates' | 'Lifestyle' | 'Tech & Study' | 'Other';
export type ExperienceType = 'internship' | 'freelance' | 'academic' | 'full-time' | 'leadership';

export interface Profile {
  id: string;
  full_name: string;
  preferred_name: string;
  headline: string;
  bio: string;
  career_goal: string;
  college: string;
  degree: string;
  specialization: string;
  year_of_study: string;
  email: string;
  phone?: string;
  location: string;
  github_url: string;
  linkedin_url: string;
  avatar_url?: string;
  resume_url?: string;
  strengths: string[];
  areas_for_improvement: string[];
  growth_areas?: string[];
  work_style: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProjectScreenshot {
  url: string;
  caption?: string;
}

export interface ProjectVideo {
  title: string;
  url: string;
  source: 'youtube' | 'vimeo' | 'storage' | 'embed' | string;
  duration?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description?: string;
  problem_statement?: string;
  business_objective?: string;
  business_questions?: string[];
  dataset_description?: string;
  data_cleaning_process?: string[];
  methodology?: string[];
  key_findings?: string[];
  recommendations?: string[];
  thumbnail_url?: string;
  github_url?: string;
  live_demo_url?: string;
  video_url?: string;
  demo_videos?: ProjectVideo[];
  tags: string[];
  category: string;
  featured: boolean;
  sort_order: number;
  status: ProjectStatus;
  screenshots?: (string | ProjectScreenshot)[];
  related_project_slugs?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SkillItem {
  name: string;
  level?: string;
  icon?: string;
  description?: string;
  is_featured?: boolean;
  sort_order?: number;
}

export interface SkillCategory {
  name: string;
  description?: string;
  skills: SkillItem[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
  certificate_image_url?: string;
  is_ongoing: boolean;
  skills_covered?: string[];
  status: 'completed' | 'in_progress';
  sort_order?: number;
}

export interface Experience {
  id: string;
  organization: string;
  role: string;
  experience_type: ExperienceType;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description: string;
  bullet_points?: string[];
  link_url?: string;
  skills_used?: string[];
  status?: ProjectStatus;
  sort_order?: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  grade_or_status: string;
  highlights?: string[];
  sort_order?: number;
}

export interface VlogItem {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  video_url?: string;
  video_source: 'youtube' | 'vimeo' | 'storage' | 'embed';
  category: VlogCategory;
  published_date: string;
  status: ProjectStatus;
  duration?: string;
  sort_order?: number;
}

export interface SiteSettings {
  site_title: string;
  tagline?: string;
  contact_email: string;
  is_maintenance_mode?: boolean;
  maintenance_mode?: boolean;
  allow_contact_form?: boolean;
  meta_description?: string;
  public_vlogs_enabled?: boolean;
  certifications_section_enabled?: boolean;
  experience_section_enabled?: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  category: 'auth' | 'project' | 'profile' | 'media' | 'settings' | 'system';
  description: string;
  actor: string;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
}

export const emptyProfile: Profile = {
  id: 'profile-main',
  full_name: '',
  preferred_name: '',
  headline: '',
  bio: '',
  career_goal: '',
  college: '',
  degree: '',
  specialization: '',
  year_of_study: '',
  email: '',
  phone: '',
  location: '',
  github_url: '',
  linkedin_url: '',
  avatar_url: '',
  resume_url: '',
  strengths: [],
  areas_for_improvement: [],
  growth_areas: [],
  work_style: [],
};

// ==============================================================================
// DYNAMIC MANAGEMENT TABS & CUSTOM FIELDS
// ==============================================================================

export type CustomFieldType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'date'
  | 'url'
  | 'boolean'
  | 'select';

export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // for select dropdown
  placeholder?: string;
  order: number;
}

export interface CustomTabConfig {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  singular_name: string;
  plural_name: string;
  fields: CustomFieldDefinition[];
  order: number;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomTabRecord {
  id: string;
  tab_slug: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

