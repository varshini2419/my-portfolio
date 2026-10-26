import { Profile, Project, SkillCategory, Certification, Experience, Education, VlogItem, SiteSettings } from '@/types';

export const initialProfile: Profile = {
  id: 'profile-main',
  full_name: 'Maddala Varshini',
  preferred_name: 'Varshini',
  headline: 'Aspiring Data Analyst | 3rd Year B.Tech CS & IT Student',
  bio: 'I am a third-year Computer Science & Information Technology student at SRKR Engineering College with a dedicated ambition to become a Data Analyst in a product-based or fintech company. My focus is on turning raw relational data into actionable business clarity through SQL, exploratory analysis in Python, and dashboard design in Power BI.',
  career_goal: 'Data Analyst in a Product-Based or Fintech Company',
  college: 'SRKR Engineering College, Bhimavaram, India',
  degree: 'Bachelor of Technology (B.Tech)',
  specialization: 'Computer Science and Information Technology',
  year_of_study: '3rd Year (Class of 2026)',
  email: 'maddalavarshini@example.com', // Placeholder for user's personal email
  location: 'Andhra Pradesh, India',
  github_url: 'https://github.com/maddalavarshini',
  linkedin_url: 'https://linkedin.com/in/maddala-varshini',
  avatar_url: '', // Neutral placeholder until user provides official portrait
  resume_url: '', // Placeholder until user uploads official consolidated PDF
  strengths: [
    'Curiosity for uncovering patterns in raw, complex transactional datasets',
    'Solid grasp of SQL, relational data models, and business logic',
    'Structured problem-solving, hypothesis testing, and clean documentation',
    'Strong analytical communication and cross-functional empathy',
    'Fast learner eager to master modern analytics pipelines and BI tools'
  ],
  areas_for_improvement: [
    'Expanding end-to-end cloud data pipeline and warehouse expertise (Snowflake / BigQuery)',
    'Deepening advanced statistical modeling and econometric techniques for fintech',
    'Publishing more interactive end-to-end case studies on GitHub & Tableau Public'
  ],
  work_style: [
    'Detail-oriented data validation before arriving at conclusions',
    'Clean, transparent code and documented SQL queries',
    'User-centric dashboard visual design with high readability'
  ]
};

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    slug: 'financial-customer-churn-analysis',
    title: 'Financial Customer Churn & Retention Analytics',
    short_description: 'Exploratory data analysis and predictive insight into customer attrition factors for retail banking accounts.',
    full_description: 'A quantitative case study analyzing transactional activity, account balance behavior, and demographic patterns to identify early indicators of customer churn in retail banking.',
    problem_statement: 'Financial institutions face rising customer acquisition costs. Identifying early warning signals for account attrition enables timely customer retention interventions.',
    business_objective: 'Identify high-risk customer segments, quantify the revenue impact of attrition, and recommend data-driven retention triggers for the customer success team.',
    business_questions: [
      'Which customer age and credit score segments exhibit the highest attrition rates?',
      'How does active product balance correlation affect account lifetime value?',
      'What behavioral cues exist 60-90 days prior to customer disengagement?'
    ],
    dataset_description: 'Synthesized transactional and demographic data of 10,000+ retail banking customers containing account balance, tenure, credit card ownership, estimated salary, and activity markers.',
    data_cleaning_process: [
      'Handled missing values and zero-balance account anomalies using Pandas',
      'Standardized categorical variables and encoded tenure brackets into ordinal bins',
      'Checked for statistical outliers in transaction frequencies and credit score distributions'
    ],
    methodology: [
      'Data cleaning and anomaly detection using Python (Pandas, NumPy)',
      'Exploratory Data Analysis (EDA) and correlation matrix visualization (Seaborn, Matplotlib)',
      'Feature engineering: credit utilization ratios, balance-to-salary ratios, and tenure cohort grouping',
      'Synthesized insights into an executive slide deck with actionable retention triggers'
    ],
    key_findings: [
      'Customers with single-product engagement had a 24% higher churn probability than multi-product account holders.',
      'Inactive members across specific regional branches showed double the attrition velocity over a 6-month window.',
      'Balance drops exceeding 40% within 30 days were the most consistent pre-churn warning indicator.'
    ],
    recommendations: [
      'Implement proactive alerts when a customer balance drops below targeted thresholds',
      'Offer bundled product incentives to single-product account holders within their first 90 days',
      'Automate monthly engagement touchpoints for dormant high-value customers'
    ],
    thumbnail_url: '',
    github_url: 'https://github.com/maddalavarshini/fintech-churn-analysis',
    live_demo_url: '',
    demo_videos: [
      {
        title: 'Exploratory Analysis Walkthrough',
        url: '',
        source: 'youtube',
        duration: '4:20'
      }
    ],
    tags: ['Python', 'Pandas', 'EDA', 'Fintech', 'Data Visualization', 'Seaborn'],
    category: 'Data Analytics',
    featured: true,
    sort_order: 1,
    status: 'published',
    related_project_slugs: ['ecommerce-sales-performance-dashboard', 'sql-inventory-supply-chain-insights']
  },
  {
    id: 'proj-2',
    slug: 'ecommerce-sales-performance-dashboard',
    title: 'E-Commerce Sales & Profitability Dashboard',
    short_description: 'Interactive Power BI reporting dashboard monitoring regional revenue, margin trends, and category performance.',
    full_description: 'Designed an executive dashboard offering drill-down visibility into multi-regional retail performance, identifying margin leakage across product subcategories and express shipping tiers.',
    problem_statement: 'Disjointed operational spreadsheets caused significant delays in identifying unprofitable product lines and excessive discounting across retail territories.',
    business_objective: 'Consolidate multiple transaction sources into a single source of truth in Power BI, enabling executives to filter revenue, profit margin, and discount impact in real time.',
    business_questions: [
      'Which geographical clusters generated high sales volume but negative net margins?',
      'How did seasonal promotional discounts impact overall unit profitability?',
      'What are the repeat purchase intervals for core product categories?'
    ],
    dataset_description: 'Multi-year retail sales records containing over 50,000 transactions, catalog metadata, return rates, customer demographics, and shipping logs.',
    data_cleaning_process: [
      'Normalized raw order items and customer tables into a clean Star Schema in Power Query',
      'Resolved date format discrepancies and standardized regional territory codes',
      'Created custom calculated columns for shipping duration and net discount percentage'
    ],
    methodology: [
      'Data modeling with Star Schema architecture in Power BI / Power Query',
      'Authored DAX measures for Year-over-Year (YoY) revenue, Profit Margin %, and Moving Averages',
      'Constructed an interactive visual canvas featuring dynamic KPI cards and drill-through pages'
    ],
    key_findings: [
      'Identified 3 product subcategories with excessive discount rates (>25%) eroding net margin by 8.5%.',
      'Express shipping on low-value orders was the highest contributor to negative order margins in rural regions.',
      'Streamlined weekly reporting cycle from manual spreadsheets to automated daily data refresh.'
    ],
    recommendations: [
      'Cap maximum promotional discount at 18% for low-margin accessory categories',
      'Set minimum order value thresholds for express shipping subsidies',
      'Transition executive reporting entirely to automated Power BI scheduled refreshes'
    ],
    thumbnail_url: '',
    github_url: 'https://github.com/maddalavarshini/powerbi-retail-dashboard',
    live_demo_url: '',
    demo_videos: [
      {
        title: 'Executive Dashboard Navigation Demo',
        url: '',
        source: 'youtube',
        duration: '3:15'
      },
      {
        title: 'DAX Measures & Star Schema Architecture',
        url: '',
        source: 'youtube',
        duration: '5:00'
      }
    ],
    tags: ['Power BI', 'DAX', 'Data Modeling', 'Business Intelligence', 'Power Query'],
    category: 'Power BI Dashboards',
    featured: true,
    sort_order: 2,
    status: 'published',
    related_project_slugs: ['financial-customer-churn-analysis', 'sql-inventory-supply-chain-insights']
  },
  {
    id: 'proj-3',
    slug: 'sql-inventory-supply-chain-insights',
    title: 'Supply Chain Inventory & Order Optimization with SQL',
    short_description: 'Complex SQL queries leveraging CTEs and window functions to audit warehouse lead times and stockout frequencies.',
    full_description: 'A comprehensive SQL analytics suite analyzing fulfillment bottlenecks, safety stock calculations, and supplier on-time delivery compliance for multi-warehouse distribution.',
    problem_statement: 'Lack of automated relational reporting led to unexpected stockout events and poor visibility into supplier delivery reliability.',
    business_objective: 'Author modular, performant SQL queries to audit supplier SLA adherence, calculate inventory turnover ratios, and alert operations to stock replenishment requirements.',
    business_questions: [
      'Which suppliers consistently exceed agreed delivery SLA timelines?',
      'What is the inventory turnover ratio by product velocity category (A/B/C classification)?',
      'Which distribution centers have the largest variance between scheduled and actual delivery?'
    ],
    dataset_description: 'Relational database containing tables for Orders, OrderItems, Products, Suppliers, and WarehouseInventory with 100,000+ records.',
    data_cleaning_process: [
      'Audited foreign key integrity between orders and warehouse inventory logs',
      'Handled null values in actual delivery date timestamps and recorded canceled orders separately',
      'Indexed high-cardinality join keys to accelerate multi-table query performance'
    ],
    methodology: [
      'Designed normalized PostgreSQL relational schema with primary and foreign key constraints',
      'Authored modular SQL scripts using Common Table Expressions (CTEs) and Window Functions (RANK, ROW_NUMBER, LAG/LEAD)',
      'Automated inventory replenishment warning queries based on rolling 30-day demand'
    ],
    key_findings: [
      'Fast-moving category items suffered 14% unnecessary stockouts due to static rather than dynamic reorder points.',
      'Supplier SLA tracking highlighted two primary vendors causing 65% of overall delivery delays.',
      'Query execution times reduced by 40% following index optimization on order date and warehouse ID.'
    ],
    recommendations: [
      'Adopt dynamic reorder points based on 30-day rolling demand rather than static monthly thresholds',
      'Incorporate SLA penalty clauses in upcoming vendor contract renegotiations',
      'Deploy automated weekly SQL view exports directly to warehouse floor managers'
    ],
    thumbnail_url: '',
    github_url: 'https://github.com/maddalavarshini/sql-supply-chain-analytics',
    live_demo_url: '',
    demo_videos: [
      {
        title: 'SQL Query Walkthrough & CTE Optimization',
        url: '',
        source: 'youtube',
        duration: '4:45'
      }
    ],
    tags: ['PostgreSQL', 'Advanced SQL', 'Window Functions', 'CTEs', 'Data Modeling'],
    category: 'SQL Projects',
    featured: true,
    sort_order: 3,
    status: 'published',
    related_project_slugs: ['financial-customer-churn-analysis', 'ecommerce-sales-performance-dashboard']
  },
  {
    id: 'proj-draft-sample',
    slug: 'exploratory-healthcare-analytics-draft',
    title: 'Healthcare Patient Admission Patterns (In Progress)',
    short_description: 'Draft case study examining patient admission lengths and resource allocation.',
    category: 'Data Analytics',
    featured: false,
    sort_order: 4,
    status: 'draft', // Strictly draft - will NEVER appear on public routes
    tags: ['Python', 'EDA', 'Healthcare'],
    business_questions: ['What drives emergency room re-admission rates?'],
  }
];

