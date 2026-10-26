import {
  Profile,
  Project,
  SkillCategory,
  SkillItem,
  Certification,
  Experience,
  Education,
  VlogItem,
  SiteSettings,
  emptyProfile,
  CustomTabConfig,
  CustomTabRecord
} from '@/types';
import {
  initialProfile,
  initialProjects,
  skillCategories,
  initialCertifications,
  initialExperience,
  initialEducation,
  initialVlogs,
  initialSiteSettings
} from '@/lib/data/portfolioData';

export interface ContentBlock {
  key: string;
  title: string;
  block_type: 'heading' | 'paragraph' | 'rich_text' | 'image' | 'video' | 'button' | 'highlight' | 'list';
  content: string;
  media_url?: string;
  link_url?: string;
  link_label?: string;
  display_order: number;
  is_published: boolean;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video';
  size?: string;
  uploaded_at: string;
}

export interface ContactLinkSettings {
  email: string;
  email_visible: boolean;
  phone?: string;
  phone_visible: boolean;
  linkedin_url: string;
  linkedin_visible: boolean;
  github_url: string;
  github_visible: boolean;
  twitter_url?: string;
  location: string;
  location_visible: boolean;
}

const STORAGE_KEYS = {
  PROFILE: 'maddala_cms_profile',
  PROJECTS: 'maddala_cms_projects',
  SKILLS: 'maddala_cms_skills',
  CERTIFICATIONS: 'maddala_cms_certifications',
  EXPERIENCE: 'maddala_cms_experience',
  EDUCATION: 'maddala_cms_education',
  VLOGS: 'maddala_cms_vlogs',
  CONTENT_BLOCKS: 'maddala_cms_blocks',
  CONTACT_LINKS: 'maddala_cms_contact_links',
  SITE_SETTINGS: 'maddala_cms_site_settings',
  MEDIA_ASSETS: 'maddala_cms_media_assets',
  CUSTOM_TABS: 'maddala_cms_custom_tabs',
  CUSTOM_RECORDS_PREFIX: 'maddala_cms_custom_records_',
};

// Purge legacy mock data from browser localStorage once so admin starts clean
if (typeof window !== 'undefined') {
  const PURGE_KEY = 'maddala_cms_purged_mock_v3';
  if (!localStorage.getItem(PURGE_KEY)) {
    const sampleCheck = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (sampleCheck && sampleCheck.includes('Banking Customer Churn')) {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.EDUCATION);
      localStorage.removeItem(STORAGE_KEYS.SKILLS);
      localStorage.removeItem(STORAGE_KEYS.CERTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.EXPERIENCE);
      localStorage.removeItem(STORAGE_KEYS.VLOGS);
      localStorage.removeItem(STORAGE_KEYS.CONTENT_BLOCKS);
      localStorage.removeItem(STORAGE_KEYS.MEDIA_ASSETS);
    }
    localStorage.setItem(PURGE_KEY, 'true');
  }
}

// In-memory cache to guarantee sub-5ms tab switching and prevent request spam
const memCache: Record<string, { data: unknown; expires: number }> = {};
const CACHE_TTL_MS = 10000; // 10-second memory cache for instant tab transitions

function getFromMemCache<T>(key: string): T | null {
  const cached = memCache[key];
  if (cached && Date.now() < cached.expires) {
    return cached.data as T;
  }
  return null;
}

function setInMemCache<T>(key: string, data: T): void {
  memCache[key] = {
    data,
    expires: Date.now() + CACHE_TTL_MS,
  };
}

export function invalidateCmsCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    Object.keys(memCache).forEach((k) => delete memCache[k]);
  } else {
    Object.keys(memCache)
      .filter((k) => k.startsWith(keyPrefix))
      .forEach((k) => delete memCache[k]);
  }
}

// Safe helper to read from LocalStorage in browser
function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safe helper to write to LocalStorage in browser.
 * CRITICAL PERFORMANCE FIX:
 * notify defaults to FALSE to prevent infinite event feedback loops during read operations.
 * notify is ONLY set to TRUE during explicit mutation operations (save/delete).
 */
function setLocalItem<T>(key: string, value: T, notify = false): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    if (notify) {
      window.dispatchEvent(new Event('cms_storage_updated'));
    }
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Safe helper for API fetch requests
async function apiRequest<T>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Server environment' };
  }
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    const json = await res.json();
    return json;
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network request error',
    };
  }
}

// ==============================================================================
// 1. PROFILE MANAGEMENT
// ==============================================================================

