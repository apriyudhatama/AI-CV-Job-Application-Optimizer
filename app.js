// app.js - Core Resume Optimizer SPA Orchestration
import { analyzeATS, mockRewriteResume, mockCoverLetter } from './mockEngine.js?v=1.0.1';

// Initialize PDF.js
const pdfjsLib = window.pdfjsLib;
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
}

// App State
const state = {
  resumeText: '',
  jobDescription: '',
  analysisResults: null,
  optimizedMarkdown: '',
  coverLetterText: '',
  uploadedFileName: '',
  history: [],
  currentTheme: 'dark'
};

// DOM Elements
const elements = {
  // Sidebar Links
  navItems: document.querySelectorAll('.nav-item'),
  viewPanels: document.querySelectorAll('.view-panel'),
  viewTitle: document.getElementById('view-title'),
  viewSubtitle: document.getElementById('view-subtitle'),
  
  // Theme and API Badge
  themeToggle: document.getElementById('theme-toggle'),
  themeIconLight: document.getElementById('theme-icon-light'),
  themeIconDark: document.getElementById('theme-icon-dark'),
  apiStatusBadge: document.getElementById('api-status-badge'),
  apiStatusText: document.getElementById('api-status-text'),
  
  // Dashboard
  statResumes: document.getElementById('stat-resumes'),
  statAvgScore: document.getElementById('stat-avg-score'),
  statOptimizations: document.getElementById('stat-optimizations'),
  historyTbody: document.getElementById('history-tbody'),
  templates: document.querySelectorAll('.template-item'),
  
  // Optimizer Inputs
  dropzone: document.getElementById('dropzone'),
  fileInput: document.getElementById('file-input'),
  uploadStatusBanner: document.getElementById('upload-status-banner'),
  uploadedFilename: document.getElementById('uploaded-filename'),
  btnRemoveFile: document.getElementById('btn-remove-file'),
  parsedResumeText: document.getElementById('parsed-resume-text'),
  jdText: document.getElementById('jd-text'),
  jdWordCount: document.getElementById('jd-word-count'),
  btnRunAnalysis: document.getElementById('btn-run-analysis'),
  inputSection: document.getElementById('input-section'),
  actionTriggerRow: document.getElementById('action-trigger-row'),
  
  // Optimizer Results
  resultsSection: document.getElementById('results-section'),
  scorePct: document.getElementById('score-pct'),
  scoreRingBar: document.getElementById('score-ring-bar'),
  scoreStatusHeading: document.getElementById('score-status-heading'),
  scoreFeedbackText: document.getElementById('score-feedback-text'),
  valMatchKw: document.getElementById('val-match-kw'),
  valMatchFmt: document.getElementById('val-match-fmt'),
  valMatchHard: document.getElementById('val-match-hard'),
  valMatchExp: document.getElementById('val-match-exp'),
  barMatchKw: document.getElementById('bar-match-kw'),
  barMatchFmt: document.getElementById('bar-match-fmt'),
  barMatchHard: document.getElementById('bar-match-hard'),
  barMatchExp: document.getElementById('bar-match-exp'),
  missingBadgesGrid: document.getElementById('missing-badges-grid'),
  foundBadgesGrid: document.getElementById('found-badges-grid'),
  formattingIssuesContainer: document.getElementById('formatting-issues-container'),
  
  // Optimizer Navigation Action Buttons
  btnBackToInput: document.getElementById('btn-back-to-input'),
  btnGotoCoverLetter: document.getElementById('btn-goto-cover-letter'),
  btnGotoOptimize: document.getElementById('btn-goto-optimize'),
  
  // Rewriter
  btnToggleEditorView: document.getElementById('btn-toggle-editor-view'),
  rewriterOriginalText: document.getElementById('rewriter-original-text'),
  rewriterOptimizedMarkdown: document.getElementById('rewriter-optimized-markdown'),
  resumePaperSheet: document.getElementById('resume-paper-sheet'),
  optimizedEditorCard: document.getElementById('optimized-editor-card'),
  optimizedPreviewCard: document.getElementById('optimized-preview-card'),
  originalWordCount: document.getElementById('original-word-count'),
  optimizedWordCount: document.getElementById('optimized-word-count'),
  btnTriggerReoptimize: document.getElementById('btn-trigger-reoptimize'),
  btnCopyOptimized: document.getElementById('btn-copy-optimized'),
  btnDownloadResumePdf: document.getElementById('btn-download-resume-pdf'),
  
  // Cover Letter
  clTone: document.getElementById('cl-tone'),
  clLength: document.getElementById('cl-length'),
  btnGenerateCl: document.getElementById('btn-generate-cl'),
  coverletterPaperSheet: document.getElementById('coverletter-paper-sheet'),
  btnCopyCl: document.getElementById('btn-copy-cl'),
  btnDownloadClPdf: document.getElementById('btn-download-cl-pdf'),
  
  // Settings
  geminiKey: document.getElementById('gemini-key'),
  btnToggleKeyVisibility: document.getElementById('btn-toggle-key-visibility'),
  eyeIcon: document.getElementById('eye-icon'),
  geminiModel: document.getElementById('gemini-model'),
  btnClearKey: document.getElementById('btn-clear-key'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  
  // Overlays
  loadingOverlay: document.getElementById('loading-overlay'),
  loadingText: document.getElementById('loading-text'),
  toastContainer: document.getElementById('toast-container')
};

// View Subtitles Map for dynamic header updates
const viewMetaData = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Review your progress and optimize new materials.'
  },
  optimizer: {
    title: 'ATS Scanner & Optimizer',
    subtitle: 'Upload your resume and target job listing to audit your compatibility score.'
  },
  rewriter: {
    title: 'AI Resume Rewriter',
    subtitle: 'Refine resume bullets with key vocabulary, active verbs, and target phrases.'
  },
  coverletter: {
    title: 'AI Cover Letter Generator',
    subtitle: 'Generate a highly personalized application introduction tailored to this role.'
  },
  settings: {
    title: 'Configuration Settings',
    subtitle: 'Manage API tokens, model preferences, and sandbox parameters.'
  }
};