export const skillCategories: SkillCategory[] = [
  {
    name: 'Data Analysis',
    skills: [
      { name: 'Exploratory Data Analysis (EDA)', is_featured: true, description: 'Pattern discovery, missing data treatment, anomaly detection' },
      { name: 'Statistical Thinking & Hypothesis Formulation', is_featured: true, description: 'Descriptive statistics, distributions, correlation analysis' },
      { name: 'Data Wrangling & Cleaning', is_featured: true, description: 'Pandas, NumPy, automated transformations' },
      { name: 'Business Metric Definition', is_featured: true, description: 'KPI formulation, cohort retention, churn metrics' },
    ]
  },
  {
    name: 'Data Visualization',
    skills: [
      { name: 'Power BI', is_featured: true, description: 'Interactive dashboard design, DAX formulas, Star Schema modeling' },
      { name: 'Matplotlib & Seaborn', is_featured: true, description: 'Custom statistical plots, heatmaps, distribution plots' },
      { name: 'Executive Dashboard UI', is_featured: true, description: 'Information hierarchy, minimal cognitive load visual design' },
      { name: 'Microsoft Excel / Google Sheets', is_featured: true, description: 'Pivot tables, XLOOKUP, conditional formulas, scenario modeling' },
    ]
  },
  {
    name: 'Programming',
    skills: [
      { name: 'Python', is_featured: true, description: 'Data structures, Pandas, NumPy, automation scripting' },
      { name: 'Java / C++', is_featured: false, description: 'Object-oriented programming, algorithms & data structures' },
      { name: 'JavaScript / TypeScript', is_featured: false, description: 'Modern web scripting and web dashboard integrations' },
    ]
  },
  {
    name: 'Databases & SQL',
    skills: [
      { name: 'PostgreSQL', is_featured: true, description: 'Relational design, indexing, constraints, query optimization' },
      { name: 'Advanced SQL', is_featured: true, description: 'CTEs, Window Functions (RANK, ROW_NUMBER, LAG/LEAD), subqueries' },
      { name: 'MySQL', is_featured: false, description: 'Database administration, schema migrations' },
    ]
  },
  {
    name: 'Cloud Technologies',
    skills: [
      { name: 'Supabase / Cloud DBs', is_featured: true, description: 'Cloud PostgreSQL hosting, RLS security policies, Auth' },
      { name: 'AWS Cloud Fundamentals', is_featured: false, description: 'S3 storage basics, EC2 concepts, cloud data lifecycle' },
      { name: 'Git & GitHub', is_featured: true, description: 'Version control, repository management, collaborative workflows' },
    ]
  },
  {
    name: 'AI Tools',
    skills: [
      { name: 'AI-Assisted Analysis & Code Gen', is_featured: true, description: 'Prompt engineering for data modeling, SQL optimization, code debugging' },
      { name: 'LLM Document Parsing', is_featured: false, description: 'Extracting structured tables and insights from unstructured textual data' },
      { name: 'Data Augmentation', is_featured: false, description: 'Synthetic test dataset generation for stress-testing queries' },
    ]
  },
  {
    name: 'Development Tools',
    skills: [
      { name: 'Jupyter Notebooks & VS Code', is_featured: true, description: 'Interactive reproducible research notebooks' },
      { name: 'Postman', is_featured: false, description: 'API testing and data extraction' },
      { name: 'Markdown & Technical Documentation', is_featured: true, description: 'Clear documentation for stakeholders and engineering teams' },
    ]
  }
];