export async function getCmsProfile(): Promise<Profile> {
  const cached = getFromMemCache<Profile>(STORAGE_KEYS.PROFILE);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<Profile>('/api/cms/profile');
    if (res.success && res.data) {
      setInMemCache(STORAGE_KEYS.PROFILE, res.data);
      setLocalItem(STORAGE_KEYS.PROFILE, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<Profile>(STORAGE_KEYS.PROFILE, emptyProfile);
}

export async function saveCmsProfile(updated: Partial<Profile>): Promise<{ success: boolean; data?: Profile; error?: string }> {
  const current = await getCmsProfile();
  const merged: Profile = {
    ...current,
    ...updated,
    updated_at: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const res = await apiRequest<Profile>('/api/cms/profile', {
      method: 'POST',
      body: JSON.stringify(merged),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.PROFILE);
      setInMemCache(STORAGE_KEYS.PROFILE, res.data);
      setLocalItem(STORAGE_KEYS.PROFILE, res.data, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save profile to database' };
  }

  setInMemCache(STORAGE_KEYS.PROFILE, merged);
  setLocalItem(STORAGE_KEYS.PROFILE, merged, true);
  return { success: true, data: merged };
}

// ==============================================================================
// 2. PROJECT MANAGEMENT
// ==============================================================================

export async function getCmsProjects(): Promise<Project[]> {
  const cached = getFromMemCache<Project[]>(STORAGE_KEYS.PROJECTS);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<Project[]>('/api/cms/projects');
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(STORAGE_KEYS.PROJECTS, res.data);
      setLocalItem(STORAGE_KEYS.PROJECTS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
}

export async function saveCmsProject(project: Partial<Project>): Promise<{ success: boolean; data?: Project; error?: string }> {
  const generatedSlug = (project.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const slug = (project.slug || generatedSlug || 'untitled-project').trim();
  const id = project.id || `proj-${Date.now()}`;

  const payload: Partial<Project> = {
    ...project,
    id,
    slug,
  };

  if (typeof window !== 'undefined') {
    const res = await apiRequest<Project>('/api/cms/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.PROJECTS);
      const projects = await getCmsProjects();
      const updatedList = projects.some((p) => p.id === id)
        ? projects.map((p) => (p.id === id ? res.data! : p))
        : [...projects, res.data];
      setInMemCache(STORAGE_KEYS.PROJECTS, updatedList);
      setLocalItem(STORAGE_KEYS.PROJECTS, updatedList, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save project to database' };
  }

  const projects = await getCmsProjects();
  const finalProject: Project = {
    id,
    slug,
    title: project.title || 'Untitled Project',
    short_description: project.short_description || '',
    full_description: project.full_description || '',
    problem_statement: project.problem_statement || '',
    business_objective: project.business_objective || '',
    business_questions: project.business_questions || [],
    dataset_description: project.dataset_description || '',
    data_cleaning_process: project.data_cleaning_process || [],
    methodology: project.methodology || [],
    key_findings: project.key_findings || [],
    recommendations: project.recommendations || [],
    thumbnail_url: project.thumbnail_url || '',
    github_url: project.github_url || '',
    live_demo_url: project.live_demo_url || '',
    demo_videos: project.demo_videos || [],
    tags: project.tags || [],
    category: project.category || 'Data Analytics',
    featured: Boolean(project.featured),
    sort_order: Number(project.sort_order) || projects.length + 1,
    status: project.status || 'draft',
    screenshots: project.screenshots || [],
    related_project_slugs: project.related_project_slugs || [],
    updated_at: new Date().toISOString()
  };

  const updatedList = projects.some((p) => p.id === id)
    ? projects.map((p) => (p.id === id ? finalProject : p))
    : [...projects, finalProject];

  setInMemCache(STORAGE_KEYS.PROJECTS, updatedList);
  setLocalItem(STORAGE_KEYS.PROJECTS, updatedList, true);
  return { success: true, data: finalProject };
}

export async function deleteCmsProject(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(`/api/cms/projects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete project from database' };
    }
  }

  invalidateCmsCache(STORAGE_KEYS.PROJECTS);
  const projects = await getCmsProjects();
  const updated = projects.filter((p) => p.id !== id);
  setInMemCache(STORAGE_KEYS.PROJECTS, updated);
  setLocalItem(STORAGE_KEYS.PROJECTS, updated, true);
  return { success: true };
}

export async function toggleCmsProjectStatus(id: string, status: 'draft' | 'published'): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>('/api/cms/projects', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
    if (res.success) {
      invalidateCmsCache(STORAGE_KEYS.PROJECTS);
      const projects = await getCmsProjects();
      const updated = projects.map((p) => (p.id === id ? { ...p, status } : p));
      setInMemCache(STORAGE_KEYS.PROJECTS, updated);
      setLocalItem(STORAGE_KEYS.PROJECTS, updated, true);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to toggle project status' };
  }

  const projects = await getCmsProjects();
  const target = projects.find((p) => p.id === id);
  if (!target) return { success: false, error: 'Project not found' };
  return await saveCmsProject({ ...target, status });
}

// ==============================================================================
// 3. EDUCATION MANAGEMENT
// ==============================================================================

export async function getCmsEducation(): Promise<Education[]> {
  const cached = getFromMemCache<Education[]>(STORAGE_KEYS.EDUCATION);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<Education[]>('/api/cms/education');
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(STORAGE_KEYS.EDUCATION, res.data);
      setLocalItem(STORAGE_KEYS.EDUCATION, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<Education[]>(STORAGE_KEYS.EDUCATION, []);
}

export async function saveCmsEducation(edu: Partial<Education>): Promise<{ success: boolean; data?: Education; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<Education>('/api/cms/education', {
      method: 'POST',
      body: JSON.stringify(edu),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.EDUCATION);
      const list = await getCmsEducation();
      const updatedList = list.some((e) => e.id === res.data!.id)
        ? list.map((e) => (e.id === res.data!.id ? res.data! : e))
        : [...list, res.data];
      setInMemCache(STORAGE_KEYS.EDUCATION, updatedList);
      setLocalItem(STORAGE_KEYS.EDUCATION, updatedList, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save education record to database' };
  }

  const list = await getCmsEducation();
  const id = edu.id || `edu-${Date.now()}`;
  const record: Education = {
    id,
    institution: edu.institution || '',
    degree: edu.degree || '',
    field_of_study: edu.field_of_study || '',
    start_year: edu.start_year || '',
    end_year: edu.end_year || '',
    grade_or_status: edu.grade_or_status || '',
    highlights: edu.highlights || [],
    sort_order: edu.sort_order || list.length + 1
  };

  const updatedList = list.some((e) => e.id === id)
    ? list.map((e) => (e.id === id ? record : e))
    : [...list, record];

  setInMemCache(STORAGE_KEYS.EDUCATION, updatedList);
  setLocalItem(STORAGE_KEYS.EDUCATION, updatedList, true);
  return { success: true, data: record };
}

export async function deleteCmsEducation(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(`/api/cms/education?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete education record from database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.EDUCATION);
  const list = await getCmsEducation();
  const updated = list.filter((e) => e.id !== id);
  setInMemCache(STORAGE_KEYS.EDUCATION, updated);
  setLocalItem(STORAGE_KEYS.EDUCATION, updated, true);
  return { success: true };
}

// ==============================================================================
// 4. SKILLS & TECHNOLOGIES MANAGEMENT
// ==============================================================================

export async function getCmsSkills(): Promise<SkillCategory[]> {
  const cached = getFromMemCache<SkillCategory[]>(STORAGE_KEYS.SKILLS);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<SkillCategory[]>('/api/cms/skills');
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(STORAGE_KEYS.SKILLS, res.data);
      setLocalItem(STORAGE_KEYS.SKILLS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<SkillCategory[]>(STORAGE_KEYS.SKILLS, []);
}

export async function saveCmsSkillCategory(category: SkillCategory): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>('/api/cms/skills', {
      method: 'POST',
      body: JSON.stringify({ action: 'save_category', category }),
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to save skill category to database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.SKILLS);
  const categories = await getCmsSkills();
  const exists = categories.some((c) => c.name === category.name);
  const updated = exists
    ? categories.map((c) => (c.name === category.name ? category : c))
    : [...categories, category];
  setInMemCache(STORAGE_KEYS.SKILLS, updated);
  setLocalItem(STORAGE_KEYS.SKILLS, updated, true);
  return { success: true };
}

export async function addCmsSkill(categoryName: string, skill: SkillItem): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>('/api/cms/skills', {
      method: 'POST',
      body: JSON.stringify({ action: 'add_skill', categoryName, skill }),
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to add skill to database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.SKILLS);
  const categories = await getCmsSkills();
  const updated = categories.map((cat) => {
    if (cat.name === categoryName) {
      return {
        ...cat,
        skills: [...cat.skills.filter((s) => s.name !== skill.name), skill]
      };
    }
    return cat;
  });
  setInMemCache(STORAGE_KEYS.SKILLS, updated);
  setLocalItem(STORAGE_KEYS.SKILLS, updated, true);
  return { success: true };
}

export async function deleteCmsSkill(categoryName: string, skillName: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(
      `/api/cms/skills?categoryName=${encodeURIComponent(categoryName)}&skillName=${encodeURIComponent(skillName)}`,
      { method: 'DELETE' }
    );
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete skill from database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.SKILLS);
  const categories = await getCmsSkills();
  const updated = categories.map((cat) => {
    if (cat.name === categoryName) {
      return {
        ...cat,
        skills: cat.skills.filter((s) => s.name !== skillName)
      };
    }
    return cat;
  });
  setInMemCache(STORAGE_KEYS.SKILLS, updated);
  setLocalItem(STORAGE_KEYS.SKILLS, updated, true);
  return { success: true };
}

// ==============================================================================
// 5. CERTIFICATIONS MANAGEMENT
// ==============================================================================

export async function getCmsCertifications(): Promise<Certification[]> {
  const cached = getFromMemCache<Certification[]>(STORAGE_KEYS.CERTIFICATIONS);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<Certification[]>('/api/cms/certifications');
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(STORAGE_KEYS.CERTIFICATIONS, res.data);
      setLocalItem(STORAGE_KEYS.CERTIFICATIONS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<Certification[]>(STORAGE_KEYS.CERTIFICATIONS, []);
}

export async function saveCmsCertification(cert: Partial<Certification>): Promise<{ success: boolean; data?: Certification; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<Certification>('/api/cms/certifications', {
      method: 'POST',
      body: JSON.stringify(cert),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.CERTIFICATIONS);
      const list = await getCmsCertifications();
      const updatedList = list.some((c) => c.id === res.data!.id)
        ? list.map((c) => (c.id === res.data!.id ? res.data! : c))
        : [...list, res.data];
      setInMemCache(STORAGE_KEYS.CERTIFICATIONS, updatedList);
      setLocalItem(STORAGE_KEYS.CERTIFICATIONS, updatedList, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save certification to database' };
  }

  const list = await getCmsCertifications();
  const id = cert.id || `cert-${Date.now()}`;
  const record: Certification = {
    id,
    title: cert.title || '',
    issuer: cert.issuer || '',
    issue_date: cert.issue_date || '',
    credential_url: cert.credential_url || '',
    certificate_image_url: cert.certificate_image_url || '',
    is_ongoing: Boolean(cert.is_ongoing),
    skills_covered: cert.skills_covered || [],
    status: cert.status || 'completed',
    sort_order: cert.sort_order || list.length + 1
  };

  const updatedList = list.some((c) => c.id === id)
    ? list.map((c) => (c.id === id ? record : c))
    : [...list, record];

  setInMemCache(STORAGE_KEYS.CERTIFICATIONS, updatedList);
  setLocalItem(STORAGE_KEYS.CERTIFICATIONS, updatedList, true);
  return { success: true, data: record };
}

export async function deleteCmsCertification(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(`/api/cms/certifications?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete certification from database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.CERTIFICATIONS);
  const list = await getCmsCertifications();
  const updated = list.filter((c) => c.id !== id);
  setInMemCache(STORAGE_KEYS.CERTIFICATIONS, updated);
  setLocalItem(STORAGE_KEYS.CERTIFICATIONS, updated, true);
  return { success: true };
}

// ==============================================================================
// 6. EXPERIENCE MANAGEMENT
// ==============================================================================

export async function getCmsExperience(): Promise<Experience[]> {
  const cached = getFromMemCache<Experience[]>(STORAGE_KEYS.EXPERIENCE);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<Experience[]>('/api/cms/experience');
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(STORAGE_KEYS.EXPERIENCE, res.data);
      setLocalItem(STORAGE_KEYS.EXPERIENCE, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<Experience[]>(STORAGE_KEYS.EXPERIENCE, []);
}

export async function saveCmsExperience(exp: Partial<Experience>): Promise<{ success: boolean; data?: Experience; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<Experience>('/api/cms/experience', {
      method: 'POST',
      body: JSON.stringify(exp),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.EXPERIENCE);
      const list = await getCmsExperience();
      const updatedList = list.some((e) => e.id === res.data!.id)
        ? list.map((e) => (e.id === res.data!.id ? res.data! : e))
        : [...list, res.data];
      setInMemCache(STORAGE_KEYS.EXPERIENCE, updatedList);
      setLocalItem(STORAGE_KEYS.EXPERIENCE, updatedList, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save experience record to database' };
  }

  const list = await getCmsExperience();
  const id = exp.id || `exp-${Date.now()}`;
  const record: Experience = {
    id,
    organization: exp.organization || '',
    role: exp.role || '',
    experience_type: exp.experience_type || 'internship',
    start_date: exp.start_date || '',
    end_date: exp.end_date,
    is_current: Boolean(exp.is_current),
    location: exp.location || '',
    description: exp.description || '',
    bullet_points: exp.bullet_points || [],
    link_url: exp.link_url,
    skills_used: exp.skills_used || [],
    status: exp.status || 'published',
    sort_order: exp.sort_order || list.length + 1
  };

  const updatedList = list.some((e) => e.id === id)
    ? list.map((e) => (e.id === id ? record : e))
    : [...list, record];

  setInMemCache(STORAGE_KEYS.EXPERIENCE, updatedList);
  setLocalItem(STORAGE_KEYS.EXPERIENCE, updatedList, true);
  return { success: true, data: record };
}

export async function deleteCmsExperience(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(`/api/cms/experience?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete experience record from database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.EXPERIENCE);
  const list = await getCmsExperience();
  const updated = list.filter((e) => e.id !== id);
  setInMemCache(STORAGE_KEYS.EXPERIENCE, updated);
  setLocalItem(STORAGE_KEYS.EXPERIENCE, updated, true);
  return { success: true };
}

// ==============================================================================
// 7. VLOGS & LIFESTYLE MANAGEMENT
// ==============================================================================

export async function getCmsVlogs(): Promise<VlogItem[]> {
  const cached = getFromMemCache<VlogItem[]>(STORAGE_KEYS.VLOGS);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<VlogItem[]>('/api/cms/vlogs');
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(STORAGE_KEYS.VLOGS, res.data);
      setLocalItem(STORAGE_KEYS.VLOGS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<VlogItem[]>(STORAGE_KEYS.VLOGS, []);
}

export async function saveCmsVlog(vlog: Partial<VlogItem>): Promise<{ success: boolean; data?: VlogItem; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<VlogItem>('/api/cms/vlogs', {
      method: 'POST',
      body: JSON.stringify(vlog),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.VLOGS);
      const list = await getCmsVlogs();
      const updatedList = list.some((v) => v.id === res.data!.id)
        ? list.map((v) => (v.id === res.data!.id ? res.data! : v))
        : [...list, res.data];
      setInMemCache(STORAGE_KEYS.VLOGS, updatedList);
      setLocalItem(STORAGE_KEYS.VLOGS, updatedList, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save vlog to database' };
  }

  const list = await getCmsVlogs();
  const id = vlog.id || `vlog-${Date.now()}`;
  const record: VlogItem = {
    id,
    title: vlog.title || '',
    description: vlog.description || '',
    thumbnail_url: vlog.thumbnail_url || '',
    video_url: vlog.video_url || '',
    video_source: vlog.video_source || 'youtube',
    category: vlog.category || 'Other',
    published_date: vlog.published_date || '',
    status: vlog.status || 'draft',
    duration: vlog.duration || '',
    sort_order: vlog.sort_order || list.length + 1
  };

  const updatedList = list.some((v) => v.id === id)
    ? list.map((v) => (v.id === id ? record : v))
    : [...list, record];

  setInMemCache(STORAGE_KEYS.VLOGS, updatedList);
  setLocalItem(STORAGE_KEYS.VLOGS, updatedList, true);
  return { success: true, data: record };
}

export async function deleteCmsVlog(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(`/api/cms/vlogs?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete vlog from database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.VLOGS);
  const list = await getCmsVlogs();
  const updated = list.filter((v) => v.id !== id);
  setInMemCache(STORAGE_KEYS.VLOGS, updated);
  setLocalItem(STORAGE_KEYS.VLOGS, updated, true);
  return { success: true };
}

// ==============================================================================
// 8. CONTENT BLOCKS MANAGEMENT
// ==============================================================================

export const initialContentBlocks: ContentBlock[] = [
  {
    key: 'hero_availability',
    title: 'Internship Availability Announcement',
    block_type: 'highlight',
    content: 'Targeting 2025/2026 Data Analytics Internships in Product & Fintech Companies.',
    display_order: 1,
    is_published: true
  },
  {
    key: 'about_quote',
    title: 'Analytics Perspective Quote',
    block_type: 'heading',
    content: 'Transforming raw data into clear business narratives through quantitative rigor and SQL clarity.',
    display_order: 2,
    is_published: true
  },
  {
    key: 'contact_cta',
    title: 'Let\'s Connect Callout',
    block_type: 'paragraph',
    content: 'Looking for a dedicated analyst who loves digging into numbers and translating them into clear business actions? I\'d love to connect.',
    display_order: 3,
    is_published: true
  }
];

export async function getCmsContentBlocks(): Promise<ContentBlock[]> {
  const cached = getFromMemCache<ContentBlock[]>(STORAGE_KEYS.CONTENT_BLOCKS);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<ContentBlock[]>('/api/cms/content-blocks');
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(STORAGE_KEYS.CONTENT_BLOCKS, res.data);
      setLocalItem(STORAGE_KEYS.CONTENT_BLOCKS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<ContentBlock[]>(STORAGE_KEYS.CONTENT_BLOCKS, []);
}

export async function saveCmsContentBlock(block: Partial<ContentBlock>): Promise<{ success: boolean; data?: ContentBlock; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<ContentBlock>('/api/cms/content-blocks', {
      method: 'POST',
      body: JSON.stringify(block),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.CONTENT_BLOCKS);
      const list = await getCmsContentBlocks();
      const updatedList = list.some((b) => b.key === res.data!.key)
        ? list.map((b) => (b.key === res.data!.key ? res.data! : b))
        : [...list, res.data];
      setInMemCache(STORAGE_KEYS.CONTENT_BLOCKS, updatedList);
      setLocalItem(STORAGE_KEYS.CONTENT_BLOCKS, updatedList, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save content block to database' };
  }

  const list = await getCmsContentBlocks();
  const key = (block.key || `block_${Date.now()}`).trim();
  const record: ContentBlock = {
    key,
    title: block.title || 'Untitled Block',
    block_type: block.block_type || 'paragraph',
    content: block.content || '',
    media_url: block.media_url,
    link_url: block.link_url,
    link_label: block.link_label,
    display_order: block.display_order || list.length + 1,
    is_published: block.is_published !== false
  };

  const updatedList = list.some((b) => b.key === key)
    ? list.map((b) => (b.key === key ? record : b))
    : [...list, record];

  setInMemCache(STORAGE_KEYS.CONTENT_BLOCKS, updatedList);
  setLocalItem(STORAGE_KEYS.CONTENT_BLOCKS, updatedList, true);
  return { success: true, data: record };
}

export async function deleteCmsContentBlock(key: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(`/api/cms/content-blocks?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete content block from database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.CONTENT_BLOCKS);
  const list = await getCmsContentBlocks();
  const updated = list.filter((b) => b.key !== key);
  setInMemCache(STORAGE_KEYS.CONTENT_BLOCKS, updated);
  setLocalItem(STORAGE_KEYS.CONTENT_BLOCKS, updated, true);
  return { success: true };
}

// ==============================================================================
// 9. CONTACT & SOCIAL LINKS MANAGEMENT
// ==============================================================================

export const initialContactLinks: ContactLinkSettings = {
  email: 'maddalavarshini@example.com',
  email_visible: true,
  phone: '',
  phone_visible: false,
  linkedin_url: 'https://linkedin.com/in/maddala-varshini',
  linkedin_visible: true,
  github_url: 'https://github.com/maddalavarshini',
  github_visible: true,
  location: 'SRKR Engineering College, Bhimavaram, India',
  location_visible: true
};

export async function getCmsContactLinks(): Promise<ContactLinkSettings> {
  const cached = getFromMemCache<ContactLinkSettings>(STORAGE_KEYS.CONTACT_LINKS);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<ContactLinkSettings>('/api/cms/contact-links');
    if (res.success && res.data) {
      setInMemCache(STORAGE_KEYS.CONTACT_LINKS, res.data);
      setLocalItem(STORAGE_KEYS.CONTACT_LINKS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<ContactLinkSettings>(STORAGE_KEYS.CONTACT_LINKS, initialContactLinks);
}

export async function saveCmsContactLinks(links: Partial<ContactLinkSettings>): Promise<{ success: boolean; data?: ContactLinkSettings; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<ContactLinkSettings>('/api/cms/contact-links', {
      method: 'POST',
      body: JSON.stringify(links),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.CONTACT_LINKS);
      setInMemCache(STORAGE_KEYS.CONTACT_LINKS, res.data);
      setLocalItem(STORAGE_KEYS.CONTACT_LINKS, res.data, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save contact links to database' };
  }

  const current = await getCmsContactLinks();
  const merged = { ...current, ...links };
  setInMemCache(STORAGE_KEYS.CONTACT_LINKS, merged);
  setLocalItem(STORAGE_KEYS.CONTACT_LINKS, merged, true);
  return { success: true, data: merged };
}

// ==============================================================================
// 10. SITE SETTINGS MANAGEMENT
// ==============================================================================

export async function getCmsSiteSettings(): Promise<SiteSettings> {
  const cached = getFromMemCache<SiteSettings>(STORAGE_KEYS.SITE_SETTINGS);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<SiteSettings>('/api/cms/settings');
    if (res.success && res.data) {
      setInMemCache(STORAGE_KEYS.SITE_SETTINGS, res.data);
      setLocalItem(STORAGE_KEYS.SITE_SETTINGS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<SiteSettings>(STORAGE_KEYS.SITE_SETTINGS, initialSiteSettings);
}

export async function saveCmsSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; data?: SiteSettings; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<SiteSettings>('/api/cms/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.SITE_SETTINGS);
      setInMemCache(STORAGE_KEYS.SITE_SETTINGS, res.data);
      setLocalItem(STORAGE_KEYS.SITE_SETTINGS, res.data, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save site settings to database' };
  }

  const current = await getCmsSiteSettings();
  const merged = { ...current, ...settings };
  setInMemCache(STORAGE_KEYS.SITE_SETTINGS, merged);
  setLocalItem(STORAGE_KEYS.SITE_SETTINGS, merged, true);
  return { success: true, data: merged };
}

// ==============================================================================
// 11. MEDIA ASSETS LIBRARY
// ==============================================================================

export const initialMediaAssets: MediaAsset[] = [
  {
    id: 'asset-1',
    name: 'banking-churn-eda-correlation.png',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    size: '420 KB',
    uploaded_at: '2025-01-15'
  },
  {
    id: 'asset-2',
    name: 'powerbi-ecommerce-dashboard-executive.png',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    size: '880 KB',
    uploaded_at: '2025-01-20'
  },
  {
    id: 'asset-3',
    name: 'sql-warehouse-star-schema.png',
    url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    size: '340 KB',
    uploaded_at: '2025-02-01'
  }
];

export async function getCmsMediaAssets(): Promise<MediaAsset[]> {
  const cached = getFromMemCache<MediaAsset[]>(STORAGE_KEYS.MEDIA_ASSETS);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<MediaAsset[]>('/api/cms/media');
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(STORAGE_KEYS.MEDIA_ASSETS, res.data);
      setLocalItem(STORAGE_KEYS.MEDIA_ASSETS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<MediaAsset[]>(STORAGE_KEYS.MEDIA_ASSETS, []);
}

export async function saveCmsMediaAsset(asset: Partial<MediaAsset>): Promise<{ success: boolean; data?: MediaAsset; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<MediaAsset>('/api/cms/media', {
      method: 'POST',
      body: JSON.stringify(asset),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.MEDIA_ASSETS);
      const list = await getCmsMediaAssets();
      const updatedList = [res.data, ...list.filter((m) => m.id !== res.data!.id)];
      setInMemCache(STORAGE_KEYS.MEDIA_ASSETS, updatedList);
      setLocalItem(STORAGE_KEYS.MEDIA_ASSETS, updatedList, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save media asset to database' };
  }

  const list = await getCmsMediaAssets();
  const id = asset.id || `media-${Date.now()}`;
  const record: MediaAsset = {
    id,
    name: asset.name || 'unnamed-file',
    url: asset.url || '',
    type: asset.type || 'image',
    size: asset.size || '150 KB',
    uploaded_at: new Date().toISOString().split('T')[0]
  };

  const updatedList = [record, ...list];
  setInMemCache(STORAGE_KEYS.MEDIA_ASSETS, updatedList);
  setLocalItem(STORAGE_KEYS.MEDIA_ASSETS, updatedList, true);
  return { success: true, data: record };
}

export async function deleteCmsMediaAsset(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(`/api/cms/media?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete media asset from database' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.MEDIA_ASSETS);
  const list = await getCmsMediaAssets();
  const updated = list.filter((m) => m.id !== id);
  setInMemCache(STORAGE_KEYS.MEDIA_ASSETS, updated);
  setLocalItem(STORAGE_KEYS.MEDIA_ASSETS, updated, true);
  return { success: true };
}

// ==============================================================================
// 12. DYNAMIC CUSTOM MANAGEMENT TABS
// ==============================================================================

export async function getCmsCustomTabs(includeArchived = false): Promise<CustomTabConfig[]> {
  const cacheKey = `${STORAGE_KEYS.CUSTOM_TABS}_${includeArchived}`;
  const cached = getFromMemCache<CustomTabConfig[]>(cacheKey);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<CustomTabConfig[]>(`/api/admin/custom-tabs${includeArchived ? '?archived=true' : ''}`);
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(cacheKey, res.data);
      setLocalItem(STORAGE_KEYS.CUSTOM_TABS, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<CustomTabConfig[]>(STORAGE_KEYS.CUSTOM_TABS, []);
}

export async function getCmsCustomTabBySlug(slug: string): Promise<CustomTabConfig | null> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<CustomTabConfig>(`/api/admin/custom-tabs/${encodeURIComponent(slug)}`);
    if (res.success && res.data) {
      return res.data;
    }
  }
  const tabs = await getCmsCustomTabs(true);
  return tabs.find((t) => t.slug === slug) || null;
}

export async function saveCmsCustomTab(tab: Partial<CustomTabConfig>): Promise<{ success: boolean; data?: CustomTabConfig; error?: string }> {
  if (typeof window !== 'undefined') {
    const url = tab.slug ? `/api/admin/custom-tabs/${encodeURIComponent(tab.slug)}` : '/api/admin/custom-tabs';
    const method = tab.slug ? 'PUT' : 'POST';
    const res = await apiRequest<CustomTabConfig>(url, {
      method,
      body: JSON.stringify(tab),
    });
    if (res.success && res.data) {
      invalidateCmsCache(STORAGE_KEYS.CUSTOM_TABS);
      const tabs = await getCmsCustomTabs(true);
      const exists = tabs.some((t) => t.slug === res.data!.slug);
      const updated = exists ? tabs.map((t) => (t.slug === res.data!.slug ? res.data! : t)) : [...tabs, res.data];
      setLocalItem(STORAGE_KEYS.CUSTOM_TABS, updated, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save custom tab to database' };
  }

  // Fallback offline
  const slug = (
    tab.slug ||
    (tab.name || 'custom-tab')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  ).trim();

  const tabs = await getCmsCustomTabs(true);
  const record: CustomTabConfig = {
    id: tab.id || `tab_${Date.now()}`,
    name: tab.name || 'Untitled Tab',
    slug,
    description: tab.description || '',
    icon: tab.icon || 'Folder',
    singular_name: tab.singular_name || 'Item',
    plural_name: tab.plural_name || 'Items',
    fields: tab.fields || [],
    order: tab.order || tabs.length + 1,
    is_archived: Boolean(tab.is_archived),
    created_at: tab.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = tabs.some((t) => t.slug === slug)
    ? tabs.map((t) => (t.slug === slug ? record : t))
    : [...tabs, record];
  setLocalItem(STORAGE_KEYS.CUSTOM_TABS, updated, true);
  return { success: true, data: record };
}

export async function deleteCmsCustomTab(slug: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(`/api/admin/custom-tabs/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete custom tab from database' };
    }
  }

  invalidateCmsCache(STORAGE_KEYS.CUSTOM_TABS);
  const tabs = await getCmsCustomTabs(true);
  const updated = tabs.filter((t) => t.slug !== slug);
  setLocalItem(STORAGE_KEYS.CUSTOM_TABS, updated, true);
  return { success: true };
}

export async function reorderCmsCustomTabs(orderedSlugs: string[]): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>('/api/admin/custom-tabs', {
      method: 'PUT',
      body: JSON.stringify({ orderedSlugs }),
    });
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to reorder tabs' };
    }
  }
  invalidateCmsCache(STORAGE_KEYS.CUSTOM_TABS);
  const tabs = await getCmsCustomTabs(true);
  const reordered = [...tabs].sort((a, b) => orderedSlugs.indexOf(a.slug) - orderedSlugs.indexOf(b.slug));
  setLocalItem(STORAGE_KEYS.CUSTOM_TABS, reordered, true);
  return { success: true };
}

// ==============================================================================
// 13. DYNAMIC CUSTOM TAB RECORDS
// ==============================================================================

export async function getCmsCustomRecords(tabSlug: string): Promise<CustomTabRecord[]> {
  const key = `${STORAGE_KEYS.CUSTOM_RECORDS_PREFIX}${tabSlug}`;
  const cached = getFromMemCache<CustomTabRecord[]>(key);
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    const res = await apiRequest<CustomTabRecord[]>(`/api/admin/custom-tabs/${encodeURIComponent(tabSlug)}/records`);
    if (res.success && Array.isArray(res.data)) {
      setInMemCache(key, res.data);
      setLocalItem(key, res.data, false);
      return res.data;
    }
  }
  return getLocalItem<CustomTabRecord[]>(key, []);
}

export async function saveCmsCustomRecord(
  tabSlug: string,
  record: Partial<CustomTabRecord>
): Promise<{ success: boolean; data?: CustomTabRecord; error?: string }> {
  const key = `${STORAGE_KEYS.CUSTOM_RECORDS_PREFIX}${tabSlug}`;
  const id = record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (typeof window !== 'undefined') {
    const url = record.id
      ? `/api/admin/custom-tabs/${encodeURIComponent(tabSlug)}/records/${encodeURIComponent(record.id)}`
      : `/api/admin/custom-tabs/${encodeURIComponent(tabSlug)}/records`;
    const method = record.id ? 'PUT' : 'POST';

    const res = await apiRequest<CustomTabRecord>(url, {
      method,
      body: JSON.stringify(record),
    });

    if (res.success && res.data) {
      invalidateCmsCache(key);
      const current = await getCmsCustomRecords(tabSlug);
      const updated = current.some((r) => r.id === id)
        ? current.map((r) => (r.id === id ? res.data! : r))
        : [res.data, ...current];
      setInMemCache(key, updated);
      setLocalItem(key, updated, true);
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to save record to database' };
  }

  const current = await getCmsCustomRecords(tabSlug);
  const finalRecord: CustomTabRecord = {
    id,
    tab_slug: tabSlug,
    data: record.data || {},
    created_at: record.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = current.some((r) => r.id === id)
    ? current.map((r) => (r.id === id ? finalRecord : r))
    : [finalRecord, ...current];
  setInMemCache(key, updated);
  setLocalItem(key, updated, true);
  return { success: true, data: finalRecord };
}

export async function deleteCmsCustomRecord(tabSlug: string, recordId: string): Promise<{ success: boolean; error?: string }> {
  const key = `${STORAGE_KEYS.CUSTOM_RECORDS_PREFIX}${tabSlug}`;
  if (typeof window !== 'undefined') {
    const res = await apiRequest<{ success: boolean; error?: string }>(
      `/api/admin/custom-tabs/${encodeURIComponent(tabSlug)}/records/${encodeURIComponent(recordId)}`,
      { method: 'DELETE' }
    );
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to delete record from database' };
    }
  }

  invalidateCmsCache(key);
  const current = await getCmsCustomRecords(tabSlug);
  const updated = current.filter((r) => r.id !== recordId);
  setInMemCache(key, updated);
  setLocalItem(key, updated, true);
  return { success: true };
}

// ==============================================================================
// 13. FILE UPLOADS
// ==============================================================================

export async function uploadCmsFile(
  file: File,
  autoRegisterInMedia: boolean = true
): Promise<{ success: boolean; url?: string; name?: string; type?: 'image' | 'pdf' | 'video'; size?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('autoRegister', autoRegisterInMedia ? 'true' : 'false');

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data?.error || 'Upload failed' };
    }

    if (autoRegisterInMedia) {
      invalidateCmsCache(STORAGE_KEYS.MEDIA_ASSETS);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cms_storage_updated'));
      }
    }

    return {
      success: true,
      url: data.url,
      name: data.name,
      type: data.type,
      size: data.size,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during upload' };
  }
}