// Initialize Application
function init() {
  loadSettings();
  loadHistory();
  setupNavigation();
  setupTheme();
  setupDropzone();
  setupEventListeners();
  updateDashboardStats();
  
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// API Key & Model Configuration
// ==========================================
function loadSettings() {
  const apiKey = localStorage.getItem('gemini_api_key');
  const model = localStorage.getItem('gemini_model');
  
  if (apiKey) {
    elements.geminiKey.value = apiKey;
    elements.apiStatusBadge.classList.remove('offline');
    elements.apiStatusBadge.classList.add('connected');
    elements.apiStatusText.textContent = 'Gemini API Connected';
  } else {
    elements.geminiKey.value = '';
    elements.apiStatusBadge.classList.remove('connected');
    elements.apiStatusBadge.classList.add('offline');
    elements.apiStatusText.textContent = 'Simulation Mode';
  }
  
  if (model) {
    elements.geminiModel.value = model;
  }
}

function saveSettings() {
  const key = elements.geminiKey.value.trim();
  const model = elements.geminiModel.value;
  
  if (key) {
    localStorage.setItem('gemini_api_key', key);
    showToast('API Key saved successfully.', 'success');
  } else {
    localStorage.removeItem('gemini_api_key');
    showToast('API Key cleared. App switched to simulation mode.', 'info');
  }
  
  localStorage.setItem('gemini_model', model);
  loadSettings();
}

function clearSettings() {
  elements.geminiKey.value = '';
  localStorage.removeItem('gemini_api_key');
  loadSettings();
  showToast('API Configuration reset.', 'info');
}

// Toggle Visibility of API Key Field
let keyVisible = false;
function toggleKeyVisibility() {
  keyVisible = !keyVisible;
  elements.geminiKey.type = keyVisible ? 'text' : 'password';
  if (keyVisible) {
    elements.eyeIcon.setAttribute('data-lucide', 'eye-off');
  } else {
    elements.eyeIcon.setAttribute('data-lucide', 'eye');
  }
  if (window.lucide) window.lucide.createIcons();
}

// Check if Gemini API is configured
function isAPIConfigured() {
  return !!localStorage.getItem('gemini_api_key');
}

// ==========================================
// Theme Management (Light / Dark)
// ==========================================
function setupTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  if (theme === 'light') {
    elements.themeIconLight.style.display = 'block';
    elements.themeIconDark.style.display = 'none';
  } else {
    elements.themeIconLight.style.display = 'none';
    elements.themeIconDark.style.display = 'block';
  }
}

function toggleTheme() {
  const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
}

// ==========================================
// SPA Router & Navigation
// ==========================================
function setupNavigation() {
  // Navigation sidebar handler
  elements.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      navigateToView(targetView);
    });
  });

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && viewMetaData[hash]) {
      navigateToView(hash);
    }
  });

  // Load initial view from hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && viewMetaData[initialHash]) {
    navigateToView(initialHash);
  } else {
    navigateToView('dashboard');
  }
}

function navigateToView(viewId) {
  // Update nav list visual active states
  elements.navItems.forEach(item => {
    if (item.getAttribute('data-view') === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Swap panels
  elements.viewPanels.forEach(panel => {
    if (panel.id === viewId) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Update Header text content
  const meta = viewMetaData[viewId];
  if (meta) {
    elements.viewTitle.textContent = meta.title;
    elements.viewSubtitle.textContent = meta.subtitle;
  }

  // Update window hash
  window.location.hash = viewId;

  // Render contents if needed
  if (viewId === 'rewriter') {
    renderRewriterView();
  }
}

// ==========================================
// Drag & Drop / PDF File Parsing
// ==========================================
function setupDropzone() {
  const zone = elements.dropzone;
  const input = elements.fileInput;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadedFile(files[0]);
    }
  });

  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      handleUploadedFile(input.files[0]);
    }
  });

  elements.btnRemoveFile.addEventListener('click', removeUploadedFile);
}

async function handleUploadedFile(file) {
  if (file.type !== 'application/pdf') {
    showToast('Invalid file format. Please upload a PDF resume.', 'error');
    return;
  }

  showLoader('Extracting text from PDF...');
  state.uploadedFileName = file.name;
  
  try {
    const text = await extractTextFromPDF(file);
    state.resumeText = text;
    
    // Update inputs
    elements.parsedResumeText.value = text;
    elements.uploadedFilename.textContent = file.name;
    elements.dropzone.style.display = 'none';
    elements.uploadStatusBanner.style.display = 'flex';
    
    showToast('PDF resume parsed successfully.', 'success');
    validateInputs();
  } catch (error) {
    console.error('PDF parsing error:', error);
    showToast('Failed to parse PDF text. Please copy/paste text directly.', 'error');
    removeUploadedFile();
  } finally {
    hideLoader();
  }
}

