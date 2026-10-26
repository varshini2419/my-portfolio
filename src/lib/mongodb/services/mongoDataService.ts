import { getDatabase, isMongoConfigured, getLastMongoError } from '@/lib/mongodb/client';
import { COLLECTIONS, initMongoIndexes } from '@/lib/mongodb/collections';
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
  ActivityLog,
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
import {
  ContentBlock,
  MediaAsset,
  ContactLinkSettings,
  initialContentBlocks,
  initialMediaAssets,
  initialContactLinks
} from '@/lib/services/cmsService';

// ==============================================================================
// 1. PROJECTS COLLECTION OPERATIONS
// ==============================================================================

export async function getProjectsMongo(options?: { publishedOnly?: boolean }): Promise<Project[]> {
  const db = await getDatabase();
  if (!db) return [];

  try {
    const query = options?.publishedOnly ? { status: 'published' } : {};
    const docs = await db
      .collection(COLLECTIONS.PROJECTS)
      .find(query)
      .sort({ sort_order: 1, _id: 1 })
      .toArray();

    if (!docs || docs.length === 0) {
      return [];
    }

    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: rest.id || _id.toString(),
      } as Project;
    });
  } catch (err) {
    console.error('Error fetching projects from MongoDB:', err);
    return [];
  }
}

export async function getProjectBySlugMongo(slug: string, options?: { publishedOnly?: boolean }): Promise<Project | null> {
  const db = await getDatabase();
  if (!db) {
    const fallback = initialProjects.find((p) => p.slug === slug);
    if (!fallback || (options?.publishedOnly && fallback.status !== 'published')) return null;
    return fallback;
  }

  try {
    const query: Record<string, any> = { slug: slug.trim() };
    if (options?.publishedOnly) {
      query.status = 'published';
    }

    const doc = await db.collection(COLLECTIONS.PROJECTS).findOne(query);
    if (!doc) return null;

    const { _id, ...rest } = doc;
    return {
      ...rest,
      id: rest.id || _id.toString(),
    } as Project;
  } catch (err) {
    console.error(`Error querying project by slug "${slug}" from MongoDB:`, err);
    const fallback = initialProjects.find((p) => p.slug === slug);
    if (!fallback || (options?.publishedOnly && fallback.status !== 'published')) return null;
    return fallback;
  }
}

export async function saveProjectMongo(project: Partial<Project>): Promise<{ success: boolean; data?: Project; error?: string }> {
  const db = await getDatabase();
  if (!db) {
    return { success: false, error: 'MongoDB Atlas is not configured. Please set MONGODB_URI.' };
  }

  try {
    // Generate slug from title if missing
    const generatedSlug = (project.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const slug = (project.slug || generatedSlug || 'untitled-project').trim();
    const id = project.id || `proj-${Date.now()}`;

    // Duplicate slug check: ensure another project doesn't already own this slug
    const duplicate = await db.collection(COLLECTIONS.PROJECTS).findOne({
      slug,
      id: { $ne: id }
    });

    if (duplicate) {
      return {
        success: false,
        error: `A project with the slug "${slug}" already exists. Please choose a unique title or slug.`
      };
    }

    const processedDemoVideos = await Promise.all(
      (project.demo_videos || []).map(async (v) => {
        let url = (v.url || '').trim();
        if (url && (url.includes('lnkd.in') || url.includes('bit.ly') || url.includes('t.co'))) {
          try {
            const resp = await fetch(url, {
              method: 'HEAD',
              redirect: 'manual',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            });
            const loc = resp.headers.get('location');
            if (loc) {
              url = new URL(loc, url).href;
            }
          } catch {
            // Keep original if unreachable
          }
        }
        return { ...v, url };
      })
    );

    const recordToSave: Project = {
      id,
      slug,
      title: project.title?.trim() || 'Untitled Project',
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
      demo_videos: processedDemoVideos,
      tags: project.tags || [],
      category: project.category || 'Data Analytics',
      featured: Boolean(project.featured),
      sort_order: Number(project.sort_order) || 1,
      status: project.status || 'draft',
      screenshots: project.screenshots || [],
      related_project_slugs: project.related_project_slugs || [],
      updated_at: new Date().toISOString()
    };

    await db.collection(COLLECTIONS.PROJECTS).updateOne(
      { id },
      { $set: recordToSave },
      { upsert: true }
    );

    return { success: true, data: recordToSave };
  } catch (err: unknown) {
    console.error('Error saving project to MongoDB Atlas:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Database write error' };
  }
}

export async function deleteProjectMongo(id: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const res = await db.collection(COLLECTIONS.PROJECTS).deleteOne({ id });
    return { success: res.acknowledged };
  } catch (err) {
    return { success: false, error: 'Failed to delete project document' };
  }
}