export const initialEducation: Education[] = [
  {
    id: 'edu-1',
    institution: 'SRKR Engineering College',
    degree: 'Bachelor of Technology (B.Tech)',
    field_of_study: 'Computer Science and Information Technology',
    start_year: '2023',
    end_year: '2026 (Expected)',
    grade_or_status: '3rd Year Undergraduate',
    highlights: [
      'Core coursework: Database Management Systems (DBMS), Data Structures & Algorithms, Object Oriented Programming, Software Engineering',
      'Specialized focus on data analytics, relational query design, and statistical data processing',
      'Active participant in technical symposiums and academic analytics challenges'
    ]
  }
];

export const initialExperience: Experience[] = [
  {
    id: 'exp-1',
    organization: 'Academic Project & Analytics Lab Work',
    role: 'Student Data Researcher & Developer',
    experience_type: 'academic',
    start_date: '2024',
    end_date: 'Present',
    is_current: true,
    location: 'SRKR Engineering College, India',
    description: 'Engaging in university coursework and self-directed analytics projects solving simulated industry problems.',
    bullet_points: [
      'Designed relational database models in PostgreSQL for academic management and analytics case studies.',
      'Built automated data cleaning routines in Python for messy real-world survey datasets.',
      'Prepared documentation and interactive presentations explaining statistical insights to peer groups.'
    ],
    skills_used: ['PostgreSQL', 'Python', 'Pandas', 'Documentation'],
    status: 'published'
  },
  {
    id: 'exp-placeholder',
    organization: '[Future Internship / Work Experience Placeholder]',
    role: 'Data Analyst Intern (Ready to Apply)',
    experience_type: 'internship',
    start_date: 'Summer 2025 / 2026',
    is_current: false,
    location: 'Open to Onsite & Remote Opportunities',
    description: 'Actively preparing for internship and full-time opportunities in product and fintech companies.',
    bullet_points: [
      'Ready to apply SQL, Python, and Power BI expertise to real-world customer and transactional data.',
      'Committed to measurable business outcomes, rigorous data validation, and clear reporting.'
    ],
    skills_used: ['SQL', 'Python', 'Power BI', 'Financial Analytics'],
    status: 'published'
  }
];