function removeUploadedFile() {
  state.resumeText = '';
  state.uploadedFileName = '';
  elements.parsedResumeText.value = '';
  elements.fileInput.value = '';
  elements.dropzone.style.display = 'flex';
  elements.uploadStatusBanner.style.display = 'none';
  validateInputs();
}

/**
 * Reads PDF content on the client side.
 */
function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        resolve(fullText.trim());
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

// Input values validator
function validateInputs() {
  const resumeOk = elements.parsedResumeText.value.trim().length > 50;
  const jdOk = elements.jdText.value.trim().length > 50;
  
  elements.btnRunAnalysis.disabled = !(resumeOk && jdOk);
}

// ==========================================
// ATS Analysis Process (Local vs Gemini)
// ==========================================
async function runATSAnalysis() {
  state.resumeText = elements.parsedResumeText.value.trim();
  state.jobDescription = elements.jdText.value.trim();
  
  if (!state.resumeText || !state.jobDescription) return;

  showLoader('Auditing resume ATS compatibility...');

  try {
    if (isAPIConfigured()) {
      state.analysisResults = await runGeminiAnalysis(state.resumeText, state.jobDescription);
    } else {
      // Offline local analysis
      state.analysisResults = analyzeATS(state.resumeText, state.jobDescription);
    }
    
    // Save optimization record in history
    saveToHistory();
    
    // Render Results layout
    renderAnalysisResults();
    
    // Switch to output section view container
    elements.inputSection.style.display = 'none';
    elements.actionTriggerRow.style.display = 'none';
    elements.resultsSection.style.display = 'flex';
    
    showToast('Analysis completed successfully.', 'success');
  } catch (error) {
    console.error('Analysis error:', error);
    showToast(`Audit failed: ${error.message}. Running fallback local scanning...`, 'warning');
    
    // Automatic fallback to local
    state.analysisResults = analyzeATS(state.resumeText, state.jobDescription);
    saveToHistory();
    renderAnalysisResults();
    elements.inputSection.style.display = 'none';
    elements.actionTriggerRow.style.display = 'none';
    elements.resultsSection.style.display = 'flex';
  } finally {
    hideLoader();
  }
}

// Reset results and go back to editor input fields
function backToInput() {
  elements.resultsSection.style.display = 'none';
  elements.inputSection.style.display = 'grid';
  elements.actionTriggerRow.style.display = 'flex';
}