export async function toggleProjectStatusMongo(id: string, status: 'draft' | 'published'): Promise<{ success: boolean }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    const res = await db.collection(COLLECTIONS.PROJECTS).updateOne(
      { id },
      { $set: { status, updated_at: new Date().toISOString() } }
    );
    return { success: res.acknowledged };
  } catch (err) {
    return { success: false };
  }
}

// ==============================================================================
// 2. PROFILE COLLECTION OPERATIONS
// ==============================================================================

export async function getProfileMongo(): Promise<Profile> {
  const db = await getDatabase();
  if (!db) return emptyProfile;

  try {
    const doc = await db.collection(COLLECTIONS.PROFILES).findOne({ id: 'profile-main' });
    if (!doc) {
      return emptyProfile;
    }
    const { _id, ...rest } = doc;
    return rest as Profile;
  } catch (err) {
    console.error('Error fetching profile from MongoDB Atlas:', err);
    return emptyProfile;
  }
}

export async function saveProfileMongo(updated: Partial<Profile>): Promise<{ success: boolean; data?: Profile; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    const current = await getProfileMongo();
    const merged: Profile = {
      ...current,
      ...updated,
      id: 'profile-main',
      updated_at: new Date().toISOString()
    };

    await db.collection(COLLECTIONS.PROFILES).updateOne(
      { id: 'profile-main' },
      { $set: merged },
      { upsert: true }
    );

    return { success: true, data: merged };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
  }
}

// ==============================================================================
// 3. EDUCATION COLLECTION OPERATIONS
// ==============================================================================

export async function getEducationMongo(): Promise<Education[]> {
  const db = await getDatabase();
  if (!db) return [];

  try {
    const docs = await db.collection(COLLECTIONS.EDUCATION).find({}).sort({ sort_order: 1 }).toArray();
    if (!docs || docs.length === 0) {
      return [];
    }
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as Education;
    });
  } catch (err) {
    return [];
  }
}

export async function saveEducationMongo(edu: Partial<Education>): Promise<{ success: boolean; data?: Education; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    const id = edu.id || `edu-${Date.now()}`;
    const record: Education = {
      id,
      institution: edu.institution?.trim() || '',
      degree: edu.degree?.trim() || '',
      field_of_study: edu.field_of_study?.trim() || '',
      start_year: edu.start_year || '',
      end_year: edu.end_year || '',
      grade_or_status: edu.grade_or_status || '',
      highlights: edu.highlights || [],
      sort_order: edu.sort_order || 1
    };

    await db.collection(COLLECTIONS.EDUCATION).updateOne(
      { id },
      { $set: record },
      { upsert: true }
    );

    return { success: true, data: record };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save education record' };
  }
}

export async function deleteEducationMongo(id: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    await db.collection(COLLECTIONS.EDUCATION).deleteOne({ id });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete education record' };
  }
}

// ==============================================================================
// 4. SKILLS COLLECTION OPERATIONS
// ==============================================================================

export async function getSkillsMongo(): Promise<SkillCategory[]> {
  const db = await getDatabase();
  if (!db) return [];

  try {
    const docs = await db.collection(COLLECTIONS.SKILLS).find({}).toArray();
    if (!docs || docs.length === 0) {
      return [];
    }
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as SkillCategory;
    });
  } catch (err) {
    return [];
  }
}

export async function saveSkillCategoryMongo(category: SkillCategory): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    await db.collection(COLLECTIONS.SKILLS).updateOne(
      { name: category.name },
      { $set: category },
      { upsert: true }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save skill category' };
  }
}

