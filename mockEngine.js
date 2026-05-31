// mockEngine.js - Client-Side NLP and AI Simulation Engine

/**
 * Common skills database grouped by industry for robust local processing.
 */
const SKILL_DATABASE = {
  tech: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'go', 'rust', 'ruby', 'php',
    'react', 'next.js', 'vue', 'angular', 'svelte', 'nodejs', 'express', 'django', 'flask',
    'spring boot', 'html5', 'css3', 'tailwind', 'sass', 'bootstrap', 'jquery',
    'postgresql', 'mongodb', 'mysql', 'redis', 'elasticsearch', 'sqlite', 'dynamodb',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'gitlab',
    'graphql', 'rest api', 'grpc', 'microservices', 'serverless', 'terraform',
    'agile', 'scrum', 'jira', 'confluence', 'tdd', 'bdd', 'jest', 'cypress', 'webpack',
    'system design', 'cloud architecture', 'ci/cd pipelines', 'devops', 'machine learning'
  ],
  data: [
    'sql', 'python', 'r', 'tableau', 'power bi', 'looker', 'excel', 'pandas', 'numpy',
    'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'spark', 'hadoop', 'hive', 'kafka',
    'data warehousing', 'etl', 'elt', 'data modeling', 'data pipelines', 'statistics',
    'ab testing', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'bi',
    'big data', 'predictive analytics', 'regression', 'classification', 'clustering'
  ],
  product: [
    'product strategy', 'roadmap', 'product lifecycle', 'agile', 'scrum', 'wireframing',
    'user research', 'market analysis', 'competitive analysis', 'sql', 'analytics',
    'jira', 'figma', 'okrs', 'kpis', 'mvp', 'user stories', 'backlog grooming',
    'cross-functional collaboration', 'stakeholder management', 'a/b testing',
    'customer journeys', 'usability testing', 'design thinking', 'product launch'
  ],
  marketing: [
    'seo', 'sem', 'google analytics', 'seo/sem', 'content marketing', 'social media marketing',
    'email marketing', 'copywriting', 'lead generation', 'crm', 'hubspot', 'mailchimp',
    'digital marketing', 'brand strategy', 'ppc', 'google ads', 'facebook ads',
    'content strategy', 'conversion rate optimization', 'cro', 'growth hacking',
    'public relations', 'event planning', 'influencer marketing', 'market research'
  ],
  soft: [
    'communication', 'leadership', 'teamwork', 'collaboration', 'problem solving',
    'critical thinking', 'adaptability', 'time management', 'creativity', 'conflict resolution',
    'work ethic', 'emotional intelligence', 'active listening', 'negotiation',
    'presentation', 'mentorship', 'decision making', 'organization', 'interpersonal skills'
  ]
};

/**
 * Stop words to filter out during keyword extraction.
 */
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
  'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt',
  'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
  'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres',
  'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
  'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom',
  'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
  'your', 'yours', 'yourself', 'yourselves',
  // Indonesian Stop Words
  'dan', 'yang', 'di', 'dengan', 'untuk', 'pada', 'ke', 'dari', 'dalam', 'oleh', 'ini', 'itu',
  'adalah', 'sebagai', 'akan', 'dapat', 'atau', 'bahwa', 'saya', 'kami', 'kita', 'anda', 'mereka',
  'ia', 'dia', 'juga', 'telah', 'sudah', 'belum', 'bisa', 'ingin', 'harus', 'secara', 'tentang',
  'seperti', 'karena', 'jika', 'maka', 'namun', 'tetapi', 'serta', 'tersebut', 'yg', 'dgn', 'utk',
  'dr', 'saja', 'sangat', 'adlh', 'kami', 'saya'
]);

/**
 * Standardize text for robust lookup.
 */
