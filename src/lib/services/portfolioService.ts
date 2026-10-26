import {
  Profile,
  Project,
  SkillCategory,
  Certification,
  Experience,
  Education,
  VlogItem,
  SiteSettings
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
import {
  getCmsProfile,
  getCmsProjects,
  getCmsSkills,
  getCmsCertifications,
  getCmsExperience,
  getCmsEducation,
  getCmsVlogs,
  getCmsSiteSettings
} from '@/lib/services/cmsService';

/**
 * Utility to extract clean YouTube embed URL without autoplay
 */
export function formatVideoEmbedUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If already an embed URL, ensure autoplay=0
  if (trimmed.includes('youtube.com/embed/')) {
    const separator = trimmed.includes('?') ? '&' : '?';
    return trimmed.includes('autoplay') ? trimmed : `${trimmed}${separator}autoplay=0`;
  }

  // Handle standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=0&rel=0`;
  }

  return trimmed;
}

/**
 * Validates whether a given URL is safe and valid for external linking
 */
export function isValidExternalUrl(url?: string): boolean {
  if (!url || url.trim() === '') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Fetch profile details
 */
export async function getProfile(): Promise<Profile> {
  if (typeof window === 'undefined') {
    try {
      const { getProfileMongo } = await import('@/lib/mongodb/services/mongoDataService');
      return await getProfileMongo();
    } catch {
      return initialProfile;
    }
  }
  try {
    return await getCmsProfile();
  } catch {
    return initialProfile;
  }
}

/**
 * Fetch published projects strictly (ordered by sort_order)
 * Draft projects are ALWAYS excluded from public view.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  if (typeof window === 'undefined') {
    try {
      const { getProjectsMongo } = await import('@/lib/mongodb/services/mongoDataService');
      const docs = await getProjectsMongo({ publishedOnly: true });
      return docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch {
      return initialProjects.filter((p) => p.status === 'published').sort((a, b) => a.sort_order - b.sort_order);
    }
  }

  try {
    const all = await getCmsProjects();
    const published = all.filter((p) => p.status === 'published');
    return published.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch {
    const published = initialProjects.filter((p) => p.status === 'published');
    return published.sort((a, b) => a.sort_order - b.sort_order);
  }
}

/**
 * Fetch a single published project by its slug
 * Returns null if the project does not exist OR is unpublished/draft.
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (typeof window === 'undefined') {
    try {
      const { getProjectBySlugMongo } = await import('@/lib/mongodb/services/mongoDataService');
      return await getProjectBySlugMongo(slug, { publishedOnly: true });
    } catch {
      const project = initialProjects.find((p) => p.slug === slug);
      if (!project || project.status !== 'published') return null;
      return project;
    }
  }

  try {
    const all = await getCmsProjects();
    const project = all.find((p) => p.slug === slug);
    if (!project || project.status !== 'published') {
      return null;
    }
    return project;
  } catch {
    const project = initialProjects.find((p) => p.slug === slug);
    if (!project || project.status !== 'published') {
      return null;
    }
    return project;
  }
}

/**
 * Fetch related projects for a given project slug
 */
export async function getRelatedProjects(currentProject: Project): Promise<Project[]> {
  const allPublished = await getPublishedProjects();

  // If explicit related slugs are provided
  if (currentProject.related_project_slugs && currentProject.related_project_slugs.length > 0) {
    const related = allPublished.filter(
      (p) => p.slug !== currentProject.slug && currentProject.related_project_slugs?.includes(p.slug)
    );
    if (related.length > 0) return related;
  }

  // Otherwise fallback to same category or other published projects
  return allPublished
    .filter((p) => p.slug !== currentProject.slug)
    .slice(0, 2);
}

/**
 * Fetch skill categories
 */
export async function getSkillCategories(): Promise<SkillCategory[]> {
  if (typeof window === 'undefined') {
    try {
      const { getSkillsMongo } = await import('@/lib/mongodb/services/mongoDataService');
      return await getSkillsMongo();
    } catch {
      return skillCategories;
    }
  }

  try {
    return await getCmsSkills();
  } catch {
    return skillCategories;
  }
}

/**
 * Fetch published certifications
 */
export async function getCertifications(): Promise<Certification[]> {
  if (typeof window === 'undefined') {
    try {
      const { getCertificationsMongo } = await import('@/lib/mongodb/services/mongoDataService');
      const docs = await getCertificationsMongo();
      return docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch {
      return initialCertifications;
    }
  }

  try {
    return await getCmsCertifications();
  } catch {
    return initialCertifications;
  }
}

/**
 * Fetch published experience records
 */
export async function getExperience(): Promise<Experience[]> {
  if (typeof window === 'undefined') {
    try {
      const { getExperienceMongo } = await import('@/lib/mongodb/services/mongoDataService');
      const docs = await getExperienceMongo();
      return docs.filter((e) => !e.status || e.status === 'published');
    } catch {
      return initialExperience.filter((e) => !e.status || e.status === 'published');
    }
  }

  try {
    const all = await getCmsExperience();
    return all.filter((e) => !e.status || e.status === 'published');
  } catch {
    return initialExperience.filter((e) => !e.status || e.status === 'published');
  }
}

/**
 * Fetch education records
 */
export async function getEducation(): Promise<Education[]> {
  if (typeof window === 'undefined') {
    try {
      const { getEducationMongo } = await import('@/lib/mongodb/services/mongoDataService');
      return await getEducationMongo();
    } catch {
      return initialEducation;
    }
  }

  try {
    return await getCmsEducation();
  } catch {
    return initialEducation;
  }
}

/**
 * Fetch published vlogs strictly (ordered by sort_order)
 */
export async function getPublishedVlogs(): Promise<VlogItem[]> {
  if (typeof window === 'undefined') {
    try {
      const { getVlogsMongo } = await import('@/lib/mongodb/services/mongoDataService');
      return await getVlogsMongo({ publishedOnly: true });
    } catch {
      const published = initialVlogs.filter((v) => v.status === 'published');
      return published.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
  }

  try {
    const all = await getCmsVlogs();
    const published = all.filter((v) => v.status === 'published');
    return published.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch {
    const published = initialVlogs.filter((v) => v.status === 'published');
    return published.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }
}

/**
 * Fetch site settings
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (typeof window === 'undefined') {
    try {
      const { getSiteSettingsMongo } = await import('@/lib/mongodb/services/mongoDataService');
      return await getSiteSettingsMongo();
    } catch {
      return initialSiteSettings;
    }
  }

  try {
    return await getCmsSiteSettings();
  } catch {
    return initialSiteSettings;
  }
}