export async function addSkillMongo(categoryName: string, skill: SkillItem): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    await db.collection(COLLECTIONS.SKILLS).updateOne(
      { name: categoryName },
      { $push: { skills: skill } as any },
      { upsert: true }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add skill' };
  }
}

export async function deleteSkillMongo(categoryName: string, skillName: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    await db.collection(COLLECTIONS.SKILLS).updateOne(
      { name: categoryName },
      { $pull: { skills: { name: skillName } } as any }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete skill' };
  }
}

// ==============================================================================
// 5. CERTIFICATIONS COLLECTION OPERATIONS
// ==============================================================================

export async function getCertificationsMongo(): Promise<Certification[]> {
  const db = await getDatabase();
  if (!db) return [];

  try {
    const docs = await db.collection(COLLECTIONS.CERTIFICATIONS).find({}).sort({ sort_order: 1 }).toArray();
    if (!docs || docs.length === 0) {
      return [];
    }
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as Certification;
    });
  } catch {
    return [];
  }
}

export async function saveCertificationMongo(cert: Partial<Certification>): Promise<{ success: boolean; data?: Certification; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    const id = cert.id || `cert-${Date.now()}`;
    const record: Certification = {
      id,
      title: cert.title?.trim() || '',
      issuer: cert.issuer?.trim() || '',
      issue_date: cert.issue_date || '',
      credential_url: cert.credential_url || '',
      certificate_image_url: cert.certificate_image_url || '',
      is_ongoing: Boolean(cert.is_ongoing),
      skills_covered: cert.skills_covered || [],
      status: cert.status || 'completed',
      sort_order: cert.sort_order || 1
    };

    await db.collection(COLLECTIONS.CERTIFICATIONS).updateOne(
      { id },
      { $set: record },
      { upsert: true }
    );

    return { success: true, data: record };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save certification' };
  }
}

export async function deleteCertificationMongo(id: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    await db.collection(COLLECTIONS.CERTIFICATIONS).deleteOne({ id });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete certification' };
  }
}

// ==============================================================================
// 6. EXPERIENCE COLLECTION OPERATIONS
// ==============================================================================

export async function getExperienceMongo(): Promise<Experience[]> {
  const db = await getDatabase();
  if (!db) return [];

  try {
    const docs = await db.collection(COLLECTIONS.EXPERIENCE).find({}).sort({ sort_order: 1 }).toArray();
    if (!docs || docs.length === 0) {
      return [];
    }
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as Experience;
    });
  } catch {
    return [];
  }
}

export async function saveExperienceMongo(exp: Partial<Experience>): Promise<{ success: boolean; data?: Experience; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    const id = exp.id || `exp-${Date.now()}`;
    const record: Experience = {
      id,
      organization: exp.organization?.trim() || '',
      role: exp.role?.trim() || '',
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
      sort_order: exp.sort_order || 1
    };

    await db.collection(COLLECTIONS.EXPERIENCE).updateOne(
      { id },
      { $set: record },
      { upsert: true }
    );

    return { success: true, data: record };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save experience' };
  }
}

export async function deleteExperienceMongo(id: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDatabase({ force: true });
  if (!db) return { success: false, error: getLastMongoError() || 'MongoDB Atlas is not connected' };

  try {
    await db.collection(COLLECTIONS.EXPERIENCE).deleteOne({ id });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete experience' };
  }
}

// ==============================================================================
// 7. VLOGS COLLECTION OPERATIONS
// ==============================================================================

export async function getVlogsMongo(options?: { publishedOnly?: boolean }): Promise<VlogItem[]> {
  const db = await getDatabase();
  if (!db) return initialVlogs.filter((v) => !options?.publishedOnly || v.status === 'published');

  try {
    const query = options?.publishedOnly ? { status: 'published' } : {};
    const docs = await db.collection(COLLECTIONS.VLOGS).find(query).sort({ sort_order: 1 }).toArray();
    if (!docs || docs.length === 0) {
      return initialVlogs.filter((v) => !options?.publishedOnly || v.status === 'published');
    }
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as VlogItem;
    });
  } catch {
    return initialVlogs.filter((v) => !options?.publishedOnly || v.status === 'published');
  }
}

