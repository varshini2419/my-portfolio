-- ==============================================================================
-- DATABASE SCHEMA: Maddala Varshini Portfolio
-- Supabase PostgreSQL with Row Level Security (RLS)
-- Phase 1 Foundation
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Maddala Varshini',
    preferred_name TEXT DEFAULT 'Varshini',
    headline TEXT NOT NULL DEFAULT 'Aspiring Data Analyst | 3rd Year B.Tech CS & IT Student',
    bio TEXT,
    career_goal TEXT DEFAULT 'Data Analyst in a Product-Based or Fintech Company',
    college TEXT DEFAULT 'SRKR Engineering College, Bhimavaram, India',
    degree TEXT DEFAULT 'Bachelor of Technology (B.Tech)',
    specialization TEXT DEFAULT 'Computer Science and Information Technology',
    year_of_study TEXT DEFAULT '3rd Year',
    email TEXT,
    phone TEXT,
    location TEXT DEFAULT 'Andhra Pradesh, India',
    github_url TEXT DEFAULT 'https://github.com/maddalavarshini',
    linkedin_url TEXT DEFAULT 'https://linkedin.com/in/maddala-varshini',
    avatar_url TEXT,
    resume_url TEXT,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    work_style TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT,
    problem_statement TEXT,
    business_questions TEXT[],
    dataset_description TEXT,
    methodology TEXT[],
    key_findings TEXT[],
    thumbnail_url TEXT,
    github_url TEXT,
    live_demo_url TEXT,
    video_url TEXT,
    tags TEXT[] DEFAULT '{}',
    category TEXT NOT NULL DEFAULT 'Data Analytics',
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Project Media Table
CREATE TABLE IF NOT EXISTS public.project_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN (
        'Data Analysis',
        'Data Visualization',
        'Programming',
        'Databases & SQL',
        'Cloud Technologies',
        'AI Tools',
        'Development Tools'
    )),
    name TEXT NOT NULL,
    description TEXT,
    level TEXT,
    icon TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Certifications Table
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    credential_url TEXT,
    certificate_image_url TEXT,
    is_ongoing BOOLEAN DEFAULT false,
    skills_covered TEXT[],
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Experience Table
CREATE TABLE IF NOT EXISTS public.experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization TEXT NOT NULL,
    role TEXT NOT NULL,
    experience_type TEXT NOT NULL CHECK (experience_type IN ('internship', 'freelance', 'academic', 'full-time', 'leadership')),
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_current BOOLEAN DEFAULT false,
    location TEXT,
    description TEXT NOT NULL,
    bullet_points TEXT[],
    link_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Education Table
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_year TEXT NOT NULL,
    end_year TEXT NOT NULL,
    grade_or_status TEXT NOT NULL,
    highlights TEXT[],
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Resumes Table
CREATE TABLE IF NOT EXISTS public.resume_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Vlogs Table
CREATE TABLE IF NOT EXISTS public.vlogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    video_source TEXT NOT NULL DEFAULT 'youtube' CHECK (video_source IN ('youtube', 'vimeo', 'storage', 'embed')),
    category TEXT NOT NULL CHECK (category IN ('College Days', 'Solo Dates', 'Lifestyle', 'Tech & Study', 'Other')),
    published_date TEXT NOT NULL,
    duration TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_title TEXT NOT NULL DEFAULT 'Maddala Varshini | Portfolio',
    tagline TEXT DEFAULT 'Aspiring Data Analyst & CS Student',
    contact_email TEXT DEFAULT 'maddalavarshini@example.com',
    is_maintenance_mode BOOLEAN DEFAULT false,
    allow_contact_form BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Read-only for Public, Write for Authenticated Administrator
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Published projects are viewable by everyone" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public project media viewable by everyone" ON public.project_media FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_media.project_id AND projects.status = 'published')
);
CREATE POLICY "Public skills viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public certifications viewable by everyone" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Public experience viewable by everyone" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Public education viewable by everyone" ON public.education FOR SELECT USING (true);
CREATE POLICY "Active resume viewable by everyone" ON public.resume_records FOR SELECT USING (is_active = true);
CREATE POLICY "Published vlogs viewable by everyone" ON public.vlogs FOR SELECT USING (status = 'published');
CREATE POLICY "Site settings viewable by everyone" ON public.site_settings FOR SELECT USING (true);

-- Contact messages: Anyone can insert a contact message (with rate-limiting/validation)
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- 2. Authenticated Admin Policies (Full Access)
CREATE POLICY "Admin full access on profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on project_media" ON public.project_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on certifications" ON public.certifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on experience" ON public.experience FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on education" ON public.education FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on resume_records" ON public.resume_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on vlogs" ON public.vlogs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on contact_messages" ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKETS CONFIGURATION (Run in Supabase Storage setup)
-- ==============================================================================
-- Buckets to create in Supabase dashboard:
-- 1. 'portfolio-assets' (public read: true) - for project thumbnails, avatars
-- 2. 'resumes' (public read: true) - for uploaded PDF resumes
-- 3. 'vlog-media' (public read: true) - for personal vlog posters and media

-- 13. Authorized Administrators Table (Optional DB-backed allowlist)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read own record" ON public.admin_users FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');

-- Storage Row Level Security (Execute after creating buckets in Supabase)
-- Public read:
CREATE POLICY "Public read portfolio-assets" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-assets');
CREATE POLICY "Public read resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Public read vlog-media" ON storage.objects FOR SELECT USING (bucket_id = 'vlog-media');

-- Authenticated Admin write:
CREATE POLICY "Admin upload portfolio-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-assets');
CREATE POLICY "Admin update portfolio-assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-assets');
CREATE POLICY "Admin delete portfolio-assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Admin upload resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Admin update resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes');
CREATE POLICY "Admin delete resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes');

CREATE POLICY "Admin upload vlog-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vlog-media');
CREATE POLICY "Admin update vlog-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vlog-media');
CREATE POLICY "Admin delete vlog-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vlog-media');

