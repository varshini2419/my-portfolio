import { Db } from 'mongodb';

export const COLLECTIONS = {
  PROFILES: 'profiles',
  PROJECTS: 'projects',
  EDUCATION: 'education',
  SKILLS: 'skills',
  CERTIFICATIONS: 'certifications',
  EXPERIENCE: 'experience',
  RESUMES: 'resumes',
  VLOGS: 'vlogs',
  MEDIA: 'media',
  CONTENT_BLOCKS: 'contentBlocks',
  SITE_SETTINGS: 'siteSettings',
  ADMIN_USERS: 'adminUsers',
  ACTIVITIES: 'activityLogs',
  CUSTOM_TABS: 'customTabs',
  CUSTOM_RECORDS: 'customTabRecords',
} as const;

/**
 * Initializes and ensures all required MongoDB Atlas indexes exist.
 * Uses idempotence so it can be called safely during server initialization or on-demand.
 */
export async function initMongoIndexes(db: Db): Promise<{ success: boolean; indexes: string[]; errors?: string[] }> {
  const created: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Projects Indexes: Unique slug, publication status, featured, sort_order
    const projectsCol = db.collection(COLLECTIONS.PROJECTS);
    await projectsCol.createIndex({ slug: 1 }, { unique: true, background: true });
    created.push('projects.slug (unique)');
    await projectsCol.createIndex({ status: 1, sort_order: 1 }, { background: true });
    created.push('projects.status_sort_order');
    await projectsCol.createIndex({ featured: 1, status: 1 }, { background: true });
    created.push('projects.featured_status');
    await projectsCol.createIndex({ category: 1 }, { background: true });
    created.push('projects.category');

    // 2. Vlogs Indexes: Unique ID, publication status, sort_order
    const vlogsCol = db.collection(COLLECTIONS.VLOGS);
    await vlogsCol.createIndex({ id: 1 }, { unique: true, background: true });
    created.push('vlogs.id (unique)');
    await vlogsCol.createIndex({ status: 1, sort_order: 1 }, { background: true });
    created.push('vlogs.status_sort_order');

    // 3. Content Blocks: Unique block key
    const blocksCol = db.collection(COLLECTIONS.CONTENT_BLOCKS);
    await blocksCol.createIndex({ key: 1 }, { unique: true, background: true });
    created.push('contentBlocks.key (unique)');
    await blocksCol.createIndex({ is_published: 1, display_order: 1 }, { background: true });
    created.push('contentBlocks.published_order');

    // 4. Certifications: Unique ID and sort order
    const certsCol = db.collection(COLLECTIONS.CERTIFICATIONS);
    await certsCol.createIndex({ id: 1 }, { unique: true, background: true });
    created.push('certifications.id (unique)');
    await certsCol.createIndex({ status: 1, sort_order: 1 }, { background: true });
    created.push('certifications.status_order');

    // 5. Education: Unique ID and sort order
    const eduCol = db.collection(COLLECTIONS.EDUCATION);
    await eduCol.createIndex({ id: 1 }, { unique: true, background: true });
    created.push('education.id (unique)');
    await eduCol.createIndex({ sort_order: 1 }, { background: true });
    created.push('education.sort_order');

    // 6. Experience: Unique ID, status, and sort order
    const expCol = db.collection(COLLECTIONS.EXPERIENCE);
    await expCol.createIndex({ id: 1 }, { unique: true, background: true });
    created.push('experience.id (unique)');
    await expCol.createIndex({ status: 1, sort_order: 1 }, { background: true });
    created.push('experience.status_order');

    // 7. Skills: Unique category name
    const skillsCol = db.collection(COLLECTIONS.SKILLS);
    await skillsCol.createIndex({ name: 1 }, { unique: true, background: true });
    created.push('skills.name (unique)');

    // 8. Media Library: Unique asset ID and media type
    const mediaCol = db.collection(COLLECTIONS.MEDIA);
    await mediaCol.createIndex({ id: 1 }, { unique: true, background: true });
    created.push('media.id (unique)');
    await mediaCol.createIndex({ type: 1, uploaded_at: -1 }, { background: true });
    created.push('media.type_date');

    // 9. Admin Users: Unique email
    const usersCol = db.collection(COLLECTIONS.ADMIN_USERS);
    await usersCol.createIndex({ email: 1 }, { unique: true, sparse: true, background: true });
    created.push('adminUsers.email (unique)');

    // 10. Activity Logs: Timestamp descending
    const actCol = db.collection(COLLECTIONS.ACTIVITIES);
    await actCol.createIndex({ timestamp: -1 }, { background: true });
    created.push('activityLogs.timestamp_desc');

    // 11. Custom Tabs: Unique slug and order
    const tabsCol = db.collection(COLLECTIONS.CUSTOM_TABS);
    await tabsCol.createIndex({ slug: 1 }, { unique: true, background: true });
    await tabsCol.createIndex({ order: 1 }, { background: true });
    created.push('customTabs.slug_order');

    // 12. Custom Tab Records: tab_slug and created_at
    const recordsCol = db.collection(COLLECTIONS.CUSTOM_RECORDS);
    await recordsCol.createIndex({ tab_slug: 1, created_at: -1 }, { background: true });
    created.push('customTabRecords.tab_slug_created');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Index initialization note:', msg);
    errors.push(msg);
  }

  return { success: errors.length === 0, indexes: created, errors: errors.length > 0 ? errors : undefined };
}