export async function saveVlogMongo(vlog: Partial<VlogItem>): Promise<{ success: boolean; data?: VlogItem }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    const id = vlog.id || `vlog-${Date.now()}`;
    const record: VlogItem = {
      id,
      title: vlog.title?.trim() || 'Untitled Vlog',
      description: vlog.description || '',
      thumbnail_url: vlog.thumbnail_url || '',
      video_url: vlog.video_url || '',
      video_source: vlog.video_source || 'youtube',
      category: vlog.category || 'College Days',
      published_date: vlog.published_date || '2025',
      status: vlog.status || 'draft',
      duration: vlog.duration || '3:30',
      sort_order: vlog.sort_order || 1
    };

    await db.collection(COLLECTIONS.VLOGS).updateOne(
      { id },
      { $set: record },
      { upsert: true }
    );

    return { success: true, data: record };
  } catch {
    return { success: false };
  }
}

export async function deleteVlogMongo(id: string): Promise<{ success: boolean }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    await db.collection(COLLECTIONS.VLOGS).deleteOne({ id });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ==============================================================================
// 8. CONTENT BLOCKS COLLECTION OPERATIONS
// ==============================================================================

export async function getContentBlocksMongo(): Promise<ContentBlock[]> {
  const db = await getDatabase();
  if (!db) return initialContentBlocks;

  try {
    const docs = await db.collection(COLLECTIONS.CONTENT_BLOCKS).find({}).sort({ display_order: 1 }).toArray();
    if (!docs || docs.length === 0) {
      return initialContentBlocks;
    }
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as ContentBlock;
    });
  } catch {
    return initialContentBlocks;
  }
}

export async function saveContentBlockMongo(block: Partial<ContentBlock>): Promise<{ success: boolean; data?: ContentBlock }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    const key = (block.key || `block_${Date.now()}`).trim().toLowerCase().replace(/\s+/g, '_');
    const record: ContentBlock = {
      key,
      title: block.title?.trim() || 'Untitled Block',
      block_type: block.block_type || 'highlight',
      content: block.content || '',
      media_url: block.media_url,
      link_url: block.link_url,
      link_label: block.link_label,
      display_order: block.display_order || 1,
      is_published: block.is_published !== false
    };

    await db.collection(COLLECTIONS.CONTENT_BLOCKS).updateOne(
      { key },
      { $set: record },
      { upsert: true }
    );

    return { success: true, data: record };
  } catch {
    return { success: false };
  }
}

export async function deleteContentBlockMongo(key: string): Promise<{ success: boolean }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    await db.collection(COLLECTIONS.CONTENT_BLOCKS).deleteOne({ key });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ==============================================================================
// 9. MEDIA ASSETS COLLECTION OPERATIONS
// ==============================================================================

export async function getMediaAssetsMongo(): Promise<MediaAsset[]> {
  const db = await getDatabase();
  if (!db) return initialMediaAssets;

  try {
    const docs = await db.collection(COLLECTIONS.MEDIA).find({}).sort({ uploaded_at: -1 }).toArray();
    if (!docs || docs.length === 0) {
      return initialMediaAssets;
    }
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as MediaAsset;
    });
  } catch {
    return initialMediaAssets;
  }
}

export async function saveMediaAssetMongo(asset: Partial<MediaAsset>): Promise<{ success: boolean; data?: MediaAsset }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    const id = asset.id || `media-${Date.now()}`;
    const record: MediaAsset = {
      id,
      name: asset.name?.trim() || 'unnamed-asset',
      url: asset.url || '',
      type: asset.type || 'image',
      size: asset.size || '250 KB',
      uploaded_at: new Date().toISOString().split('T')[0]
    };

    await db.collection(COLLECTIONS.MEDIA).updateOne(
      { id },
      { $set: record },
      { upsert: true }
    );

    return { success: true, data: record };
  } catch {
    return { success: false };
  }
}

export async function deleteMediaAssetMongo(id: string): Promise<{ success: boolean }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    await db.collection(COLLECTIONS.MEDIA).deleteOne({ id });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ==============================================================================
// 10. SITE SETTINGS & CONTACT LINKS
// ==============================================================================

