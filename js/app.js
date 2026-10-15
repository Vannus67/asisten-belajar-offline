// Main Application Controller (Pure Vanilla JavaScript)
(function () {
  // Application State
  const state = {
    activeDocuments: [],
    chatHistory: [],
    theme: localStorage.getItem('aura_theme') || 'dark',
    sidebarOpen: window.innerWidth > 768,
    activeTab: 'chat',
    currentQuizIndex: 0
  };

  // DOM Elements
  const elements = {
    appRoot: document.getElementById('app-root'),
    sidebar: document.getElementById('app-sidebar'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    btnToggleTheme: document.getElementById('btn-toggle-theme'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    btnClearChat: document.getElementById('btn-clear-chat'),
    fileInput: document.getElementById('file-input'),
    btnHeaderUpload: document.getElementById('btn-header-upload'),
    btnSidebarUpload: document.getElementById('btn-sidebar-upload'),
    btnAttachFile: document.getElementById('btn-attach-file'),
    btnLoadSample: document.getElementById('btn-load-sample'),
    headerDocText: document.getElementById('header-doc-text'),
    sidebarDocCount: document.getElementById('sidebar-doc-count'),
    documentsContainer: document.getElementById('documents-container'),
    emptyDocsPlaceholder: document.getElementById('empty-docs-placeholder'),
    chatMessages: document.getElementById('chat-messages'),
    welcomeCard: document.getElementById('welcome-card'),
    starterChips: document.getElementById('starter-chips'),
    chatForm: document.getElementById('chat-form'),
    promptInput: document.getElementById('prompt-input'),
    btnSendPrompt: document.getElementById('btn-send-prompt'),
    activeIntentHint: document.getElementById('active-intent-hint'),
    docModal: document.getElementById('doc-modal'),
    modalDocTitle: document.getElementById('modal-doc-title'),
    modalDocMeta: document.getElementById('modal-doc-meta'),
    modalDocBody: document.getElementById('modal-doc-body'),
    btnCloseDocModal: document.getElementById('btn-close-doc-modal'),
    citationModal: document.getElementById('citation-modal'),
    citationModalTitle: document.getElementById('citation-modal-title'),
    citationModalBody: document.getElementById('citation-modal-body'),
    btnCloseCitationModal: document.getElementById('btn-close-citation-modal'),

    // Tabs & Views
    tabBtnChat: document.getElementById('tab-btn-chat'),
    tabBtnQuiz: document.getElementById('tab-btn-quiz'),
    viewChat: document.getElementById('view-chat'),
    viewQuiz: document.getElementById('view-quiz'),

    // Quiz Studio Elements
    quizDocSelect: document.getElementById('quiz-doc-select'),
    quizTypeSelect: document.getElementById('quiz-type-select'),
    quizCountSelect: document.getElementById('quiz-count-select'),
    quizTopicInput: document.getElementById('quiz-topic-input'),
    btnGenerateQuiz: document.getElementById('btn-generate-quiz'),
    quizSetupCard: document.getElementById('quiz-setup-card'),
    quizPlayerCard: document.getElementById('quiz-player-card'),
    quizQuestionCounter: document.getElementById('quiz-question-counter'),
    quizScoreTracker: document.getElementById('quiz-score-tracker'),
    quizQuestionTitle: document.getElementById('quiz-question-title'),
    quizOptionsList: document.getElementById('quiz-options-list'),
    quizExplanationBox: document.getElementById('quiz-explanation-box'),
    quizExplanationStatus: document.getElementById('quiz-explanation-status'),
    quizExplanationDetail: document.getElementById('quiz-explanation-detail'),
    btnQuizNext: document.getElementById('btn-quiz-next'),
    quizResultsCard: document.getElementById('quiz-results-card'),
    resultsScoreText: document.getElementById('results-score-text'),
    btnQuizRetake: document.getElementById('btn-quiz-retake'),
    btnQuizNew: document.getElementById('btn-quiz-new'),

    // Attitude Elements
    btnToggleAttitude: document.getElementById('btn-toggle-attitude'),
    attitudeIcon: document.getElementById('attitude-icon'),
    attitudeLabel: document.getElementById('attitude-label')
  };

  const ATTITUDES = [
    { id: 'sassy', icon: '🌶️', label: 'Sassy' },
    { id: 'chill', icon: '😎', label: 'Chill' },
    { id: 'coach', icon: '⚡', label: 'Coach' }
  ];

  // Initialize
  function init() {
    applyTheme(state.theme);
    setupEventListeners();
    updateDocumentListUI();
    adjustTextareaHeight();
    updateAttitudeUI();
  }

  function cycleAttitude() {
    if (!window.StudyAssistant) return;
    const current = window.StudyAssistant.getAttitude();
    const idx = ATTITUDES.findIndex((a) => a.id === current);
    const next = ATTITUDES[(idx + 1) % ATTITUDES.length];
    window.StudyAssistant.setAttitude(next.id);
    updateAttitudeUI();
  }

  function updateAttitudeUI() {
    if (!window.StudyAssistant) return;
    const current = window.StudyAssistant.getAttitude();
    const item = ATTITUDES.find((a) => a.id === current) || ATTITUDES[0];
    if (elements.attitudeIcon) elements.attitudeIcon.textContent = item.icon;
    if (elements.attitudeLabel) elements.attitudeLabel.textContent = item.label;
  }

  // Theme Management
  function applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem('aura_theme', theme);
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // Tab Navigation
  function switchTab(tabName) {
    state.activeTab = tabName;
    if (tabName === 'chat') {
      elements.tabBtnChat.classList.add('active');
      elements.tabBtnQuiz.classList.remove('active');
      elements.viewChat.style.display = 'flex';
      elements.viewQuiz.style.display = 'none';
    } else if (tabName === 'quiz') {
      elements.tabBtnQuiz.classList.add('active');
      elements.tabBtnChat.classList.remove('active');
      elements.viewQuiz.style.display = 'flex';
      elements.viewChat.style.display = 'none';
      populateQuizDocSelect();
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Theme toggle
    elements.btnToggleTheme.addEventListener('click', toggleTheme);

    // Attitude toggle
    if (elements.btnToggleAttitude) {
      elements.btnToggleAttitude.addEventListener('click', cycleAttitude);
    }

    // Tab switching
    elements.tabBtnChat.addEventListener('click', () => switchTab('chat'));
    elements.tabBtnQuiz.addEventListener('click', () => switchTab('quiz'));

    // Sidebar toggle for mobile
    elements.btnToggleSidebar.addEventListener('click', () => {
      state.sidebarOpen = !state.sidebarOpen;
      elements.sidebar.classList.toggle('open', state.sidebarOpen);
    });

    // Upload triggers
    const triggerUpload = () => elements.fileInput.click();
    elements.btnHeaderUpload.addEventListener('click', triggerUpload);
    elements.btnSidebarUpload.addEventListener('click', triggerUpload);
    elements.btnAttachFile.addEventListener('click', triggerUpload);

    // File input change
    elements.fileInput.addEventListener('change', handleFileInputChange);

    // Load sample study materials
    elements.btnLoadSample.addEventListener('click', loadSampleMaterials);

    // Clear chat
    elements.btnClearChat.addEventListener('click', clearChat);

    // Form submission
    elements.chatForm.addEventListener('submit', handleFormSubmit);

    // Textarea auto-grow & live hints
    elements.promptInput.addEventListener('input', () => {
      adjustTextareaHeight();
      updateIntentPreview();
    });

    elements.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elements.chatForm.requestSubmit();
      }
    });

    // Starter chips click
    elements.starterChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn');
      if (chip && chip.dataset.prompt) {
        elements.promptInput.value = chip.dataset.prompt;
        elements.chatForm.requestSubmit();
      }
    });

    // Modals close buttons
    elements.btnCloseDocModal.addEventListener('click', () => {
      elements.docModal.style.display = 'none';
    });
    elements.docModal.addEventListener('click', (e) => {
      if (e.target === elements.docModal) elements.docModal.style.display = 'none';
    });

    elements.btnCloseCitationModal.addEventListener('click', () => {
      elements.citationModal.style.display = 'none';
    });
    elements.citationModal.addEventListener('click', (e) => {
      if (e.target === elements.citationModal) elements.citationModal.style.display = 'none';
    });

    // Drag and drop onto page
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', handleFileDrop);

    // Quiz Studio Controls
    elements.btnGenerateQuiz.addEventListener('click', handleGenerateQuiz);
    elements.btnQuizNext.addEventListener('click', handleNextQuizQuestion);
    elements.btnQuizRetake.addEventListener('click', handleRetakeQuiz);
    elements.btnQuizNew.addEventListener('click', handleNewQuizSetup);
  }

  // Adjust textarea height
  function adjustTextareaHeight() {
    const input = elements.promptInput;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 140) + 'px';
  }

  // Live Intent Preview in bottom hint
  function updateIntentPreview() {
    const text = elements.promptInput.value.trim();
    if (!text) {
      elements.activeIntentHint.textContent = 'Ready • Conversational Memory Active';
      elements.activeIntentHint.style.color = 'var(--text-muted)';
      return;
    }

    const intent = window.IntentClassifier.classifyPrompt(text, state.activeDocuments);
    if (intent.isDocumentRelated) {
      const matched = intent.matchedKeywords.length > 0 
        ? ` (${intent.matchedKeywords.slice(0, 2).join(', ')})`
        : '';
      elements.activeIntentHint.textContent = `Mode: Document Grounding${matched}`;
      elements.activeIntentHint.style.color = 'var(--color-doc)';
    } else {
      elements.activeIntentHint.textContent = `Mode: ${intent.badgeText}`;
      elements.activeIntentHint.style.color = 'var(--text-secondary)';
    }
  }

  // Handle File Input Change
  async function handleFileInputChange(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    await processUploadedFiles(files);
    elements.fileInput.value = '';
  }

  // Handle Drag & Drop
  async function handleFileDrop(e) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await processUploadedFiles(files);
    }
  }

  // Process uploaded files
  async function processUploadedFiles(files) {
    for (const file of files) {
      try {
        const parsed = await window.DocumentParser.parseFile(file);
        addDocument(parsed);
      } catch (err) {
        console.error('Failed to parse file:', err);
        alert(`Error reading file "${file.name}": ` + err.message);
      }
    }
  }

  // Add document to state
  function addDocument(doc) {
    // Avoid duplicate names
    state.activeDocuments = state.activeDocuments.filter((d) => d.fileName !== doc.fileName);
    state.activeDocuments.unshift(doc);
    updateDocumentListUI();
    populateQuizDocSelect();

    // Notify in chat
    const pageInfo = doc.pageCount ? `${doc.pageCount} pages, ` : '';
    addAssistantSystemMessage(
      `📁 **Document Uploaded**: **${doc.fileName}** (${pageInfo}${(doc.wordCount || 0).toLocaleString()} words, ${doc.chunks?.length || 0} sections indexed).\n\n` +
      `**Key Topics**: *${(doc.keyTopics || []).slice(0, 5).join(', ')}*.\n` +
      `💡 *You can now ask questions about this material, request a summary, or jump into the **Quiz Studio** tab to test yourself!*`
    );
  }

  // Load Sample Study Notes
  function loadSampleMaterials() {
    if (!window.SAMPLE_STUDY_MATERIALS) return;
    for (const sample of window.SAMPLE_STUDY_MATERIALS) {
      const chunks = window.DocumentParser.chunkText(sample.content);
      const keyTopics = window.DocumentParser.extractKeyTopics(sample.content);
      const words = sample.content.split(/\s+/).filter(Boolean);

      addDocument({
        fileName: sample.fileName,
        fileSize: sample.content.length,
        fileType: sample.fileType,
        fullText: sample.content,
        wordCount: words.length,
        chunks,
        keyTopics,
      });
    }
  }

  // Update Document List UI in Sidebar & Header
  function updateDocumentListUI() {
    const count = state.activeDocuments.length;
    elements.sidebarDocCount.textContent = `${count} File${count === 1 ? '' : 's'}`;

    if (count === 0) {
      elements.headerDocText.textContent = 'No Material Loaded';
      elements.emptyDocsPlaceholder.style.display = 'flex';
      const existingCards = elements.documentsContainer.querySelectorAll('.doc-card');
      existingCards.forEach((c) => c.remove());
      return;
    }

    elements.headerDocText.textContent = `${state.activeDocuments[0].fileName} (${count})`;
    elements.emptyDocsPlaceholder.style.display = 'none';

    // Clear old cards
    const existingCards = elements.documentsContainer.querySelectorAll('.doc-card');
    existingCards.forEach((c) => c.remove());

    // Render cards
    state.activeDocuments.forEach((doc, idx) => {
      const card = document.createElement('div');
      card.className = `doc-card ${idx === 0 ? 'active' : ''}`;
      
      const topicsHtml = (doc.keyTopics || []).slice(0, 3)
        .map((t) => `<span class="topic-tag">${escapeHtml(t)}</span>`)
        .join('');

      card.innerHTML = `
        <div class="doc-card-header">
          <span class="doc-name" title="${escapeHtml(doc.fileName)}">${escapeHtml(doc.fileName)}</span>
          <button class="doc-btn-remove" title="Remove Document" data-filename="${escapeHtml(doc.fileName)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="doc-meta-row">
          <span>${doc.pageCount ? `${doc.pageCount} pgs • ` : ''}${doc.chunks?.length || 0} sections</span>
          <span>•</span>
          <span>~${(doc.wordCount || 0).toLocaleString()} words</span>
        </div>
        ${topicsHtml ? `<div class="doc-keywords-row">${topicsHtml}</div>` : ''}
        <div class="doc-actions-row">
          <button class="doc-action-btn btn-inspect-doc" data-filename="${escapeHtml(doc.fileName)}">Inspect</button>
          <button class="doc-action-btn btn-quiz-doc" data-filename="${escapeHtml(doc.fileName)}">Quiz</button>
          <button class="doc-action-btn btn-summary-doc" data-filename="${escapeHtml(doc.fileName)}">Summary</button>
        </div>
      `;

      // Event: Remove
      card.querySelector('.doc-btn-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        removeDocument(doc.fileName);
      });

      // Event: Inspect
      card.querySelector('.btn-inspect-doc').addEventListener('click', () => {
        openDocumentModal(doc);
      });

      // Event: Direct to Quiz tab
      card.querySelector('.btn-quiz-doc').addEventListener('click', () => {
        switchTab('quiz');
        if (elements.quizDocSelect) {
          elements.quizDocSelect.value = doc.fileName;
        }
      });

      // Event: Quick Summary
      card.querySelector('.btn-summary-doc').addEventListener('click', () => {
        switchTab('chat');
        elements.promptInput.value = `Summarize the material in ${doc.fileName}`;
        elements.chatForm.requestSubmit();
      });

      elements.documentsContainer.appendChild(card);
    });
  }

  // Populate Quiz Document Dropdown
  function populateQuizDocSelect() {
    if (!elements.quizDocSelect) return;
    elements.quizDocSelect.innerHTML = '';

    if (state.activeDocuments.length === 0) {
      elements.quizDocSelect.innerHTML = '<option value="">No documents loaded yet — upload one first</option>';
      return;
    }

    state.activeDocuments.forEach((doc, idx) => {
      const opt = document.createElement('option');
      opt.value = doc.fileName;
      opt.textContent = `${doc.fileName} (${doc.pageCount ? doc.pageCount + ' pgs' : (doc.chunks?.length || 0) + ' sections'})`;
      if (idx === 0) opt.selected = true;
      elements.quizDocSelect.appendChild(opt);
    });
  }

  // Remove document
  function removeDocument(fileName) {
    state.activeDocuments = state.activeDocuments.filter((d) => d.fileName !== fileName);
    updateDocumentListUI();
    populateQuizDocSelect();
  }

  // Open Document Modal
  function openDocumentModal(doc) {
    elements.modalDocTitle.textContent = doc.fileName;
    elements.modalDocMeta.textContent = `${doc.chunks?.length || 0} indexed chunks • ~${doc.wordCount.toLocaleString()} words`;
    
    let html = `<p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 13px;">Below are the parsed semantic chunks and pages indexed for local retrieval.</p>`;
    
    if (doc.chunks) {
      doc.chunks.forEach((ch, i) => {
        const pageLabel = ch.pageNumber ? `Page ${ch.pageNumber}` : `Section ${ch.paragraph || i + 1}`;
        html += `
          <div class="chunk-card">
            <div class="chunk-header">${pageLabel} (${ch.tokens.length} tokens)</div>
            <p>${escapeHtml(ch.content)}</p>
          </div>
        `;
      });
    }

    elements.modalDocBody.innerHTML = html;
    elements.docModal.style.display = 'flex';
  }

  // Handle Form Submit
  function handleFormSubmit(e) {
    e.preventDefault();
    const prompt = elements.promptInput.value.trim();
    if (!prompt) return;

    // Hide welcome card if visible
    if (elements.welcomeCard) {
      elements.welcomeCard.style.display = 'none';
    }

    // 1. Append User Message
    appendMessage({
      role: 'user',
      content: prompt,
    });

    elements.promptInput.value = '';
    adjustTextareaHeight();
    updateIntentPreview();

    // 2. Classify intent
    const intent = window.IntentClassifier.classifyPrompt(prompt, state.activeDocuments);

    // 3. Generate Answer
    const response = window.StudyAssistant.generateAnswer(prompt, intent, state.activeDocuments);

    // 4. Append Assistant Message
    setTimeout(() => {
      appendMessage({
        role: 'assistant',
        content: response.content,
        intent: intent,
        citations: response.citations,
      });
    }, 120);
  }

  // Append Message to Chat
  function appendMessage({ role, content, intent, citations }) {
    const row = document.createElement('div');
    row.className = `chat-row ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = role === 'user' ? 'YOU' : 'AI';

    const container = document.createElement('div');
    container.className = 'chat-bubble-container';

    // If assistant, show Intent Badge
    if (role === 'assistant' && intent) {
      const badge = document.createElement('div');
      badge.className = intent.badgeClass || 'badge-chitchat';
      badge.title = intent.reason || '';
      badge.innerHTML = `<span>${escapeHtml(intent.badgeText || 'AI Response')}</span>`;
      container.appendChild(badge);
    }

    // Message Bubble
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = formatMarkdown(content);
    container.appendChild(bubble);

    // Citations if present
    if (citations && citations.length > 0) {
      const citationsWrapper = document.createElement('div');
      citationsWrapper.className = 'citations-wrapper';
      citationsWrapper.innerHTML = `
        <span class="citations-header">Source Citations (${citations.length})</span>
        <div class="citations-list"></div>
      `;

      const list = citationsWrapper.querySelector('.citations-list');
      citations.forEach((cit, i) => {
        const pill = document.createElement('button');
        pill.className = 'citation-pill';
        const sectionLabel = cit.pageNumber ? `Page ${cit.pageNumber}` : (cit.paragraph ? `Section ${cit.paragraph}` : `Part ${i + 1}`);
        pill.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          </svg>
          <span>${escapeHtml(cit.fileName)} [${sectionLabel}]</span>
        `;
        pill.addEventListener('click', () => {
          openCitationModal(cit);
        });
        list.appendChild(pill);
      });

      container.appendChild(citationsWrapper);
    }

    row.appendChild(avatar);
    row.appendChild(container);

    elements.chatMessages.appendChild(row);
    scrollToBottom();
  }

  function addAssistantSystemMessage(text) {
    if (elements.welcomeCard) {
      elements.welcomeCard.style.display = 'none';
    }
    appendMessage({
      role: 'assistant',
      content: text,
      intent: {
        badgeText: '📁 Material Ingestion',
        badgeClass: 'badge-doc',
        reason: 'Document text indexed into local vector/BM25 storage.'
      }
    });
  }

  // Open Citation Modal
  function openCitationModal(citation) {
    const loc = citation.pageNumber ? `Page ${citation.pageNumber}` : `Section ${citation.paragraph || 1}`;
    elements.citationModalTitle.textContent = `${citation.fileName} (${loc})`;
    elements.citationModalBody.innerHTML = `
      <div style="margin-bottom: 12px; font-size: 12px; color: var(--text-muted);">
        Relevance Score: <strong>${citation.score || 'High'}</strong>
      </div>
      <blockquote style="border-left: 3px solid var(--accent-primary); padding-left: 14px; margin: 0; font-size: 14px; line-height: 1.6; color: var(--text-primary); background: var(--bg-card); padding: 12px; border-radius: var(--radius-sm);">
        "${escapeHtml(citation.snippet)}"
      </blockquote>
    `;
    elements.citationModal.style.display = 'flex';
  }

  // Clear Chat
  function clearChat() {
    elements.chatMessages.innerHTML = '';
    if (elements.welcomeCard) {
      elements.chatMessages.appendChild(elements.welcomeCard);
      elements.welcomeCard.style.display = 'flex';
    }
    state.chatHistory = [];
    if (window.StudyAssistant && window.StudyAssistant.clearMemory) {
      window.StudyAssistant.clearMemory();
    }
  }

  function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }

  // =========================================================================
  // Interactive Quiz Studio Controls
  // =========================================================================

  function handleGenerateQuiz() {
    if (state.activeDocuments.length === 0) {
      alert('Please upload a document or load sample study notes before generating a quiz!');
      return;
    }

    const selectedDocName = elements.quizDocSelect.value;
    const targetDoc = state.activeDocuments.find((d) => d.fileName === selectedDocName) || state.activeDocuments[0];

    const count = parseInt(elements.quizCountSelect.value, 10) || 5;
    const type = elements.quizTypeSelect.value || 'multiple_choice';
    const topic = elements.quizTopicInput.value.trim();

    const quiz = window.QuizEngine.generateQuiz([targetDoc], {
      questionCount: count,
      type,
      customTopic: topic
    });

    if (quiz.error) {
      alert(quiz.error);
      return;
    }

    state.currentQuizIndex = 0;
    elements.quizSetupCard.style.display = 'none';
    elements.quizResultsCard.style.display = 'none';
    elements.quizPlayerCard.style.display = 'flex';

    renderQuizQuestion(state.currentQuizIndex);
  }

  function renderQuizQuestion(index) {
    const quiz = window.QuizEngine.getCurrentQuiz();
    if (!quiz || !quiz.questions[index]) return;

    const q = quiz.questions[index];
    elements.quizQuestionCounter.textContent = `Question ${index + 1} of ${quiz.questions.length}`;
    elements.quizScoreTracker.textContent = `Score: ${quiz.questions.filter((item) => item.isCorrect).length} / ${index}`;
    elements.quizQuestionTitle.textContent = q.question;

    elements.quizOptionsList.innerHTML = '';
    elements.quizExplanationBox.style.display = 'none';
    elements.btnQuizNext.style.display = 'none';

    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<strong>${String.fromCharCode(65 + optIdx)}.</strong> <span>${escapeHtml(optText)}</span>`;

      btn.addEventListener('click', () => {
        handleOptionSelect(q.id, optText, btn);
      });

      elements.quizOptionsList.appendChild(btn);
    });
  }

  function handleOptionSelect(questionId, selectedOption, clickedBtn) {
    const quiz = window.QuizEngine.getCurrentQuiz();
    const result = window.QuizEngine.submitAnswer(questionId, selectedOption);
    if (!result) return;

    // Disable all options
    const allBtns = elements.quizOptionsList.querySelectorAll('.quiz-option-btn');
    allBtns.forEach((btn) => {
      btn.disabled = true;
      const btnText = btn.querySelector('span').textContent;
      if (btnText === result.correctAnswer) {
        btn.classList.add('correct');
      } else if (btn === clickedBtn && !result.isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    // Show Explanation
    elements.quizExplanationStatus.textContent = result.isCorrect ? '✓ Correct Answer!' : '✗ Incorrect';
    elements.quizExplanationStatus.className = `explanation-status ${result.isCorrect ? 'correct' : 'incorrect'}`;
    elements.quizExplanationDetail.textContent = result.explanation;
    elements.quizExplanationBox.style.display = 'flex';

    // Update Score
    elements.quizScoreTracker.textContent = `Score: ${result.score} / ${quiz.questions.filter((item) => item.userAnswer !== null).length}`;

    // Show Next or Finish Button
    elements.btnQuizNext.textContent = (state.currentQuizIndex === quiz.questions.length - 1) ? 'View Quiz Results' : 'Next Question';
    elements.btnQuizNext.style.display = 'inline-flex';
  }

  function handleNextQuizQuestion() {
    const quiz = window.QuizEngine.getCurrentQuiz();
    if (!quiz) return;

    if (state.currentQuizIndex < quiz.questions.length - 1) {
      state.currentQuizIndex++;
      renderQuizQuestion(state.currentQuizIndex);
    } else {
      // Quiz Finished
      elements.quizPlayerCard.style.display = 'none';
      elements.quizResultsCard.style.display = 'flex';
      const pct = Math.round((quiz.score / quiz.questions.length) * 100);
      elements.resultsScoreText.textContent = `You scored ${quiz.score} out of ${quiz.questions.length} (${pct}%) on ${quiz.documentName}`;
    }
  }

  function handleRetakeQuiz() {
    const quiz = window.QuizEngine.getCurrentQuiz();
    if (!quiz) return;
    quiz.questions.forEach((q) => {
      q.userAnswer = null;
      q.isCorrect = false;
    });
    quiz.score = 0;
    quiz.isCompleted = false;
    state.currentQuizIndex = 0;
    elements.quizResultsCard.style.display = 'none';
    elements.quizPlayerCard.style.display = 'flex';
    renderQuizQuestion(0);
  }

  function handleNewQuizSetup() {
    elements.quizResultsCard.style.display = 'none';
    elements.quizPlayerCard.style.display = 'none';
    elements.quizSetupCard.style.display = 'block';
  }

  // Minimal Markdown Formatter
  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

    // Line breaks
    html = html.replace(/\n\n/g, '<p></p>');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);
})();