export const initialCertifications: Certification[] = [
  {
    id: 'cert-1',
    title: 'Foundations of Data Analysis',
    issuer: 'Coursework & Skill Verification',
    issue_date: '2024',
    credential_url: '',
    certificate_image_url: '',
    is_ongoing: false,
    status: 'completed',
    skills_covered: ['Data Cleaning', 'Exploratory Data Analysis', 'SQL Querying', 'Data Visualization']
  },
  {
    id: 'cert-2',
    title: 'Advanced SQL for Data Analytics (CTEs, Window Functions & Optimization)',
    issuer: 'Independent Professional Study',
    issue_date: '2024 - 2025',
    credential_url: '',
    certificate_image_url: '',
    is_ongoing: false,
    status: 'completed',
    skills_covered: ['PostgreSQL', 'Complex Joins', 'Window Functions', 'Execution Plans']
  },
  {
    id: 'cert-3',
    title: 'Business Intelligence & Power BI Masterclass',
    issuer: 'Certification in Progress',
    issue_date: 'In Progress (2025)',
    credential_url: '',
    certificate_image_url: '',
    is_ongoing: true,
    status: 'in_progress',
    skills_covered: ['DAX', 'Star Schema', 'Interactive Dashboard UX']
  }
];

export const initialVlogs: VlogItem[] = [
  {
    id: 'vlog-1',
    title: 'A Day in the Life of a CS & IT Student at SRKR',
    description: 'Balancing coding assignments, lab sessions, and independent data analysis study sessions with friends on campus.',
    thumbnail_url: '',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder embed structure
    video_source: 'youtube',
    category: 'College Days',
    published_date: '2025',
    status: 'published',
    duration: '5:30',
    sort_order: 1
  },
  {
    id: 'vlog-2',
    title: 'Solo Coffee Date & Weekend Study Session',
    description: 'A cozy afternoon planning out my week, reviewing Python scripts, and enjoying calm focus time.',
    thumbnail_url: '',
    video_url: '',
    video_source: 'youtube',
    category: 'Solo Dates',
    published_date: '2025',
    status: 'published',
    duration: '4:15',
    sort_order: 2
  },
  {
    id: 'vlog-3',
    title: 'Campus Walk & Sunset Vibes with Friends',
    description: 'Unwinding after exams, capturing simple moments around college, and enjoying warm conversations.',
    thumbnail_url: '',
    video_url: '',
    video_source: 'youtube',
    category: 'Lifestyle',
    published_date: '2025',
    status: 'published',
    duration: '3:45',
    sort_order: 3
  }
];

export const initialSiteSettings: SiteSettings = {
  site_title: 'Maddala Varshini | Portfolio',
  tagline: 'Aspiring Data Analyst & CS Student',
  contact_email: 'maddalavarshini@example.com',
  is_maintenance_mode: false,
  allow_contact_form: true,
};