function cleanText(text) {
  return text.toLowerCase()
    .replace(/[^\w\s\.\-\#\+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts potential keywords from the job description based on skill databases and word patterns.
 */
export function extractKeywords(jobDescriptionText) {
  if (!jobDescriptionText) return [];

  const cleanedJD = cleanText(jobDescriptionText);
  const foundKeywords = new Set();

  // 1. Scan against our skill database
  const allDbSkills = [
    ...SKILL_DATABASE.tech,
    ...SKILL_DATABASE.data,
    ...SKILL_DATABASE.product,
    ...SKILL_DATABASE.marketing,
    ...SKILL_DATABASE.soft
  ];

  allDbSkills.forEach(skill => {
    // Regex boundary check for exact skill match (handling special chars like C++, .NET)
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');

    // Custom check for special characters (C++, C#, .NET, Node.js)
    if (skill.includes('+') || skill.includes('#') || skill.startsWith('.')) {
      if (cleanedJD.includes(skill)) {
        foundKeywords.add(skill);
      }
    } else if (regex.test(cleanedJD)) {
      foundKeywords.add(skill);
    }
  });

  // 2. Extract standard uppercase tech acronyms (e.g. AWS, API, GCP, UI, UX, CRM, CI, CD)
  const words = jobDescriptionText.split(/\s+/);
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w\-\#\+]/g, '').trim();
    if (/^[A-Z]{2,5}$/.test(cleanWord)) {
      const lower = cleanWord.toLowerCase();
      if (!STOP_WORDS.has(lower) && !['the', 'and', 'for', 'are', 'job', 'our', 'key', 'fit', 'new', 'who', 'use', 'out'].includes(lower)) {
        foundKeywords.add(lower);
      }
    }
  });

  return Array.from(foundKeywords);
}

/**
 * Calculates ATS matching and scores.
 */
export function analyzeATS(resumeText, jobDescriptionText) {
  if (!resumeText || !jobDescriptionText) {
    return {
      overallScore: 0,
      breakdown: { keywordMatch: 0, formatting: 0, hardSkills: 0, softSkills: 0, experience: 0 },
      keywords: [],
      formattingIssues: []
    };
  }

  const jdKeywords = extractKeywords(jobDescriptionText);
  const cleanedResume = cleanText(resumeText);
  const cleanedJD = cleanText(jobDescriptionText);

  // Categorize keywords from JD
  const resumeKeywords = [];
  const missingKeywords = [];

  const techSkills = new Set(SKILL_DATABASE.tech);
  const dataSkills = new Set(SKILL_DATABASE.data);
  const productSkills = new Set(SKILL_DATABASE.product);
  const marketingSkills = new Set(SKILL_DATABASE.marketing);

  jdKeywords.forEach(keyword => {
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let hasMatch = false;

    if (keyword.includes('+') || keyword.includes('#') || keyword.startsWith('.')) {
      hasMatch = cleanedResume.includes(keyword);
    } else {
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      hasMatch = regex.test(cleanedResume);
    }

    // Determine type
    let type = 'Hard Skill';
    if (techSkills.has(keyword) || dataSkills.has(keyword)) {
      type = 'Technical Skill';
    } else if (productSkills.has(keyword) || marketingSkills.has(keyword)) {
      type = 'Domain Competency';
    } else if (SKILL_DATABASE.soft.includes(keyword)) {
      type = 'Soft Skill';
    }

    const kwData = { name: keyword, type };
    if (hasMatch) {
      resumeKeywords.push(kwData);
    } else {
      missingKeywords.push(kwData);
    }
  });

  // Score Calculations
  const keywordMatchCount = resumeKeywords.length;
  const totalKeywords = jdKeywords.length || 1;
  const keywordMatchScore = Math.min(100, Math.round((keywordMatchCount / totalKeywords) * 100));

  // Formatting Scan
  const formattingIssues = [];
  let formattingScore = 100;

  // Rule 1: Resume Length
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 150) {
    formattingIssues.push({
      severity: 'high',
      title: 'Resume content is extremely short',
      desc: 'ATS algorithms might flag this resume as incomplete. Aim for 300 to 1000 words.'
    });
    formattingScore -= 20;
  } else if (wordCount > 1500) {
    formattingIssues.push({
      severity: 'medium',
      title: 'Resume is overly wordy',
      desc: 'Resumes longer than 1500 words may be difficult for recruiters to read. Focus on impact and conciseness.'
    });
    formattingScore -= 10;
  }

  // Rule 2: Section Headers
  const sections = ['experience', 'education', 'skills', 'contact', 'summary', 'projects'];
  let foundSectionsCount = 0;
  sections.forEach(sec => {
    const reg = new RegExp(`\\b${sec}\\b`, 'i');
    if (reg.test(cleanedResume)) {
      foundSectionsCount++;
    }
  });
  if (foundSectionsCount < 3) {
    formattingIssues.push({
      severity: 'high',
      title: 'Missing critical section headings',
      desc: 'Make sure standard sections like "Experience", "Education", and "Skills" are clearly labeled.'
    });
    formattingScore -= 25;
  }

  // Rule 3: Bullet points check
  const bulletCount = (resumeText.match(/[•\-\*]/g) || []).length;
  if (bulletCount < 3) {
    formattingIssues.push({
      severity: 'medium',
      title: 'Low use of bulleted action items',
      desc: 'Use bullet points in your work experience section to improve readability for ATS and human readers.'
    });
    formattingScore -= 15;
  }

  // Rule 4: Contact details scan
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;
  const hasEmail = emailRegex.test(resumeText);
  if (!hasEmail) {
    formattingIssues.push({
      severity: 'high',
      title: 'No email address detected',
      desc: 'Make sure to add your contact details (email, phone, LinkedIn) at the top of your resume.'
    });
    formattingScore -= 20;
  }

  formattingScore = Math.max(30, formattingScore);

  // Skill calculations
  const totalHardSkills = resumeKeywords.filter(k => k.type !== 'Soft Skill').length;
  const targetHardSkills = jdKeywords.filter(k => {
    return techSkills.has(k) || dataSkills.has(k) || productSkills.has(k) || marketingSkills.has(k);
  }).length || 1;
  const hardSkillsScore = Math.min(100, Math.round((totalHardSkills / targetHardSkills) * 100));

  const totalSoftSkills = resumeKeywords.filter(k => k.type === 'Soft Skill').length;
  const targetSoftSkills = jdKeywords.filter(k => SKILL_DATABASE.soft.includes(k)).length || 1;
  const softSkillsScore = Math.min(100, Math.round((totalSoftSkills / targetSoftSkills) * 100));

  // Experience matching
  let experienceScore = 70; // Baseline
  // Check job title matching
  const jdWords = cleanedJD.split(/\s+/);
  const titles = ['engineer', 'developer', 'manager', 'analyst', 'specialist', 'designer', 'lead', 'director', 'consultant'];
  let matchedTitle = '';
  titles.forEach(title => {
    if (cleanedJD.includes(title) && cleanedResume.includes(title)) {
      matchedTitle = title;
    }
  });

  if (matchedTitle) {
    experienceScore += 20;
  } else {
    formattingIssues.push({
      severity: 'low',
      title: 'Target job title alignment is weak',
      desc: 'Consider tailoring your professional summary to align closer with the role title in the job description.'
    });
    experienceScore -= 10;
  }

  // Check for action verbs
  const actionVerbs = ['led', 'managed', 'developed', 'created', 'designed', 'built', 'improved', 'increased', 'optimized', 'delivered', 'analyzed', 'engineered'];
  let verbCount = 0;
  actionVerbs.forEach(verb => {
    const reg = new RegExp(`\\b${verb}\\b`, 'i');
    if (reg.test(cleanedResume)) verbCount++;
  });
  if (verbCount > 4) {
    experienceScore += 10;
  } else {
    experienceScore -= 10;
  }
  experienceScore = Math.min(100, Math.max(40, experienceScore));

  const overallScore = Math.round(
    (keywordMatchScore * 0.4) +
    (formattingScore * 0.2) +
    (hardSkillsScore * 0.2) +
    (softSkillsScore * 0.1) +
    (experienceScore * 0.1)
  );

  return {
    overallScore,
    breakdown: {
      keywordMatch: keywordMatchScore,
      formatting: formattingScore,
      hardSkills: hardSkillsScore,
      softSkills: softSkillsScore,
      experience: experienceScore
    },
    keywords: {
      found: resumeKeywords,
      missing: missingKeywords
    },
    formattingIssues
  };
}