export async function getSiteSettingsMongo(): Promise<SiteSettings> {
  const db = await getDatabase();
  if (!db) return initialSiteSettings;

  try {
    const doc = await db.collection(COLLECTIONS.SITE_SETTINGS).findOne({ id: 'site-config' });
    if (!doc) return initialSiteSettings;
    const { _id, ...rest } = doc;
    return rest as SiteSettings;
  } catch {
    return initialSiteSettings;
  }
}

export async function saveSiteSettingsMongo(settings: Partial<SiteSettings>): Promise<{ success: boolean; data?: SiteSettings }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    const current = await getSiteSettingsMongo();
    const merged = { ...current, ...settings, id: 'site-config' };
    await db.collection(COLLECTIONS.SITE_SETTINGS).updateOne(
      { id: 'site-config' },
      { $set: merged },
      { upsert: true }
    );
    return { success: true, data: merged };
  } catch {
    return { success: false };
  }
}

export async function getContactLinksMongo(): Promise<ContactLinkSettings> {
  const db = await getDatabase();
  if (!db) return initialContactLinks;

  try {
    const doc = await db.collection(COLLECTIONS.SITE_SETTINGS).findOne({ id: 'contact-links' });
    if (!doc) return initialContactLinks;
    const { _id, ...rest } = doc;
    return rest as ContactLinkSettings;
  } catch {
    return initialContactLinks;
  }
}

export async function saveContactLinksMongo(links: Partial<ContactLinkSettings>): Promise<{ success: boolean; data?: ContactLinkSettings }> {
  const db = await getDatabase();
  if (!db) return { success: false };

  try {
    const current = await getContactLinksMongo();
    const merged = { ...current, ...links, id: 'contact-links' };
    await db.collection(COLLECTIONS.SITE_SETTINGS).updateOne(
      { id: 'contact-links' },
      { $set: merged },
      { upsert: true }
    );
    return { success: true, data: merged };
  } catch {
    return { success: false };
  }
}

// ==============================================================================
// 11. AUTOMATIC SEEDING & INDEXING HELPER
// ==============================================================================