function renderAnalysisResults() {
  const results = state.analysisResults;
  if (!results) return;

  // 1. Overall Score Ring Animation
  elements.scorePct.textContent = results.overallScore;
  
  // Calculate SVG stroke math: circle radius is 50, circumference is 2 * pi * 50 = 314.16
  const circ = 314.16;
  const offset = circ - (results.overallScore / 100) * circ;
  elements.scoreRingBar.style.strokeDashoffset = offset;
  
  // Assign score colors
  let scoreClass = 'score-low';
  let strokeColor = 'var(--error)';
  let feedback = 'Your resume requires optimization to align with the ATS parameters of this posting.';
  
  if (results.overallScore >= 80) {
    scoreClass = 'score-high';
    strokeColor = 'var(--success)';
    feedback = 'Outstanding match! Your profile is highly compatible with the target requirements.';
  } else if (results.overallScore >= 50) {
    scoreClass = 'score-mid';
    strokeColor = 'var(--warning)';
    feedback = 'Moderate match. Adding targeted missing keywords will boost your visibility.';
  }
  
  elements.scoreRingBar.style.stroke = strokeColor;
  elements.scoreStatusHeading.textContent = `ATS Match Score: ${results.overallScore}%`;
  elements.scoreFeedbackText.textContent = feedback;

  // 2. Score breakdowns
  elements.valMatchKw.textContent = `${results.breakdown.keywordMatch}%`;
  elements.barMatchKw.style.width = `${results.breakdown.keywordMatch}%`;
  
  elements.valMatchFmt.textContent = `${results.breakdown.formatting}%`;
  elements.barMatchFmt.style.width = `${results.breakdown.formatting}%`;
  
  elements.valMatchHard.textContent = `${results.breakdown.hardSkills}%`;
  elements.barMatchHard.style.width = `${results.breakdown.hardSkills}%`;
  
  elements.valMatchExp.textContent = `${results.breakdown.experience}%`;
  elements.barMatchExp.style.width = `${results.breakdown.experience}%`;

  // 3. Keyword Badges
  elements.missingBadgesGrid.innerHTML = '';
  if (results.keywords.missing.length === 0) {
    elements.missingBadgesGrid.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">No critical missing keywords. Splendid!</span>`;
  } else {
    results.keywords.missing.forEach(kw => {
      const badge = document.createElement('span');
      badge.className = 'keyword-badge missing';
      badge.innerHTML = `<i data-lucide="plus-circle" style="width:12px; height:12px;"></i> ${kw.name}`;
      elements.missingBadgesGrid.appendChild(badge);
    });
  }

  elements.foundBadgesGrid.innerHTML = '';
  if (results.keywords.found.length === 0) {
    elements.foundBadgesGrid.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">No matching keywords found yet.</span>`;
  } else {
    results.keywords.found.forEach(kw => {
      const badge = document.createElement('span');
      badge.className = 'keyword-badge found';
      badge.innerHTML = `<i data-lucide="check-circle" style="width:12px; height:12px;"></i> ${kw.name}`;
      elements.foundBadgesGrid.appendChild(badge);
    });
  }

  // 4. Formatting Issues Scan List
  elements.formattingIssuesContainer.innerHTML = '';
  if (results.formattingIssues.length === 0) {
    elements.formattingIssuesContainer.innerHTML = `
      <div class="issue-item low" style="border-left-color: var(--success); background-color: var(--success-bg);">
        <div class="issue-icon" style="color:var(--success);"><i data-lucide="shield-check"></i></div>
        <div class="issue-content">
          <div class="issue-title" style="color:var(--success);">ATS Format Clean</div>
          <div class="issue-desc">Our analyzer detected no critical formatting or structure errors in this resume.</div>
        </div>
      </div>
    `;
  } else {
    results.formattingIssues.forEach(issue => {
      const card = document.createElement('div');
      card.className = `issue-item ${issue.severity}`;
      
      let icon = 'alert-circle';
      if (issue.severity === 'high') icon = 'shield-alert';
      
      card.innerHTML = `
        <div class="issue-icon"><i data-lucide="${icon}"></i></div>
        <div class="issue-content">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-desc">${issue.desc}</div>
        </div>
      `;
      elements.formattingIssuesContainer.appendChild(card);
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

// Call Gemini API for ATS Scan
async function runGeminiAnalysis(resume, jd) {
  const model = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
  const prompt = `Analyze this candidate's Resume against the Job Description.

Resume Text:
${resume}

Job Description:
${jd}

You MUST return a JSON object with this exact schema:
{
  "overallScore": number (0 to 100),
  "breakdown": {
    "keywordMatch": number (0 to 100),
    "formatting": number (0 to 100),
    "hardSkills": number (0 to 100),
    "softSkills": number (0 to 100),
    "experience": number (0 to 100)
  },
  "keywords": {
    "found": [
      { "name": "found keyword 1", "type": "Technical Skill | Soft Skill | Domain Competency" }
    ],
    "missing": [
      { "name": "missing keyword 1", "type": "Technical Skill | Soft Skill | Domain Competency" }
    ]
  },
  "formattingIssues": [
    { "severity": "high | medium | low", "title": "short issue title", "desc": "detailed layout advice" }
  ]
}`;

  const responseText = await callGeminiAPI(prompt, "You are a professional ATS scanner. Analyze the documents and return ONLY raw JSON.");
  
  // Parse response
  try {
    // Strip markdown code block wrappers if present
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', responseText);
    throw new Error('Invalid JSON format returned from Gemini model.');
  }
}

// ==========================================
// AI Resume Rewriting
// ==========================================
async function optimizeResume() {
  if (!state.resumeText || !state.jobDescription) {
    showToast('Please run the ATS Audit first.', 'warning');
    return;
  }

  showLoader('Optimizing resume bullets and structure...');
  navigateToView('rewriter');

  try {
    if (isAPIConfigured()) {
      state.optimizedMarkdown = await runGeminiOptimizer(state.resumeText, state.jobDescription);
    } else {
      // Local fallback
      state.optimizedMarkdown = mockRewriteResume(state.resumeText, state.jobDescription);
    }
    
    // Update dashboard metrics count
    let rewritesCount = parseInt(localStorage.getItem('stat_optimizations') || '0', 10);
    localStorage.setItem('stat_optimizations', rewritesCount + 1);
    updateDashboardStats();

    renderRewriterView();
    showToast('CV optimization complete.', 'success');
  } catch (error) {
    console.error('Optimization error:', error);
    showToast(`Optimization failed: ${error.message}. Running fallback...`, 'warning');
    state.optimizedMarkdown = mockRewriteResume(state.resumeText, state.jobDescription);
    renderRewriterView();
  } finally {
    hideLoader();
  }
}

async function runGeminiOptimizer(resume, jd) {
  const prompt = `You are a professional Executive resume writer. Review the Candidate's Resume and tailor it to the target Job Description.

Original Resume:
${resume}

Target Job Description:
${jd}

Instructions:
1. Revise the Professional Summary to grab attention and align with the target title.
2. Optimize bullet points in the Work Experience section. Inject missing keywords naturally, start each bullet with an active verb, and format them using the STAR framework (Situation, Task, Action, Result) with quantitative metrics.
3. Organize the layout with clear section headers like PROFESSIONAL SUMMARY, CORE SKILLS, EXPERIENCE, and EDUCATION.
4. Format the final CV strictly as clean, professional Markdown. Do not add conversational headers or footers, start directly with the candidate's name.`;

  return await callGeminiAPI(prompt, "You are a professional Executive Resume Tailor. Return ONLY clean markdown formatting.");
}

function renderRewriterView() {
  elements.rewriterOriginalText.value = state.resumeText || 'No original resume text uploaded.';
  elements.rewriterOptimizedMarkdown.value = state.optimizedMarkdown || '';
  
  // Calculate word counts
  const origWords = state.resumeText ? state.resumeText.split(/\s+/).filter(Boolean).length : 0;
  const optWords = state.optimizedMarkdown ? state.optimizedMarkdown.split(/\s+/).filter(Boolean).length : 0;
  elements.originalWordCount.textContent = `${origWords} words`;
  elements.optimizedWordCount.textContent = `${optWords} words`;

  // Render Preview Sheet (translating simple markdown headings to printable HTML)
  renderMarkdownToPaper(state.optimizedMarkdown || '', elements.resumePaperSheet);
}

// Convert basic markdown formatting into clean HTML elements on the printable A4 preview
function renderMarkdownToPaper(markdown, paperElement) {
  if (!markdown) {
    paperElement.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding-top: 50px;">Optimization in progress or empty resume...</div>`;
    return;
  }

  // Basic markdown compiler
  let html = markdown
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^\-\s+(.+)$/gm, '<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\s*\n/g, '<p></p>');

  // Wrap contiguous lines of <li> in <ul>
  let lines = html.split('\n');
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('<li>')) {
      if (!inList) {
        lines[i] = '<ul>' + lines[i];
        inList = true;
      }
    } else {
      if (inList) {
        lines[i - 1] = lines[i - 1] + '</ul>';
        inList = false;
      }
    }
  }
  if (inList) {
    lines[lines.length - 1] = lines[lines.length - 1] + '</ul>';
  }
  html = lines.join('\n');
  
  // Clean empty paragraphs
  html = html.replace(/<p><\/p>/g, '<div style="height:10px;"></div>');

  paperElement.innerHTML = html;
}

// Toggle between Split-Screen Code Editor and Clean Printable Preview layout
let isPreviewMode = false;
function toggleEditorPreview() {
  isPreviewMode = !isPreviewMode;
  if (isPreviewMode) {
    elements.optimizedEditorCard.style.display = 'none';
    elements.optimizedPreviewCard.style.display = 'flex';
    elements.btnToggleEditorView.innerHTML = `<i data-lucide="edit-3"></i> Edit Markdown`;
    
    // Sync paper HTML back to markdown when switching
    state.optimizedMarkdown = elements.rewriterOptimizedMarkdown.value;
    renderMarkdownToPaper(state.optimizedMarkdown, elements.resumePaperSheet);
  } else {
    elements.optimizedEditorCard.style.display = 'flex';
    elements.optimizedPreviewCard.style.display = 'none';
    elements.btnToggleEditorView.innerHTML = `<i data-lucide="eye"></i> Toggle Printable Preview`;
    
    // Sync raw text from paper contenteditable back to editor
    if (elements.resumePaperSheet.innerText.trim()) {
      // Keep changes made during visual review
      // We can convert HTML back or just keep current markdown if they didn't touch it.
      // For simplicity, we just display the markdown editor.
    }
  }
  if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// Cover Letter Generation
// ==========================================
async function generateCoverLetter() {
  if (!state.resumeText || !state.jobDescription) {
    showToast('Please upload a resume and paste job description in ATS Optimizer first.', 'warning');
    navigateToView('optimizer');
    return;
  }

  showLoader('Drafting tailored cover letter...');
  navigateToView('coverletter');

  const tone = elements.clTone.value;
  const length = elements.clLength.value;

  try {
    if (isAPIConfigured()) {
      state.coverLetterText = await runGeminiCoverLetter(state.resumeText, state.jobDescription, tone, length);
    } else {
      // Local templates
      state.coverLetterText = mockCoverLetter(state.resumeText, state.jobDescription, tone, length);
    }

    renderCoverLetterView();
    showToast('Cover letter generated.', 'success');
  } catch (error) {
    console.error('Cover letter generation error:', error);
    showToast(`Draft failed: ${error.message}. Running fallback...`, 'warning');
    state.coverLetterText = mockCoverLetter(state.resumeText, state.jobDescription, tone, length);
    renderCoverLetterView();
  } finally {
    hideLoader();
  }
}

async function runGeminiCoverLetter(resume, jd, tone, length) {
  const prompt = `Write a professional Cover Letter based on the applicant's resume details and the target Job Description.

Candidate Resume Details:
${resume}

Target Job Description:
${jd}

Style Requirements:
1. Tone: ${tone} (Options: Professional, Enthusiastic, Confident, Minimalist). Align writing style closely.
2. Length: ${length} (Options: Short, Standard, Detailed).
3. Do not include placeholder brackets like [Company Name] or [Your Name]. If information is missing, extract logical guesses from the resume or make it read naturally without placeholders (e.g. use "your esteemed organization" or write a cohesive closing name based on the resume).
4. Return ONLY the letter body ready to be signed.`;

  return await callGeminiAPI(prompt, "You are a professional HR Career Advisor. Return the plain text cover letter with proper business block letter margins.");
}

function renderCoverLetterView() {
  elements.coverletterPaperSheet.innerHTML = state.coverLetterText.replace(/\n/g, '<br>');
  // Make it editable
  elements.coverletterPaperSheet.setAttribute('contenteditable', 'true');
}

// ==========================================
// Export Utilities (PDF & Copy)
// ==========================================
function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (!text) {
    showToast('No content to copy.', 'warning');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg, 'success');
  }).catch(err => {
    console.error('Clipboard copy failed:', err);
    showToast('Failed to copy text.', 'error');
  });
}