/**
 * Parse job title from Job Description for templates.
 */
function extractJobTitleAndCompany(jobDescriptionText) {
  const cleaned = cleanText(jobDescriptionText);
  let title = 'Professional';
  let company = 'Target Company';

  const titles = [
    { key: 'software engineer', name: 'Software Engineer' },
    { key: 'frontend developer', name: 'Frontend Developer' },
    { key: 'backend engineer', name: 'Backend Engineer' },
    { key: 'full stack developer', name: 'Full Stack Developer' },
    { key: 'product manager', name: 'Product Manager' },
    { key: 'data analyst', name: 'Data Analyst' },
    { key: 'data scientist', name: 'Data Scientist' },
    { key: 'marketing specialist', name: 'Marketing Specialist' },
    { key: 'ui/ux designer', name: 'UI/UX Designer' },
    { key: 'sales executive', name: 'Sales Account Executive' },
    // Indonesian Titles
    { key: 'rekayasa perangkat lunak', name: 'Software Engineer' },
    { key: 'pengembang web', name: 'Web Developer' },
    { key: 'programmer', name: 'Programmer' },
    { key: 'analis data', name: 'Data Analyst' },
    { key: 'manajer produk', name: 'Product Manager' },
    { key: 'desainer ui', name: 'UI/UX Designer' },
    { key: 'desainer grafis', name: 'Graphic Designer' },
    { key: 'spesialis pemasaran', name: 'Marketing Specialist' }
  ];

  for (const t of titles) {
    if (cleaned.includes(t.key)) {
      title = t.name;
      break;
    }
  }

  // Attempt to parse company (e.g., "at Google", "di Tokopedia", "pada Shopee")
  const companyMatch = jobDescriptionText.match(/(?:at|di|pada)\s+([A-Z][a-zA-Z0-9\s]+?)(?:\s+is|\s+adalah|\.|\,)/i);
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].trim();
  }

  return { title, company };
}