export async function seedInitialMongoData(force = false): Promise<{ success: boolean; seeded: Record<string, number> }> {
  const db = await getDatabase();
  if (!db) return { success: false, seeded: {} };

  const seeded: Record<string, number> = {};

  try {
    // Ensure all indexes exist
    await initMongoIndexes(db);

    // 1. Projects
    const projectsCount = await db.collection(COLLECTIONS.PROJECTS).countDocuments();
    if (projectsCount === 0 || force) {
      if (force) await db.collection(COLLECTIONS.PROJECTS).deleteMany({});
      await db.collection(COLLECTIONS.PROJECTS).insertMany(initialProjects.map(p => ({ ...p })));
      seeded.projects = initialProjects.length;
    }

    // 2. Profile
    const profileCount = await db.collection(COLLECTIONS.PROFILES).countDocuments();
    if (profileCount === 0 || force) {
      await db.collection(COLLECTIONS.PROFILES).updateOne(
        { id: 'profile-main' },
        { $set: { ...initialProfile, id: 'profile-main' } },
        { upsert: true }
      );
      seeded.profile = 1;
    }

    // 3. Education
    const eduCount = await db.collection(COLLECTIONS.EDUCATION).countDocuments();
    if (eduCount === 0 || force) {
      if (force) await db.collection(COLLECTIONS.EDUCATION).deleteMany({});
      await db.collection(COLLECTIONS.EDUCATION).insertMany(initialEducation.map(e => ({ ...e })));
      seeded.education = initialEducation.length;
    }

    // 4. Skills
    const skillsCount = await db.collection(COLLECTIONS.SKILLS).countDocuments();
    if (skillsCount === 0 || force) {
      if (force) await db.collection(COLLECTIONS.SKILLS).deleteMany({});
      await db.collection(COLLECTIONS.SKILLS).insertMany(skillCategories.map(s => ({ ...s })));
      seeded.skills = skillCategories.length;
    }

    // 5. Certifications
    const certCount = await db.collection(COLLECTIONS.CERTIFICATIONS).countDocuments();
    if (certCount === 0 || force) {
      if (force) await db.collection(COLLECTIONS.CERTIFICATIONS).deleteMany({});
      await db.collection(COLLECTIONS.CERTIFICATIONS).insertMany(initialCertifications.map(c => ({ ...c })));
      seeded.certifications = initialCertifications.length;
    }

    // 6. Experience
    const expCount = await db.collection(COLLECTIONS.EXPERIENCE).countDocuments();
    if (expCount === 0 || force) {
      if (force) await db.collection(COLLECTIONS.EXPERIENCE).deleteMany({});
      await db.collection(COLLECTIONS.EXPERIENCE).insertMany(initialExperience.map(e => ({ ...e })));
      seeded.experience = initialExperience.length;
    }

    // 7. Vlogs
    const vlogsCount = await db.collection(COLLECTIONS.VLOGS).countDocuments();
    if (vlogsCount === 0 || force) {
      if (force) await db.collection(COLLECTIONS.VLOGS).deleteMany({});
      await db.collection(COLLECTIONS.VLOGS).insertMany(initialVlogs.map(v => ({ ...v })));
      seeded.vlogs = initialVlogs.length;
    }

    // 8. Content Blocks
    const blocksCount = await db.collection(COLLECTIONS.CONTENT_BLOCKS).countDocuments();
    if (blocksCount === 0 || force) {
      if (force) await db.collection(COLLECTIONS.CONTENT_BLOCKS).deleteMany({});
      await db.collection(COLLECTIONS.CONTENT_BLOCKS).insertMany(initialContentBlocks.map(b => ({ ...b })));
      seeded.contentBlocks = initialContentBlocks.length;
    }

    // 9. Media Assets
    const mediaCount = await db.collection(COLLECTIONS.MEDIA).countDocuments();
    if (mediaCount === 0 || force) {
      if (force) await db.collection(COLLECTIONS.MEDIA).deleteMany({});
      await db.collection(COLLECTIONS.MEDIA).insertMany(initialMediaAssets.map(m => ({ ...m })));
      seeded.media = initialMediaAssets.length;
    }

    // 10. Site Settings & Contact Links
    await db.collection(COLLECTIONS.SITE_SETTINGS).updateOne(
      { id: 'site-config' },
      { $set: { ...initialSiteSettings, id: 'site-config' } },
      { upsert: true }
    );
    await db.collection(COLLECTIONS.SITE_SETTINGS).updateOne(
      { id: 'contact-links' },
      { $set: { ...initialContactLinks, id: 'contact-links' } },
      { upsert: true }
    );
    seeded.siteSettings = 2;

    return { success: true, seeded };
  } catch (err) {
    console.error('Error during MongoDB Atlas seeding:', err);
    return { success: false, seeded };
  }
}

// ==============================================================================
// 12. ACTIVITY LOGS OPERATIONS
// ==============================================================================

// In-memory fallback for activity logs during offline preview
const globalActivities = global as typeof globalThis & {
  _inMemoryActivities?: ActivityLog[];
};
if (!globalActivities._inMemoryActivities) {
  globalActivities._inMemoryActivities = [];
}

export async function getActivityLogsMongo(limit = 50): Promise<ActivityLog[]> {
  const db = await getDatabase();
  const memoryLogs = globalActivities._inMemoryActivities || [];
  if (!db) {
    return memoryLogs.slice(0, limit);
  }

  try {
    const docs = await db.collection(COLLECTIONS.ACTIVITIES)
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    if (!docs || docs.length === 0) {
      return memoryLogs.slice(0, limit);
    }

    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as ActivityLog;
    });
  } catch {
    return memoryLogs.slice(0, limit);
  }
}

export async function saveActivityLogMongo(activity: Omit<ActivityLog, 'id'>): Promise<{ success: boolean; data?: ActivityLog }> {
  const record: ActivityLog = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  if (!globalActivities._inMemoryActivities) {
    globalActivities._inMemoryActivities = [];
  }
  globalActivities._inMemoryActivities.unshift(record);
  if (globalActivities._inMemoryActivities.length > 100) {
    globalActivities._inMemoryActivities = globalActivities._inMemoryActivities.slice(0, 100);
  }

  const db = await getDatabase();
  if (!db) return { success: true, data: record };

  try {
    await db.collection(COLLECTIONS.ACTIVITIES).insertOne({ ...record });
    return { success: true, data: record };
  } catch {
    return { success: true, data: record };
  }
}

