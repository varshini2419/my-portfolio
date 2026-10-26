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

export interface VideoInfo {
  type: 'direct' | 'youtube' | 'linkedin' | 'instagram' | 'vimeo' | 'loom' | 'googledrive' | 'iframe' | 'unsupported';
  embedUrl: string;
  externalUrl: string;
  canEmbed: boolean;
  platformLabel: string;
}

/**
 * Robust video URL parser supporting YouTube, LinkedIn, Instagram Reels,
 * Loom, Vimeo, Google Drive, and direct uploaded video files.
 */
export function parseVideoUrl(url?: string): VideoInfo {
  if (!url || !url.trim()) {
    return {
      type: 'unsupported',
      embedUrl: '',
      externalUrl: '',
      canEmbed: false,
      platformLabel: 'Video',
    };
  }

  const trimmed = url.trim();

  // 1. Direct Video files (uploaded or static mp4/webm/mov/ogg)
  if (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed) ||
    trimmed.includes('/api/uploads/') ||
    trimmed.includes('/uploads/') ||
    trimmed.startsWith('data:video/')
  ) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      externalUrl: trimmed,
      canEmbed: true,
      platformLabel: 'Direct Video File',
    };
  }

  // 2. YouTube (standard watch, youtu.be, embed, shorts)
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    const watchMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const videoId = watchMatch?.[1];
    return {
      type: 'youtube',
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : trimmed,
      externalUrl: trimmed,
      canEmbed: Boolean(videoId),
      platformLabel: 'YouTube',
    };
  }

  // 3. Instagram Reels & Posts
  if (trimmed.includes('instagram.com')) {
    const instaMatch = trimmed.match(/instagram\.com\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/);
    const instaId = instaMatch?.[1];
    const isReel = trimmed.includes('/reel') || trimmed.includes('/reels');
    const cleanEmbed = instaId ? `https://www.instagram.com/${isReel ? 'reel' : 'p'}/${instaId}/embed` : trimmed;
    return {
      type: 'instagram',
      embedUrl: cleanEmbed,
      externalUrl: trimmed,
      canEmbed: Boolean(instaId),
      platformLabel: isReel ? 'Instagram Reel' : 'Instagram Video',
    };
  }

  // 4. LinkedIn Posts & Videos (including shortened lnkd.in links)
  if (trimmed.includes('linkedin.com') || trimmed.includes('lnkd.in')) {
    if (trimmed.includes('linkedin.com/embed/')) {
      return {
        type: 'linkedin',
        embedUrl: trimmed,
        externalUrl: trimmed,
        canEmbed: true,
        platformLabel: 'LinkedIn Video',
      };
    }

    // Direct or URL-encoded URN (e.g. highlightedUpdateUrn=urn%3Ali%3Aactivity%3A... or urn:li:activity:...)
    const decodedUrl = decodeURIComponent(trimmed);
    const urnMatch = decodedUrl.match(/urn:li:(activity|ugcPost|share):([0-9]+)/i);
    if (urnMatch) {
      return {
        type: 'linkedin',
        embedUrl: `https://www.linkedin.com/embed/feed/update/urn:li:${urnMatch[1].toLowerCase() === 'ugcpost' ? 'ugcPost' : urnMatch[1]}:${urnMatch[2]}`,
        externalUrl: trimmed,
        canEmbed: true,
        platformLabel: 'LinkedIn Video',
      };
    }

    // Slug with activity-{id}
    const activityMatch = trimmed.match(/activity-([0-9]+)/i);
    if (activityMatch) {
      return {
        type: 'linkedin',
        embedUrl: `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityMatch[1]}`,
        externalUrl: trimmed,
        canEmbed: true,
        platformLabel: 'LinkedIn Video',
      };
    }

    // Slug with ugcPost-{id}
    const ugcMatch = trimmed.match(/ugcPost-([0-9]+)/i);
    if (ugcMatch) {
      return {
        type: 'linkedin',
        embedUrl: `https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:${ugcMatch[1]}`,
        externalUrl: trimmed,
        canEmbed: true,
        platformLabel: 'LinkedIn Video',
      };
    }

    // Shortened lnkd.in or generic LinkedIn post without extractable ID:
    // Do NOT embed in iframe (which causes browser sad-document error). Render branded fallback card instead.
    return {
      type: 'linkedin',
      embedUrl: '',
      externalUrl: trimmed,
      canEmbed: false,
      platformLabel: 'LinkedIn Video',
    };
  }

  // 5. Loom
  if (trimmed.includes('loom.com')) {
    const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    const loomId = loomMatch?.[1];
    return {
      type: 'loom',
      embedUrl: loomId ? `https://www.loom.com/embed/${loomId}` : trimmed,
      externalUrl: trimmed,
      canEmbed: Boolean(loomId),
      platformLabel: 'Loom',
    };
  }

  // 6. Vimeo
  if (trimmed.includes('vimeo.com')) {
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    const vimeoId = vimeoMatch?.[1];
    return {
      type: 'vimeo',
      embedUrl: vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : trimmed,
      externalUrl: trimmed,
      canEmbed: Boolean(vimeoId),
      platformLabel: 'Vimeo',
    };
  }

  // 7. Google Drive
  if (trimmed.includes('drive.google.com')) {
    const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = driveMatch?.[1];
    return {
      type: 'googledrive',
      embedUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : trimmed,
      externalUrl: trimmed,
      canEmbed: Boolean(fileId),
      platformLabel: 'Google Drive',
    };
  }

  return {
    type: 'iframe',
    embedUrl: trimmed,
    externalUrl: trimmed,
    canEmbed: true,
    platformLabel: 'Video',
  };
}

/**
 * Utility to extract clean video embed URL
 */
export function formatVideoEmbedUrl(url?: string): string {
  const info = parseVideoUrl(url);
  return info.embedUrl;
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