/**
 * High-quality client-side PDF Export.
 */
function downloadPDF(elementId, defaultFilename) {
  const element = document.getElementById(elementId);
  if (!element || !element.innerText.trim()) {
    showToast('No document content to export.', 'warning');
    return;
  }

  showLoader('Generating printable PDF...');
  
  // Set print layout context
  document.body.classList.add('print-view-active');
  element.classList.add('print-view-active');

  const opt = {
    margin: 15,
    filename: defaultFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Convert A4 paper sheet element
  window.html2pdf().from(element).set(opt).save().then(() => {
    document.body.classList.remove('print-view-active');
    element.classList.remove('print-view-active');
    hideLoader();
    showToast('PDF downloaded successfully.', 'success');
  }).catch(err => {
    console.error('PDF export failed:', err);
    document.body.classList.remove('print-view-active');
    element.classList.remove('print-view-active');
    hideLoader();
    showToast('PDF compilation failed. Opening standard print window instead.', 'info');
    window.print();
  });
}

// ==========================================
// Live Gemini API Direct Invocation
// ==========================================
async function callGeminiAPI(prompt, systemInstruction = '') {
  const apiKey = localStorage.getItem('gemini_api_key');
  const model = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';
  
  if (!apiKey) throw new Error('Gemini API key is not configured.');

  // official developer generateContent endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  // Request JSON response type if prompt targets structure data
  if (prompt.includes('JSON') || systemInstruction.includes('JSON')) {
    payload.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errObj = await response.json().catch(() => ({}));
    throw new Error(errObj.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text;
  }
  
  throw new Error('API returned an empty content candidate.');
}

// ==========================================
// Dashboard History & Persistence
// ==========================================
function loadHistory() {
  const saved = localStorage.getItem('optimizations_history');
  if (saved) {
    state.history = JSON.parse(saved);
  } else {
    state.history = [];
  }
  renderHistoryTable();
}

function saveToHistory() {
  const results = state.analysisResults;
  if (!results) return;

  const jobDetails = analyzeJDRole(state.jobDescription);
  
  const newItem = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    filename: state.uploadedFileName || 'Pasted Text Resume',
    role: jobDetails.role,
    company: jobDetails.company,
    score: results.overallScore,
    resumeText: state.resumeText,
    jobDescription: state.jobDescription
  };

  // Prepend to list
  state.history.unshift(newItem);
  // Cap at 10 items
  if (state.history.length > 10) state.history.pop();
  
  localStorage.setItem('optimizations_history', JSON.stringify(state.history));
  
  // Increment parsed count
  let parseCount = parseInt(localStorage.getItem('stat_resumes') || '0', 10);
  localStorage.setItem('stat_resumes', parseCount + 1);

  renderHistoryTable();
  updateDashboardStats();
}

function renderHistoryTable() {
  const tbody = elements.historyTbody;
  if (state.history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem 0;">
          No optimized resumes yet. Click "ATS Optimizer" to start!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  state.history.forEach(item => {
    const tr = document.createElement('tr');
    
    let scoreBadgeClass = 'score-low';
    if (item.score >= 80) scoreBadgeClass = 'score-high';
    else if (item.score >= 50) scoreBadgeClass = 'score-mid';
    
    tr.innerHTML = `
      <td>${item.date}</td>
      <td><span style="font-weight:600; color:var(--text-primary);">${item.filename}</span></td>
      <td>${item.role} <span style="color:var(--text-muted); font-size:0.8rem;">at ${item.company}</span></td>
      <td><span class="score-badge ${scoreBadgeClass}">${item.score}%</span></td>
      <td>
        <button class="btn btn-secondary btn-sm btn-load-history" data-id="${item.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
          Load Audit
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach load listeners
  document.querySelectorAll('.btn-load-history').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      loadHistoryItem(id);
    });
  });
}

function loadHistoryItem(id) {
  const item = state.history.find(h => h.id === id);
  if (!item) return;

  state.resumeText = item.resumeText;
  state.jobDescription = item.jobDescription;
  
  // Pre-fill inputs
  elements.parsedResumeText.value = item.resumeText;
  elements.jdText.value = item.jobDescription;
  
  if (item.filename !== 'Pasted Text Resume') {
    elements.uploadedFilename.textContent = item.filename;
    state.uploadedFileName = item.filename;
    elements.dropzone.style.display = 'none';
    elements.uploadStatusBanner.style.display = 'flex';
  } else {
    removeUploadedFile();
  }

  validateInputs();
  
  // Re-run standard mock scan or live calculation based on history scores
  state.analysisResults = analyzeATS(item.resumeText, item.jobDescription);
  
  // Render results view immediately
  renderAnalysisResults();
  elements.inputSection.style.display = 'none';
  elements.actionTriggerRow.style.display = 'none';
  elements.resultsSection.style.display = 'flex';
  
  navigateToView('optimizer');
  showToast(`Loaded optimization for ${item.role}.`, 'info');
}

function updateDashboardStats() {
  const resumesCount = localStorage.getItem('stat_resumes') || '0';
  const rewritesCount = localStorage.getItem('stat_optimizations') || '0';
  
  elements.statResumes.textContent = resumesCount;
  elements.statOptimizations.textContent = rewritesCount;
  
  if (state.history.length > 0) {
    const sum = state.history.reduce((a, b) => a + b.score, 0);
    const avg = Math.round(sum / state.history.length);
    elements.statAvgScore.textContent = `${avg}%`;
  } else {
    elements.statAvgScore.textContent = '--%';
  }
}

// Helper to guess role & company from JD text for logging
function analyzeJDRole(jdText) {
  const cleaned = jdText.toLowerCase();
  let role = 'Professional';
  let company = 'Target Company';
  
  const roles = ['software engineer', 'product manager', 'data analyst', 'marketer', 'designer', 'developer'];
  for (const r of roles) {
    if (cleaned.includes(r)) {
      role = r.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  const compMatch = jdText.match(/at\s+([A-Z][a-zA-Z0-9\s]+?)(?:\s+is|\.|\,)/);
  if (compMatch && compMatch[1]) {
    company = compMatch[1].trim();
  }

  return { role, company };
}

// ==========================================
// Event Listeners setup
// ==========================================
function setupEventListeners() {
  // Inputs modification validators
  elements.parsedResumeText.addEventListener('input', validateInputs);
  elements.jdText.addEventListener('input', () => {
    validateInputs();
    
    // Character and word counting for Job description
    const count = elements.jdText.value.split(/\s+/).filter(Boolean).length;
    elements.jdWordCount.textContent = `${count} words`;
  });

  // Action audits
  elements.btnRunAnalysis.addEventListener('click', runATSAnalysis);
  elements.btnBackToInput.addEventListener('click', backToInput);
  elements.btnGotoOptimize.addEventListener('click', optimizeResume);
  elements.btnGotoCoverLetter.addEventListener('click', generateCoverLetter);
  
  // Rewriter actions
  elements.btnToggleEditorView.addEventListener('click', toggleEditorPreview);
  elements.btnTriggerReoptimize.addEventListener('click', optimizeResume);
  elements.btnCopyOptimized.addEventListener('click', () => {
    const isPrint = elements.optimizedPreviewCard.style.display === 'flex';
    const textToCopy = isPrint ? elements.resumePaperSheet.innerText : elements.rewriterOptimizedMarkdown.value;
    copyToClipboard(textToCopy, 'Resume text copied to clipboard!');
  });
  elements.btnDownloadResumePdf.addEventListener('click', () => {
    // Sync the current markdown text to the paper sheet first
    state.optimizedMarkdown = elements.rewriterOptimizedMarkdown.value;
    renderMarkdownToPaper(state.optimizedMarkdown, elements.resumePaperSheet);
    
    // Generate PDF from the resume preview sheet
    downloadPDF('resume-paper-sheet', 'Tailored_Resume.pdf');
  });

  // Track live edits in rewriter markdown editor to update word counts and state
  elements.rewriterOptimizedMarkdown.addEventListener('input', () => {
    state.optimizedMarkdown = elements.rewriterOptimizedMarkdown.value;
    const optWords = state.optimizedMarkdown.split(/\s+/).filter(Boolean).length;
    elements.optimizedWordCount.textContent = `${optWords} words`;
  });

  // Cover Letter actions
  elements.btnGenerateCl.addEventListener('click', generateCoverLetter);
  elements.btnCopyCl.addEventListener('click', () => {
    copyToClipboard(elements.coverletterPaperSheet.innerText, 'Cover letter copied!');
  });
  elements.btnDownloadClPdf.addEventListener('click', () => {
    downloadPDF('coverletter-paper-sheet', 'Tailored_Cover_Letter.pdf');
  });

  // Settings handlers
  elements.btnSaveSettings.addEventListener('click', saveSettings);
  elements.btnClearKey.addEventListener('click', clearSettings);
  elements.btnToggleKeyVisibility.addEventListener('click', toggleKeyVisibility);
  elements.themeToggle.addEventListener('click', toggleTheme);

  // Template Quick fill configurations
  elements.templates.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-template');
      fillWithTemplate(type);
    });
  });
}

// Prefills sandbox database data for fast audits
function fillWithTemplate(type) {
  const templatesData = {
    swe: {
      resume: `JOHN SMITH
john.smith@email.com | (555) 987-6543 | New York, NY
github.com/johnsmith | linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Mid-level software engineer with 4 years of experience writing web applications. Experienced in JavaScript and building websites. Looking for a new challenge in React development.

TECHNICAL SKILLS
Languages: HTML, CSS, JavaScript
Frameworks: React, jQuery
Tools: Git, VS Code

EXPERIENCE
Software Engineer | AppDesign Co | 2022 - Present
- Built and shipped UI components for our client web portals using JavaScript and React.
- Fixed front-end bugs and styling issues to improve page loading.
- Collaborated with design teams to structure new website mockups.

Junior Web Developer | SiteBuilders LLC | 2020 - 2022
- Maintained legacy sites built on jQuery and Bootstrap.
- Optimized image files and scripts to improve performance.
- Written automated testing suites using Jest.

EDUCATION
B.S. in Computer Science | City College of New York`,
      jd: `We are looking for a Senior Software Engineer with strong experience in React, TypeScript, and modern state management.

Key Responsibilities:
- Design, architect, and implement high-performance front-end systems using TypeScript, Next.js, and React.
- Lead CI/CD pipeline deployments and automate container workflows using Docker and AWS.
- Mentor junior engineers, conduct code reviews, and drive agile scrum sprints.
- Collaborate with Product Managers to translate requirements into detailed system designs.

Required Skills:
- 5+ years of software development experience.
- Expert-level TypeScript, Next.js, Redux, Node.js, and GraphQL.
- Strong knowledge of AWS cloud deployments, Docker, and Kubernetes.
- Excellent communication and cross-functional collaboration skills.`
    },
    pm: {
      resume: `SARAH CONNOR
sarah.connor@email.com | (555) 777-8888 | Seattle, WA

SUMMARY
Product Associate with 3 years of experience. Assisting project execution, writing specifications, and coordinating development sprints.

SKILLS
Agile, Scrum, Jira, Trello, Wireframing, Excel

EXPERIENCE
Associate Product Manager | RetailTech | 2023 - Present
- Maintained Jira tickets and prioritised feature backlogs.
- Documented user stories and created wireframes in Figma.
- Coordinated weekly team sprint standups.

Product Operations Specialist | SalesGrow | 2021 - 2023
- Gathered client feedback and prepared data reports for leadership.
- Supported training materials for new features.

EDUCATION
B.A. in Business Administration | University of Washington`,
      jd: `We are seeking a Product Manager to take ownership of our core platform strategy, product roadmaps, and lifecycle delivery.

Responsibilities:
- Define product strategy, create detailed product roadmaps, and set OKRs and KPIs.
- Drive agile scrum processes, manage backlog grooming, and write clear user stories.
- Run user research and market analysis to identify new growth loops and MVP priorities.
- Champion cross-functional collaboration between design, engineering, and sales.

Qualifications:
- 3+ years experience as a Product Manager.
- Proven track record of launching successful MVPs.
- Expert with Jira, Confluence, Figma, and data analytics tools like Mixpanel.`
    },
    da: {
      resume: `MARK JONES
mark.jones@email.com | (555) 222-3333 | Boston, MA

SUMMARY
Detail-oriented analyst with 2 years of experience. Experienced in writing SQL queries and building Excel charts.

SKILLS
SQL, Excel, PowerPoint, Python basics

EXPERIENCE
Junior Analyst | CoreMetrics | 2024 - Present
- Queried databases using SQL to extract transaction reports.
- Created monthly PowerPoint slides showing corporate sales.
- Assisted database cleanup tasks.

EDUCATION
B.S. in Mathematics | Boston University`,
      jd: `We are seeking a Data Analyst to join our Business Intelligence team to build ETL pipelines and predictive models.

Responsibilities:
- Write optimized SQL queries and manage data pipelines (ETL/ELT).
- Build interactive dashboards in Tableau and Power BI for stakeholders.
- Perform A/B testing and statistical analysis to drive growth metrics.
- Program scripts in Python (using Pandas and NumPy) for predictive modeling.

Requirements:
- Strong SQL proficiency and experience with data warehousing.
- Experience with Tableau, looker, and data modeling.
- Basic understanding of regression and machine learning concepts.`
    },
    mkt: {
      resume: `LISA DAVIS
lisa.davis@email.com | (555) 444-5555 | Austin, TX

SUMMARY
Marketing coordinator with 3 years of social media experience. Experienced in writing newsletters and managing Instagram ads.

SKILLS
Social Media, Mailchimp, Canva, Copywriting

EXPERIENCE
Marketing Coordinator | StyleBrand | 2023 - Present
- Drafted social media posts and scheduled newsletters using Mailchimp.
- Analyzed traffic patterns using basic Google Analytics.
- Organized local brand events.

EDUCATION
B.A. in Communications | UT Austin`,
      jd: `We are hiring a Growth Marketing Specialist to drive user acquisition via SEO, SEM, and PPC paid advertising.

Responsibilities:
- Architect and execute SEM and SEO content strategies to increase organic search ranks.
- Design, budget, and test Facebook Ads and Google Ads paid acquisition campaigns.
- Conduct conversion rate optimization (CRO) and analyze user behavior in Google Analytics.
- Collaborate with creative teams to optimize email marketing lead generation funnels.`
    }
  };

  const selected = templatesData[type];
  if (selected) {
    elements.parsedResumeText.value = selected.resume;
    elements.jdText.value = selected.jd;
    
    // Clear any previous file uploads
    removeUploadedFile();
    
    // Update word count indicator
    const count = selected.jd.split(/\s+/).filter(Boolean).length;
    elements.jdWordCount.textContent = `${count} words`;
    
    validateInputs();
    navigateToView('optimizer');
    showToast(`Template filled. Ready for ATS Audit.`, 'info');
  }
}

// ==========================================
// Toast & Loader Overlays UI helpers
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast`;
  
  let iconName = 'info';
  let borderStyle = 'var(--brand-indigo)';
  
  if (type === 'success') {
    iconName = 'check-circle';
    borderStyle = 'var(--success)';
  } else if (type === 'warning') {
    iconName = 'alert-triangle';
    borderStyle = 'var(--warning)';
  } else if (type === 'error') {
    iconName = 'shield-alert';
    borderStyle = 'var(--error)';
  }
  
  toast.style.borderLeftColor = borderStyle;
  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
  
  elements.toastContainer.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  // Fade out
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

function showLoader(message = 'Analyzing...') {
  elements.loadingText.textContent = message;
  elements.loadingOverlay.style.display = 'flex';
}

function hideLoader() {
  elements.loadingOverlay.style.display = 'none';
}

// Boot application on DOM ready
document.addEventListener('DOMContentLoaded', init);