export async function clearActivityLogsMongo(): Promise<{ success: boolean }> {
  globalActivities._inMemoryActivities = [];
  const db = await getDatabase();
  if (!db) return { success: true };

  try {
    await db.collection(COLLECTIONS.ACTIVITIES).deleteMany({});
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ==============================================================================
// 13. DYNAMIC CUSTOM MANAGEMENT TABS OPERATIONS
// ==============================================================================

// In-memory fallback for custom tabs during development
const globalCustomStore = global as typeof globalThis & {
  _customTabs?: CustomTabConfig[];
  _customRecords?: CustomTabRecord[];
};
if (!globalCustomStore._customTabs) globalCustomStore._customTabs = [];
if (!globalCustomStore._customRecords) globalCustomStore._customRecords = [];

export async function getCustomTabsMongo(includeArchived = false): Promise<CustomTabConfig[]> {
  const db = await getDatabase();
  const memTabs = globalCustomStore._customTabs || [];
  if (!db) {
    return (includeArchived ? memTabs : memTabs.filter((t) => !t.is_archived)).sort((a, b) => a.order - b.order);
  }

  try {
    const query = includeArchived ? {} : { is_archived: { $ne: true } };
    const docs = await db.collection(COLLECTIONS.CUSTOM_TABS).find(query).sort({ order: 1, created_at: 1 }).toArray();
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as CustomTabConfig;
    });
  } catch {
    return (includeArchived ? memTabs : memTabs.filter((t) => !t.is_archived)).sort((a, b) => a.order - b.order);
  }
}

export async function getCustomTabBySlugMongo(slug: string): Promise<CustomTabConfig | null> {
  const db = await getDatabase();
  const memTabs = globalCustomStore._customTabs || [];
  if (!db) {
    return memTabs.find((t) => t.slug === slug.trim()) || null;
  }

  try {
    const doc = await db.collection(COLLECTIONS.CUSTOM_TABS).findOne({ slug: slug.trim() });
    if (!doc) {
      return memTabs.find((t) => t.slug === slug.trim()) || null;
    }
    const { _id, ...rest } = doc;
    return rest as CustomTabConfig;
  } catch {
    return memTabs.find((t) => t.slug === slug.trim()) || null;
  }
}