function extractCandidateInfo(resumeText) {
  if (!resumeText) {
    return {
      name: 'Candidate Name',
      email: 'candidate@email.com',
      phone: '',
      address: '',
      ttl: ''
    };
  }

  const lines = resumeText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  let name = '';
  let email = '';
  let phone = '';
  let address = '';
  let ttl = '';

  // 1. Extract email
  const emailMatch = resumeText.match(/[\w\.\+-]+@[\w\.-]+\.\w+/);
  if (emailMatch) {
    email = emailMatch[0];
  }

  // 2. Extract phone number
  const phoneMatch = resumeText.match(/(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
  if (phoneMatch) {
    phone = phoneMatch[0];
  }

  // 3. Extract TTL (Tempat Tanggal Lahir / Birth Place & Date)
  const ttlPatterns = [
    /(?:birth|born|lahir|ttl|tempat\s+tanggal\s+lahir)\s*[:\-]\s*([A-Za-z0-9\s,\-\/\.]+)/i,
    /(?:\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b)/i,
    /(?:\b\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}\b)/
  ];
  for (const pattern of ttlPatterns) {
    const match = resumeText.match(pattern);
    if (match) {
      ttl = match[1] ? match[1].trim() : match[0].trim();
      break;
    }
  }

  // 4. Extract Address
  const addressPatterns = [
    /Jl\.\s+[A-Za-z0-9\s\.\-]+/i,
    /Jalan\s+[A-Za-z0-9\s\.\-]+/i,
    /Street\s+[A-Za-z0-9\s\.\-]+/i,
    /Avenue\s+[A-Za-z0-9\s\.\-]+/i,
    /[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/, // US City, State Zip
    /(?:Jakarta|Bandung|Surabaya|Medan|Semarang|Makassar|Yogyakarta|Depok|Tangerang|Bekasi|Bogor|Malang|Solo)/i
  ];
  for (const pattern of addressPatterns) {
    const match = resumeText.match(pattern);
    if (match) {
      address = match[0].trim();
      break;
    }
  }

  // 5. Try to detect candidate name from first few lines, filtering out metadata/system lines
  for (const line of lines.slice(0, 10)) {
    const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
    const wordCount = cleanLine.split(/\s+/).length;
    if (
      wordCount >= 2 &&
      wordCount <= 4 &&
      !line.includes('@') &&
      !line.includes(':') &&
      !line.includes('/') &&
      !line.includes('\\') &&
      !/\b(?:resume|cv|curriculum|vitae|page|created|at|date|updated|file|pdf)\b/i.test(line) &&
      !/\d/.test(line)
    ) {
      name = line;
      break;
    }
  }

  return {
    name: name || 'Candidate Name',
    email: email || 'candidate@email.com',
    phone: phone || '',
    address: address || '',
    ttl: ttl || ''
  };
}

export function mockRewriteResume(resumeText, jobDescriptionText) {
  const analysis = analyzeATS(resumeText, jobDescriptionText);
  const missingKws = analysis.keywords.missing.map(k => k.name);
  const foundKws = analysis.keywords.found.map(k => k.name);
  const candidate = extractCandidateInfo(resumeText);

  const name = candidate.name;

  // Clean contact details from the original text lines to prevent duplication
  const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
  const cleanedBodyLines = [];

  for (const line of lines) {
    // Skip name line or lines containing email/phone
    if (line === name) continue;
    if (line.includes('@')) continue;
    if (candidate.phone && line.replace(/[-.\s\(\)]/g, '').includes(candidate.phone.replace(/[-.\s\(\)]/g, ''))) continue;

    // Check if the line is just a metadata/date generated line
    if (/\b(?:page|created|at|date|updated|file|pdf)\b/i.test(line) && /\d/.test(line)) continue;

    cleanedBodyLines.push(line);
  }

  // Re-assemble the body text
  let bodyText = cleanedBodyLines.join('\n');

  // Bold all matched keywords in the body text (case-insensitive replace)
  const allKeywords = [...foundKws, ...missingKws];
  allKeywords.forEach(kw => {
    const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
    bodyText = bodyText.replace(regex, '**$1**');
  });

  // Format the contact details at the top
  const contactList = [
    candidate.email,
    candidate.phone,
    candidate.address,
    candidate.ttl ? `Born: ${candidate.ttl}` : ''
  ].filter(Boolean);
  const contactHeader = contactList.join(' | ');

  const isIndonesian = /yang|dan|dengan|untuk|pada|dari/i.test(resumeText);

  let outputMarkdown = `# ${name.toUpperCase()}
${contactHeader}

---

${bodyText}`;

  // Append target competencies list if there are missing keywords
  if (missingKws.length > 0) {
    const missingSkillsList = missingKws.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ');
    if (isIndonesian) {
      outputMarkdown += `\n\n---\n\n## REKOMENDASI KATA KUNCI (UNTUK DISISIPKAN)\n- **Keahlian & Alat:** ${missingSkillsList}\n`;
    } else {
      outputMarkdown += `\n\n---\n\n## TARGET COMPETENCIES (RECOMMENDED TO INJECT)\n- **Skills & Tools:** ${missingSkillsList}\n`;
    }
  }

  return outputMarkdown;
}

/**
 * Smart mock cover letter generator.
 */
export function mockCoverLetter(resumeText, jobDescriptionText, tone = 'Professional', length = 'Standard') {
  const { title, company } = extractJobTitleAndCompany(jobDescriptionText);
  const analysis = analyzeATS(resumeText, jobDescriptionText);
  const highlights = analysis.keywords.found.slice(0, 4).map(k => k.name.toUpperCase()) || ['SYSTEM DEVELOPMENT', 'DATA IMPLEMENTATION'];

  const candidate = extractCandidateInfo(resumeText);

  const name = candidate.name;
  const email = candidate.email;
  const phone = candidate.phone;

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Tone adjustments
  let opening = '';
  let body = '';
  let closing = '';

  if (tone === 'Enthusiastic') {
    opening = `I was absolutely thrilled to see the opening for the **${title}** position at **${company}**. As a passionate specialist with a deep admiration for your company's innovative culture, I am eager to bring my expertise to your growing team.`;
    body = `Throughout my career, I have dedicated myself to mastering skills like **${highlights.join(', ') || 'innovative project design'}**. At my previous role, I took initiative to overhaul critical systems, yielding massive improvements in team workflow and customer retention. I am incredibly energized by the prospect of applying these exact methodologies to help **${company}** achieve its upcoming expansion goals.`;
    closing = `I would jump at the opportunity to discuss how my drive and expertise align with your needs. Thank you for your time, energy, and consideration!`;
  } else if (tone === 'Confident') {
    opening = `Please accept this letter as expression of my interest in the **${title}** role at **${company}**. With a strong history of executing high-impact technical initiatives, I am confident in my ability to immediately add value to your organization.`;
    body = `My background is characterized by a strong foundation in **${highlights.join(', ') || 'strategic operations'}**. I specialize in identifying structural inefficiencies and designing scalable, bulletproof solutions. I thrive in high-stakes environments where output and accuracy are paramount, and I look forward to bringing this results-first mindset to **${company}**.`;
    closing = `I look forward to discussing the tangible results I can deliver as part of your team. Thank you for your time.`;
  } else if (tone === 'Minimalist') {
    opening = `I am writing to apply for the **${title}** position at **${company}**. My experience aligns closely with the requirements outlined in your job posting.`;
    body = `Key highlights of my background include my proficiency in **${highlights.join(', ') || 'core architectures'}**, paired with practical experience managing agile development cycles. I focus on clean, efficient execution to drive meaningful product metrics.`;
    closing = `I welcome the chance to speak with you regarding this opportunity. Thank you for your consideration.`;
  } else {
    // Professional (Default)
    opening = `I am writing to express my strong interest in the **${title}** position at **${company}**. With my background in engineering high-quality solutions and managing technical projects, I am eager to contribute to your team's success.`;
    body = `My experience matches the core competencies requested for this role. Specifically, my expertise in **${highlights.join(', ') || 'development operations'}** has enabled me to build durable systems and collaborate across teams to resolve complex problems. I have consistently delivered robust improvements in process performance, user experience, and architecture resilience.`;
    closing = `Thank you for your time and consideration. I look forward to the possibility of discussing how my experience can benefit **${company}**.`;
  }

  // Length adjustments
  let resultText = '';
  if (length === 'Short') {
    resultText = `${name}
${phone} | ${email}
${date}

Hiring Team
${company}

Dear Hiring Team,

${opening}

${body}

${closing}

Sincerely,

${name}`;
  } else if (length === 'Detailed') {
    resultText = `${name}
${phone} | ${email}
${date}

Hiring Team
${company}

Dear Hiring Team,

${opening}

I have closely followed **${company}**'s recent developments and market influence. Your dedication to excellence and client satisfaction resonates with my own professional values. In my previous positions, I have constantly worked at the intersection of technical design and operational efficiency.

Specifically, I have successfully applied **${highlights[0] || 'core technologies'}** to automate manual overhead and **${highlights[1] || 'collaborative standards'}** to align stakeholders. These efforts resulted in direct bottom-line growth and elevated product reliability. In addition to my technical competencies, I pride myself on clear documentation, strong cross-functional communication, and continuous learning.

${body}

I am eager to contribute my capabilities to your outstanding group. Thank you for reviewing my application, and I hope to speak with you soon.

Sincerely,

${name}`;
  } else {
    // Standard
    resultText = `${name}
${phone} | ${email}
${date}

Hiring Team
${company}

Dear Hiring Team,

${opening}

${body}

I am confident that my skill set, combined with my commitment to building high-quality, scalable solutions, makes me a strong fit for **${company}**.

${closing}

Sincerely,

${name}`;
  }

  return resultText;
}