export async function saveCustomTabMongo(tab: Partial<CustomTabConfig>): Promise<{ success: boolean; data?: CustomTabConfig; error?: string }> {
  const slug = (
    tab.slug ||
    (tab.name || 'custom-tab')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  ).trim();

  const id = tab.id || `tab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const currentTabs = await getCustomTabsMongo(true);
  const duplicate = currentTabs.find((t) => t.slug === slug && t.id !== id);
  if (duplicate) {
    return { success: false, error: `A management tab with slug "${slug}" already exists. Please choose a unique name.` };
  }

  const record: CustomTabConfig = {
    id,
    name: tab.name?.trim() || 'Untitled Tab',
    slug,
    description: tab.description?.trim() || '',
    icon: tab.icon || 'Folder',
    singular_name: tab.singular_name?.trim() || 'Item',
    plural_name: tab.plural_name?.trim() || 'Items',
    fields: tab.fields || [],
    order: tab.order !== undefined ? Number(tab.order) : currentTabs.length + 1,
    is_archived: Boolean(tab.is_archived),
    created_at: tab.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Update in-memory fallback
  if (!globalCustomStore._customTabs) globalCustomStore._customTabs = [];
  const idx = globalCustomStore._customTabs.findIndex((t) => t.slug === slug || t.id === id);
  if (idx >= 0) {
    globalCustomStore._customTabs[idx] = record;
  } else {
    globalCustomStore._customTabs.push(record);
  }

  const db = await getDatabase();
  if (!db) return { success: true, data: record };

  try {
    await db.collection(COLLECTIONS.CUSTOM_TABS).updateOne(
      { slug },
      { $set: record },
      { upsert: true }
    );
    return { success: true, data: record };
  } catch (err: unknown) {
    return { success: true, data: record }; // Return success with in-memory record on write error
  }
}

export async function deleteCustomTabMongo(slug: string): Promise<{ success: boolean; error?: string }> {
  if (globalCustomStore._customTabs) {
    globalCustomStore._customTabs = globalCustomStore._customTabs.filter((t) => t.slug !== slug);
  }
  if (globalCustomStore._customRecords) {
    globalCustomStore._customRecords = globalCustomStore._customRecords.filter((r) => r.tab_slug !== slug);
  }

  const db = await getDatabase();
  if (!db) return { success: true };

  try {
    await db.collection(COLLECTIONS.CUSTOM_TABS).deleteOne({ slug });
    await db.collection(COLLECTIONS.CUSTOM_RECORDS).deleteMany({ tab_slug: slug });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete tab' };
  }
}

export async function reorderCustomTabsMongo(orderedSlugs: string[]): Promise<{ success: boolean }> {
  if (globalCustomStore._customTabs) {
    orderedSlugs.forEach((slug, idx) => {
      const tab = globalCustomStore._customTabs?.find((t) => t.slug === slug);
      if (tab) tab.order = idx + 1;
    });
  }

  const db = await getDatabase();
  if (!db) return { success: true };

  try {
    const bulkOps = orderedSlugs.map((slug, idx) => ({
      updateOne: {
        filter: { slug },
        update: { $set: { order: idx + 1, updated_at: new Date().toISOString() } }
      }
    }));

    if (bulkOps.length > 0) {
      await db.collection(COLLECTIONS.CUSTOM_TABS).bulkWrite(bulkOps);
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ==============================================================================
// 14. DYNAMIC CUSTOM TAB RECORDS OPERATIONS
// ==============================================================================

export async function getCustomRecordsMongo(tabSlug: string): Promise<CustomTabRecord[]> {
  const db = await getDatabase();
  const memRecords = (globalCustomStore._customRecords || []).filter((r) => r.tab_slug === tabSlug.trim());
  if (!db) return memRecords;

  try {
    const docs = await db.collection(COLLECTIONS.CUSTOM_RECORDS)
      .find({ tab_slug: tabSlug.trim() })
      .sort({ created_at: -1 })
      .toArray();

    if (!docs || docs.length === 0) {
      return memRecords;
    }

    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as CustomTabRecord;
    });
  } catch {
    return memRecords;
  }
}

export async function saveCustomRecordMongo(
  tabSlug: string,
  record: Partial<CustomTabRecord>
): Promise<{ success: boolean; data?: CustomTabRecord; error?: string }> {
  const id = record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const recordToSave: CustomTabRecord = {
    id,
    tab_slug: tabSlug.trim(),
    data: record.data || {},
    created_at: record.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!globalCustomStore._customRecords) globalCustomStore._customRecords = [];
  const idx = globalCustomStore._customRecords.findIndex((r) => r.id === id && r.tab_slug === tabSlug.trim());
  if (idx >= 0) {
    globalCustomStore._customRecords[idx] = recordToSave;
  } else {
    globalCustomStore._customRecords.unshift(recordToSave);
  }

  const db = await getDatabase();
  if (!db) return { success: true, data: recordToSave };

  try {
    await db.collection(COLLECTIONS.CUSTOM_RECORDS).updateOne(
      { id, tab_slug: tabSlug.trim() },
      { $set: recordToSave },
      { upsert: true }
    );
    return { success: true, data: recordToSave };
  } catch (err: unknown) {
    return { success: true, data: recordToSave };
  }
}

export async function deleteCustomRecordMongo(tabSlug: string, id: string): Promise<{ success: boolean }> {
  if (globalCustomStore._customRecords) {
    globalCustomStore._customRecords = globalCustomStore._customRecords.filter(
      (r) => !(r.id === id && r.tab_slug === tabSlug.trim())
    );
  }

  const db = await getDatabase();
  if (!db) return { success: true };

  try {
    await db.collection(COLLECTIONS.CUSTOM_RECORDS).deleteOne({ id, tab_slug: tabSlug.trim() });
    return { success: true };
  } catch {
    return { success: false };
  }
}


