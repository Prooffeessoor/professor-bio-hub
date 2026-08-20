/* Professor Bio Hub – application logic */
const FIREBASE_CONFIG = {
  apiKey: null, authDomain: null, projectId: null,
  storageBucket: null, messagingSenderId: null, appId: null
};

let firebaseReady = false, currentUser = null, db = null;
let chapters = null, flashcards = null, quizzes = null, practicals = null;
let waecQuestions = null, waecTheoryQuestions = null, waecPracticalQuestions = null, jambQuestions = null;

function isFirebaseConfigured() {
  return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId;
}
function canUseCloud() {
  return !!(firebaseReady && currentUser && db);
}

const _loadedScripts = new Set();
const _loadingScripts = new Map();
const _pageReady = new Set();

function loadDataFile(name) {
  if (_loadedScripts.has(name)) return Promise.resolve();
  if (_loadingScripts.has(name)) return _loadingScripts.get(name);
  const p = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = './data/' + name + '.js';
    script.async = true;
    script.onload = () => {
      _loadedScripts.add(name);
      _loadingScripts.delete(name);
      const d = window.BIO_DATA || {};
      if (d.chapters) chapters = d.chapters;
      if (d.flashcards) flashcards = d.flashcards;
      if (d.quizzes) quizzes = d.quizzes;
      if (d.practicals) practicals = d.practicals;
      if (d.waecQuestions) waecQuestions = d.waecQuestions;
      if (d.waecTheoryQuestions) waecTheoryQuestions = d.waecTheoryQuestions;
      if (d.waecPracticalQuestions) waecPracticalQuestions = d.waecPracticalQuestions;
      if (d.jambQuestions) jambQuestions = d.jambQuestions;
      resolve();
    };
    script.onerror = () => {
      _loadingScripts.delete(name);
      reject(new Error('Failed to load ' + name));
    };
    document.head.appendChild(script);
  });
  _loadingScripts.set(name, p);
  return p;
}

function loadDataFiles(names) {
  return Promise.all(names.map(loadDataFile));
}

const PAGE_DATA = {
  home: ['chapters'], chapters: ['chapters'], reader: ['chapters'],
  flashcards: ['flashcards'], quiz: ['quizzes'], practical: ['practicals'],
  'practical-detail': ['practicals'],
  waec: ['waecQuestions', 'waecTheoryQuestions', 'waecPracticalQuestions'],
  jamb: ['jambQuestions'], games: [], notes: []
};

async function ensurePageData(pageId) {
  const deps = PAGE_DATA[pageId] || [];
  if (!deps.length) return;
  await loadDataFiles(deps);
}

async function ensurePageInit(pageId) {
  await ensurePageData(pageId);
  if (_pageReady.has(pageId)) return;
  switch (pageId) {
    case 'home':
      if (!chapters) break;
      renderHomeChapters();
      renderProgress();
      break;
    case 'chapters':
      if (!chapters) break;
      renderChapters();
      break;
    case 'flashcards':
      initFlashcards();
      break;
    case 'quiz':
      initQuiz();
      break;
    case 'practical':
      if (!practicals) break;
      renderPracticals();
      break;
    case 'waec':
      initWaec();
      break;
    case 'jamb':
      initJamb();
      break;
    case 'games':
      initGames();
      break;
    case 'notes':
      initNotes();
      break;
  }
  _pageReady.add(pageId);
}

function getProgress() {
  try { return JSON.parse(localStorage.getItem('profBioProgress') || '{}'); }
  catch { return {}; }
}
function saveProgress(data) {
  localStorage.setItem('profBioProgress', JSON.stringify(data));
}
function updateStreak() {
  const data = getProgress();
  const today = new Date().toDateString();
  if (data.lastVisit !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    data.streak = data.lastVisit === yesterday.toDateString() ? (data.streak || 0) + 1 : 1;
    data.lastVisit = today;
    saveProgress(data);
  }
  return data.streak || 1;
}
function markChapterRead(id) {
  const data = getProgress();
  data.chapters = data.chapters || {};
  data.chapters[id] = true;
  saveProgress(data);
  renderProgress();
}
function markQuizDone(topic) {
  const data = getProgress();
  data.quizzes = data.quizzes || {};
  data.quizzes[topic] = (data.quizzes[topic] || 0) + 1;
  saveProgress(data);
  renderProgress();
}
function markCardSeen() {
  const data = getProgress();
  data.cardsSeen = (data.cardsSeen || 0) + 1;
  saveProgress(data);
  renderProgress();
}
function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
}
function setStyle(id, prop, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style[prop] = value;
}
function renderProgress() {
  const data = getProgress();
  const totalChapters = Array.isArray(chapters) && chapters.length > 0 ? chapters.length : 6;
  const chaptersDone = Object.keys(data.chapters || {}).length;
  const quizzesDone = Object.values(data.quizzes || {}).reduce((a, b) => a + b, 0);
  const cardsSeen = data.cardsSeen || 0;
  const streak = data.streak || 0;
  const overall = Math.round((chaptersDone / totalChapters) * 60 + Math.min(quizzesDone / 6, 1) * 30 + Math.min(cardsSeen / 40, 1) * 10);
  setText('statChapters', chaptersDone + '/' + totalChapters);
  setText('statQuizzes', quizzesDone);
  setText('statCards', cardsSeen);
  setStyle('overallFill', 'width', overall + '%');
  setText('progressPercent', overall + '% complete');
  setText('streakBadge', '🔥 ' + streak + ' day streak');
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) { page.classList.add('active'); }
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
  document.querySelectorAll('.bottom-nav-item').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
  closeSidebar();
  window.scrollTo(0, 0);
  ensurePageInit(pageId).catch(err => console.warn('Page init failed:', pageId, err));
}
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

function initTheme() {
  const saved = localStorage.getItem('profBioTheme') || 'light';
  setTheme(saved);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
}
function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = '🌙';
  }
  localStorage.setItem('profBioTheme', theme);
}

function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const updateBanner = document.getElementById('swUpdateBanner');
  const updateBtn = document.getElementById('swUpdateBtn');
  let waitingWorker = null;
  function showUpdateBanner(worker) {
    waitingWorker = worker;
    if (updateBanner) updateBanner.classList.add('show');
  }
  if (updateBtn) updateBtn.addEventListener('click', () => {
    if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    else window.location.reload();
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
  navigator.serviceWorker.register('./sw.js').then(reg => {
    if (reg.waiting) showUpdateBanner(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(worker);
      });
    });
  }).catch(err => console.log('SW registration failed:', err));
}

function initConnectivityBanners() {
  const offlineBanner = document.getElementById('swOfflineBanner');
  function sync() {
    if (!offlineBanner) return;
    if (navigator.onLine) offlineBanner.classList.remove('show');
    else offlineBanner.classList.add('show');
  }
  window.addEventListener('online', sync);
  window.addEventListener('offline', sync);
  sync();
}

function renderChapters() {
  const list = document.getElementById('chaptersList');
  if (!list || !chapters) return;
  list.innerHTML = chapters.map(ch =>
    `<div class="chapter-card" data-chapter="${ch.id}"><div class="chapter-num">${ch.num}</div><div class="chapter-info"><h3>${ch.title}</h3><p>${ch.subtitle}</p></div></div>`
  ).join('');
  list.querySelectorAll('.chapter-card').forEach(card => {
    card.addEventListener('click', () => openChapter(card.dataset.chapter));
  });
}
function renderHomeChapters() {
  const list = document.getElementById('homeChapters');
  if (!list || !chapters) return;
  list.innerHTML = chapters.slice(0, 3).map(ch =>
    `<div class="chapter-card" data-chapter="${ch.id}"><div class="chapter-num">${ch.num}</div><div class="chapter-info"><h3>${ch.title}</h3><p>${ch.subtitle}</p></div></div>`
  ).join('');
  list.querySelectorAll('.chapter-card').forEach(card => {
    card.addEventListener('click', () => openChapter(card.dataset.chapter));
  });
}
function openChapter(id) {
  const ch = chapters && chapters.find(c => c.id === id);
  if (!ch) return;
  document.getElementById('readerContent').innerHTML = ch.content;
  markChapterRead(id);
  showPage('reader');
}

let currentCardIndex = 0;
let srsMode = 'browse';
function initFlashcards() {
  const topicSel = document.getElementById('cardTopic');
  if (topicSel) topicSel.addEventListener('change', () => { currentCardIndex = 0; renderCard(); });
  const flip = document.getElementById('flipCard');
  if (flip) flip.addEventListener('click', () => document.getElementById('flashcard').classList.toggle('flipped'));
  const fc = document.getElementById('flashcard');
  if (fc) fc.addEventListener('click', () => fc.classList.toggle('flipped'));
  const prev = document.getElementById('prevCard');
  const next = document.getElementById('nextCard');
  if (prev) prev.addEventListener('click', () => { const cards = getBrowseCards(); if (!cards.length) return; currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length; document.getElementById('flashcard').classList.remove('flipped'); renderCard(); markCardSeen(); });
  if (next) next.addEventListener('click', () => { const cards = getBrowseCards(); if (!cards.length) return; currentCardIndex = (currentCardIndex + 1) % cards.length; document.getElementById('flashcard').classList.remove('flipped'); renderCard(); markCardSeen(); });
  const browse = document.getElementById('srsBrowse');
  if (browse) browse.addEventListener('click', () => { srsMode = 'browse'; renderCard(); });
  renderCard();
}
function getBrowseCards() {
  const topic = document.getElementById('cardTopic')?.value || 'all';
  if (!flashcards) return [];
  if (topic === 'all') {
    const list = [];
    Object.keys(flashcards).forEach(t => (flashcards[t] || []).forEach(c => list.push(c)));
    return list;
  }
  return flashcards[topic] || [];
}
function renderCard() {
  const cards = getBrowseCards();
  if (!cards.length) {
    setText('cardFront', 'No cards');
    setText('cardBack', '');
    return;
  }
  if (currentCardIndex >= cards.length) currentCardIndex = 0;
  const card = cards[currentCardIndex];
  setText('cardFront', card.front);
  setText('cardBack', card.back);
  setText('cardProgress', `Card ${currentCardIndex + 1} of ${cards.length}`);
}

let quizState = { topic: null, index: 0, score: 0, answered: false };
function initQuiz() {
  document.querySelectorAll('[data-quiz]').forEach(el => {
    el.addEventListener('click', () => startQuiz(el.dataset.quiz));
  });
  const nq = document.getElementById('nextQuestionBtn');
  if (nq) nq.addEventListener('click', nextQuestion);
  const quit = document.getElementById('quitQuizBtn');
  if (quit) quit.addEventListener('click', () => {
    document.getElementById('quizArea').classList.add('hidden');
    document.getElementById('quizSetup').classList.remove('hidden');
    document.getElementById('quizResult').classList.add('hidden');
  });
  const retry = document.getElementById('retryQuizBtn');
  if (retry) retry.addEventListener('click', () => startQuiz(quizState.topic));
  const back = document.getElementById('backToQuizHome');
  if (back) back.addEventListener('click', () => {
    document.getElementById('quizResult').classList.add('hidden');
    document.getElementById('quizSetup').classList.remove('hidden');
  });
}
function startQuiz(topic) {
  if (!quizzes || !quizzes[topic]) return;
  quizState = { topic, index: 0, score: 0, answered: false };
  document.getElementById('quizSetup').classList.add('hidden');
  document.getElementById('quizResult').classList.add('hidden');
  document.getElementById('quizArea').classList.remove('hidden');
  setText('quizTopicLabel', topic.charAt(0).toUpperCase() + topic.slice(1));
  renderQuestion();
}
function renderQuestion() {
  const qs = quizzes[quizState.topic];
  const q = qs[quizState.index];
  quizState.answered = false;
  setText('quizCounter', `Question ${quizState.index + 1}/${qs.length}`);
  setStyle('quizProgress', 'width', `${(quizState.index / qs.length) * 100}%`);
  document.getElementById('nextQuestionBtn').style.display = 'none';
  const letters = ['A', 'B', 'C', 'D'];
  document.getElementById('questionCard').innerHTML =
    `<div style="font-weight:600;margin-bottom:1rem;">${q.q}</div>` +
    q.options.map((opt, i) => `<div class="option" data-index="${i}"><div class="option-letter">${letters[i]}</div><div>${opt}</div></div>`).join('') +
    `<div id="qFeedback"></div>`;
  document.querySelectorAll('#questionCard .option').forEach(opt => {
    opt.addEventListener('click', () => selectOption(parseInt(opt.dataset.index, 10)));
  });
}
function selectOption(index) {
  if (quizState.answered) return;
  quizState.answered = true;
  const qs = quizzes[quizState.topic];
  const q = qs[quizState.index];
  document.querySelectorAll('#questionCard .option').forEach((opt, i) => {
    if (i === q.answer) opt.classList.add('correct');
    else if (i === index && index !== q.answer) opt.classList.add('wrong');
  });
  const fb = document.getElementById('qFeedback');
  if (index === q.answer) {
    quizState.score++;
    fb.innerHTML = `<div class="feedback correct">✓ Correct!${q.explanation ? ' ' + q.explanation : ''}</div>`;
  } else {
    fb.innerHTML = `<div class="feedback wrong">✗ Wrong. Correct: ${['A','B','C','D'][q.answer]}.${q.explanation ? ' ' + q.explanation : ''}</div>`;
  }
  const btn = document.getElementById('nextQuestionBtn');
  btn.style.display = 'inline-flex';
  if (quizState.index === qs.length - 1) btn.textContent = 'See Results';
}
function nextQuestion() {
  const qs = quizzes[quizState.topic];
  if (quizState.index < qs.length - 1) {
    quizState.index++;
    renderQuestion();
  } else {
    const percent = Math.round((quizState.score / qs.length) * 100);
    document.getElementById('quizArea').classList.add('hidden');
    document.getElementById('quizResult').classList.remove('hidden');
    setText('finalScore', percent + '%');
    setText('scoreMessage', `You scored ${quizState.score} out of ${qs.length}.`);
    markQuizDone(quizState.topic);
  }
}

function renderPracticals() {
  const list = document.getElementById('practicalList');
  if (!list || !practicals) return;
  list.innerHTML = practicals.map(p =>
    `<div class="chapter-card" data-practical="${p.id}"><div class="chapter-num" style="font-size:1.3rem;background:linear-gradient(135deg,#f59e0b,#d97706);">${p.icon}</div><div class="chapter-info"><h3>${p.title}</h3><p>${p.steps.length} steps</p></div></div>`
  ).join('');
  list.querySelectorAll('[data-practical]').forEach(el => {
    el.addEventListener('click', () => openPractical(el.dataset.practical));
  });
}
function openPractical(id) {
  const p = practicals && practicals.find(x => x.id === id);
  if (!p) return;
  document.getElementById('practicalDetail').innerHTML = `
    <div class="content-card"><h2>${p.icon} ${p.title}</h2>
    ${p.description ? `<p style="margin-bottom:1rem;color:var(--text-muted);">${p.description}</p>` : ''}
    <div class="materials-box"><h4>🧰 Materials</h4><ul>${p.materials.map(m => `<li>${m}</li>`).join('')}</ul></div>
    <h3>Procedure</h3>
    ${p.steps.map((s, i) => `<div style="display:flex;gap:1rem;margin-bottom:1rem;"><div class="chapter-num">${i + 1}</div><div><h4>${s.title}</h4><p style="color:var(--text-muted);font-size:0.9rem;">${s.desc}</p></div></div>`).join('')}
    ${p.explanation ? `<p style="margin:1rem 0;">${p.explanation}</p>` : ''}
    <div class="highlight-box"><strong>💡 Tip:</strong> ${p.tip}</div></div>`;
  showPage('practical-detail');
}

let waecMode = 'msq';
let waecState = { topic: null, index: 0, score: 0, answered: false, questions: [] };
const waecTopicsMeta = [
  { id: 'all', label: 'All Topics', icon: '📚' },
  { id: 'cell', label: 'The Cell', icon: '🔬' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'transport', label: 'Transport', icon: '💓' },
  { id: 'ecology', label: 'Ecology', icon: '🌍' },
  { id: 'genetics', label: 'Genetics', icon: '🧬' },
  { id: 'reproduction', label: 'Reproduction', icon: '🌸' }
];
function getWaecBank() {
  if (waecMode === 'theory') return waecTheoryQuestions || [];
  if (waecMode === 'practical') return waecPracticalQuestions || [];
  return waecQuestions || [];
}
function initWaec() {
  renderWaecTopicGrid();
  ['msq', 'theory', 'practical'].forEach(mode => {
    const id = mode === 'msq' ? 'waecModeMsq' : mode === 'theory' ? 'waecModeTheory' : 'waecModePractical';
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      waecMode = mode;
      document.getElementById('waecModeMsq').className = 'btn btn-sm ' + (mode === 'msq' ? 'btn-primary' : 'btn-secondary');
      document.getElementById('waecModeTheory').className = 'btn btn-sm ' + (mode === 'theory' ? 'btn-primary' : 'btn-secondary');
      document.getElementById('waecModePractical').className = 'btn btn-sm ' + (mode === 'practical' ? 'btn-primary' : 'btn-secondary');
      showWaecTopics();
      renderWaecTopicGrid();
    });
  });
  const next = document.getElementById('waecNextBtn');
  if (next) next.addEventListener('click', nextWaecQuestion);
  ['waecBackTopics', 'waecBackTopics2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', showWaecTopics);
  });
  const retry = document.getElementById('waecRetryBtn');
  if (retry) retry.addEventListener('click', () => { if (waecState.topic) startWaecTopic(waecState.topic); });
  const reveal = document.getElementById('waecRevealTheoryBtn');
  if (reveal) reveal.addEventListener('click', revealTheoryAnswer);
}
function renderWaecTopicGrid() {
  const grid = document.getElementById('waecTopicGrid');
  if (!grid) return;
  const bank = getWaecBank();
  grid.innerHTML = waecTopicsMeta.map(t => {
    const count = t.id === 'all' ? bank.length : bank.filter(q => q.topic === t.id).length;
    if (t.id !== 'all' && count === 0) return '';
    return `<div class="feature-card" data-waec-topic="${t.id}"><div class="feature-icon">${t.icon}</div><h3>${t.label}</h3><p style="font-size:0.75rem;color:var(--text-muted);">${count} Qs</p></div>`;
  }).join('');
  grid.querySelectorAll('[data-waec-topic]').forEach(el => {
    el.addEventListener('click', () => startWaecTopic(el.dataset.waecTopic));
  });
}
function showWaecTopics() {
  document.getElementById('waecTopicPicker').classList.remove('hidden');
  document.getElementById('waecQuizArea').classList.add('hidden');
  document.getElementById('waecResult').classList.add('hidden');
}
function startWaecTopic(topicId) {
  const bank = getWaecBank();
  let questions = topicId === 'all' ? [...bank] : bank.filter(q => q.topic === topicId);
  if (!questions.length) { alert('No questions for this topic yet.'); return; }
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  waecState = { topic: topicId, index: 0, score: 0, answered: false, questions };
  document.getElementById('waecTopicPicker').classList.add('hidden');
  document.getElementById('waecResult').classList.add('hidden');
  document.getElementById('waecQuizArea').classList.remove('hidden');
  setText('waecTopicLabel', 'WAEC · ' + topicId);
  renderWaecQuestion();
}
function renderWaecQuestion() {
  const qs = waecState.questions;
  const q = qs[waecState.index];
  waecState.answered = false;
  setText('waecCounter', `Question ${waecState.index + 1}/${qs.length}`);
  setStyle('waecProgress', 'width', `${(waecState.index / qs.length) * 100}%`);
  document.getElementById('waecNextBtn').style.display = 'none';
  document.getElementById('waecFeedback').classList.add('hidden');
  if (waecMode === 'theory' || waecMode === 'practical') {
    document.getElementById('waecRevealTheoryBtn').style.display = 'inline-flex';
    document.getElementById('waecQuestion').innerHTML = `<div class="tag">${q.topic}</div><div style="font-weight:600;margin:0.75rem 0;white-space:pre-line;">${q.q}</div><p style="font-size:0.85rem;color:var(--text-muted);">Attempt on paper, then show marking guide.</p>`;
  } else {
    document.getElementById('waecRevealTheoryBtn').style.display = 'none';
    const letters = ['A', 'B', 'C', 'D'];
    document.getElementById('waecQuestion').innerHTML =
      `<div class="tag">${q.topic}</div><div style="font-weight:600;margin:0.75rem 0;">${q.q}</div>` +
      q.options.map((opt, i) => `<div class="option" data-index="${i}"><div class="option-letter">${letters[i]}</div><div>${opt}</div></div>`).join('');
    document.querySelectorAll('#waecQuestion .option').forEach(opt => {
      opt.addEventListener('click', () => selectWaecOption(parseInt(opt.dataset.index, 10)));
    });
  }
}
function revealTheoryAnswer() {
  if (waecState.answered) return;
  waecState.answered = true;
  const q = waecState.questions[waecState.index];
  document.getElementById('waecRevealTheoryBtn').style.display = 'none';
  const fb = document.getElementById('waecFeedback');
  fb.classList.remove('hidden');
  fb.innerHTML = `<div class="feedback correct"><strong>Marking guide (${q.marks} marks)</strong><ul style="margin:0.6rem 0 0 1.1rem;">${(q.points || []).map(p => `<li>${p}</li>`).join('')}</ul></div>`;
  document.getElementById('waecNextBtn').style.display = 'inline-flex';
}
function selectWaecOption(index) {
  if (waecState.answered) return;
  waecState.answered = true;
  const q = waecState.questions[waecState.index];
  document.querySelectorAll('#waecQuestion .option').forEach((opt, i) => {
    if (i === q.answer) opt.classList.add('correct');
    else if (i === index && index !== q.answer) opt.classList.add('wrong');
  });
  const fb = document.getElementById('waecFeedback');
  fb.classList.remove('hidden');
  if (index === q.answer) {
    waecState.score++;
    fb.innerHTML = `<div class="feedback correct">✓ Correct!</div>`;
  } else {
    fb.innerHTML = `<div class="feedback wrong">✗ Wrong. Answer: ${['A','B','C','D'][q.answer]}</div>`;
  }
  document.getElementById('waecNextBtn').style.display = 'inline-flex';
}
function nextWaecQuestion() {
  if (waecState.index < waecState.questions.length - 1) {
    waecState.index++;
    renderWaecQuestion();
  } else {
    document.getElementById('waecQuizArea').classList.add('hidden');
    document.getElementById('waecResult').classList.remove('hidden');
    if (waecMode === 'msq') {
      const pct = Math.round((waecState.score / waecState.questions.length) * 100);
      setText('waecFinalScore', pct + '%');
      setText('waecScoreMessage', `Scored ${waecState.score}/${waecState.questions.length}`);
    } else {
      setText('waecFinalScore', String(waecState.questions.length));
      setText('waecScoreMessage', `Reviewed ${waecState.questions.length} questions.`);
    }
  }
}

let jambState = { topic: null, index: 0, score: 0, answered: false, questions: [] };
function initJamb() {
  const grid = document.getElementById('jambTopicGrid');
  if (!grid || !jambQuestions) return;
  const meta = [
    { id: 'all', label: 'All Topics', icon: '📚' },
    { id: 'cell', label: 'The Cell', icon: '🔬' },
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { id: 'transport', label: 'Transport', icon: '💓' },
    { id: 'ecology', label: 'Ecology', icon: '🌍' },
    { id: 'genetics', label: 'Genetics', icon: '🧬' },
    { id: 'reproduction', label: 'Reproduction', icon: '🌸' }
  ];
  grid.innerHTML = meta.map(t => {
    const count = t.id === 'all' ? jambQuestions.length : jambQuestions.filter(q => q.topic === t.id).length;
    return `<div class="feature-card" data-jamb-topic="${t.id}"><div class="feature-icon">${t.icon}</div><h3>${t.label}</h3><p style="font-size:0.75rem;color:var(--text-muted);">${count} MSQs</p></div>`;
  }).join('');
  grid.querySelectorAll('[data-jamb-topic]').forEach(el => {
    el.addEventListener('click', () => startJambTopic(el.dataset.jambTopic));
  });
  const next = document.getElementById('jambNextBtn');
  if (next) next.addEventListener('click', nextJambQuestion);
  ['jambBackTopics', 'jambBackTopics2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => {
      document.getElementById('jambTopicPicker').classList.remove('hidden');
      document.getElementById('jambQuizArea').classList.add('hidden');
      document.getElementById('jambResult').classList.add('hidden');
    });
  });
  const retry = document.getElementById('jambRetryBtn');
  if (retry) retry.addEventListener('click', () => { if (jambState.topic) startJambTopic(jambState.topic); });
}
function startJambTopic(topicId) {
  let questions = topicId === 'all' ? [...jambQuestions] : jambQuestions.filter(q => q.topic === topicId);
  if (!questions.length) { alert('No questions.'); return; }
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  jambState = { topic: topicId, index: 0, score: 0, answered: false, questions };
  document.getElementById('jambTopicPicker').classList.add('hidden');
  document.getElementById('jambResult').classList.add('hidden');
  document.getElementById('jambQuizArea').classList.remove('hidden');
  setText('jambTopicLabel', 'JAMB · ' + topicId);
  renderJambQuestion();
}
function renderJambQuestion() {
  const q = jambState.questions[jambState.index];
  jambState.answered = false;
  setText('jambCounter', `Question ${jambState.index + 1}/${jambState.questions.length}`);
  setStyle('jambProgress', 'width', `${(jambState.index / jambState.questions.length) * 100}%`);
  document.getElementById('jambNextBtn').style.display = 'none';
  document.getElementById('jambFeedback').classList.add('hidden');
  const letters = ['A', 'B', 'C', 'D'];
  document.getElementById('jambQuestion').innerHTML =
    `<div class="tag">${q.topic}</div><div style="font-weight:600;margin:0.75rem 0;">${q.q}</div>` +
    q.options.map((opt, i) => `<div class="option" data-index="${i}"><div class="option-letter">${letters[i]}</div><div>${opt}</div></div>`).join('');
  document.querySelectorAll('#jambQuestion .option').forEach(opt => {
    opt.addEventListener('click', () => {
      if (jambState.answered) return;
      jambState.answered = true;
      const ans = q.answer;
      const idx = parseInt(opt.dataset.index, 10);
      document.querySelectorAll('#jambQuestion .option').forEach((o, i) => {
        if (i === ans) o.classList.add('correct');
        else if (i === idx && idx !== ans) o.classList.add('wrong');
      });
      const fb = document.getElementById('jambFeedback');
      fb.classList.remove('hidden');
      if (idx === ans) { jambState.score++; fb.innerHTML = '<div class="feedback correct">✓ Correct!</div>'; }
      else fb.innerHTML = `<div class="feedback wrong">✗ Answer: ${letters[ans]}</div>`;
      document.getElementById('jambNextBtn').style.display = 'inline-flex';
    });
  });
}
function nextJambQuestion() {
  if (jambState.index < jambState.questions.length - 1) {
    jambState.index++;
    renderJambQuestion();
  } else {
    const pct = Math.round((jambState.score / jambState.questions.length) * 100);
    document.getElementById('jambQuizArea').classList.add('hidden');
    document.getElementById('jambResult').classList.remove('hidden');
    setText('jambFinalScore', pct + '%');
    setText('jambScoreMessage', `Scored ${jambState.score}/${jambState.questions.length}`);
  }
}

function initGames() {
  const match = document.getElementById('startMatchGame');
  const term = document.getElementById('startTermGame');
  const exit = document.getElementById('exitGame');
  if (match) match.addEventListener('click', startMatchGame);
  if (term) term.addEventListener('click', startTermGame);
  if (exit) exit.addEventListener('click', () => document.getElementById('gameArea').classList.add('hidden'));
  window.startMatchGame = startMatchGame;
  window.startTermGame = startTermGame;
}
function startMatchGame() {
  const pairs = [
    { term: 'Nucleus', def: 'Controls cell activities' },
    { term: 'Mitochondrion', def: 'Produces ATP / energy' },
    { term: 'Chloroplast', def: 'Site of photosynthesis' },
    { term: 'Ribosome', def: 'Protein synthesis' },
    { term: 'Cell membrane', def: 'Controls entry & exit' },
    { term: 'Vacuole', def: 'Stores water & maintains turgor' }
  ];
  const items = [];
  pairs.forEach(p => {
    items.push({ text: p.term, pair: p.term });
    items.push({ text: p.def, pair: p.term });
  });
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  let selected = null, matched = 0;
  document.getElementById('gameArea').classList.remove('hidden');
  document.getElementById('gameContent').innerHTML =
    `<h3 style="margin-bottom:1rem;">🔗 Match each organelle to its function</h3>
     <p style="margin-bottom:1rem;color:var(--text-muted);">Matched: <span id="matchCount">0</span> / 6</p>
     <div class="match-grid">${items.map((item, i) => `<div class="match-item" data-index="${i}" data-pair="${item.pair}">${item.text}</div>`).join('')}</div>`;
  document.querySelectorAll('.match-item').forEach(el => {
    el.addEventListener('click', () => {
      if (el.classList.contains('matched')) return;
      if (!selected) { selected = el; el.classList.add('selected'); return; }
      if (selected === el) { el.classList.remove('selected'); selected = null; return; }
      if (selected.dataset.pair === el.dataset.pair) {
        selected.classList.add('matched'); el.classList.add('matched');
        selected.classList.remove('selected');
        matched++; setText('matchCount', matched); selected = null;
        if (matched === 6) {
          document.getElementById('gameContent').innerHTML += `<div class="content-card" style="margin-top:1rem;text-align:center;"><div style="font-size:2.5rem;">🏆</div><h3>Perfect!</h3><button class="btn btn-primary" style="margin-top:0.75rem;" onclick="startMatchGame()">Play Again</button></div>`;
        }
      } else {
        el.classList.add('wrong'); selected.classList.add('wrong');
        const prev = selected;
        setTimeout(() => { el.classList.remove('wrong', 'selected'); prev.classList.remove('wrong', 'selected'); selected = null; }, 500);
      }
    });
  });
}
function startTermGame() {
  const terms = [
    { word: 'PHOTOSYNTHESIS', hint: 'Process by which plants make food' },
    { word: 'MITOCHONDRION', hint: 'Powerhouse of the cell' },
    { word: 'OSMOSIS', hint: 'Diffusion of water across a membrane' },
    { word: 'CHLOROPHYLL', hint: 'Green pigment in plants' }
  ];
  const item = terms[Math.floor(Math.random() * terms.length)];
  const scrambled = item.word.split('').sort(() => Math.random() - 0.5).join('');
  document.getElementById('gameArea').classList.remove('hidden');
  document.getElementById('gameContent').innerHTML =
    `<h3>🔤 Unscramble the Term</h3><p style="color:var(--text-muted);margin-bottom:1rem;">Hint: ${item.hint}</p>
     <div class="content-card" style="text-align:center;">
       <div style="font-size:1.8rem;font-weight:700;letter-spacing:0.2em;margin-bottom:1rem;font-family:monospace;">${scrambled}</div>
       <input type="text" id="scrambleInput" class="note-title-input" placeholder="Type the term..." style="text-align:center;text-transform:uppercase;" />
       <button class="btn btn-primary" id="checkScramble" style="margin-top:0.75rem;">Check</button>
       <div id="scrambleFeedback" style="margin-top:1rem;"></div>
     </div>`;
  document.getElementById('checkScramble').addEventListener('click', () => {
    const val = document.getElementById('scrambleInput').value.trim().toUpperCase();
    const fb = document.getElementById('scrambleFeedback');
    if (val === item.word) {
      fb.innerHTML = `<div class="feedback correct">✓ Correct!</div><button class="btn btn-primary" style="margin-top:0.75rem;" onclick="startTermGame()">Next Word</button>`;
    } else {
      fb.innerHTML = `<div class="feedback wrong">✗ Try again!</div>`;
    }
  });
}

function initNotes() {
  const newBtn = document.getElementById('newNoteBtn');
  if (newBtn) newBtn.addEventListener('click', () => {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteBody').value = '';
    document.getElementById('noteEditor').classList.remove('hidden');
  });
  const save = document.getElementById('saveNoteBtn');
  if (save) save.addEventListener('click', saveNote);
  const cancel = document.getElementById('cancelNoteBtn');
  if (cancel) cancel.addEventListener('click', () => document.getElementById('noteEditor').classList.add('hidden'));
  renderNotes();
}
function getNotes() {
  try { return JSON.parse(localStorage.getItem('profBioNotes') || '[]'); }
  catch { return []; }
}
function saveNotes(notes) {
  localStorage.setItem('profBioNotes', JSON.stringify(notes));
}
function saveNote() {
  const title = document.getElementById('noteTitle').value.trim() || 'Untitled Note';
  const body = document.getElementById('noteBody').value.trim();
  if (!body) { alert('Please write something.'); return; }
  const notes = getNotes();
  notes.unshift({ id: Date.now().toString(), title, body, updated: Date.now() });
  saveNotes(notes);
  document.getElementById('noteEditor').classList.add('hidden');
  renderNotes();
}
function renderNotes() {
  const list = document.getElementById('notesList');
  if (!list) return;
  const notes = getNotes();
  if (!notes.length) {
    list.innerHTML = '<div class="empty-state"><div style="font-size:3rem;">📓</div><p>No notes yet.</p></div>';
    return;
  }
  list.innerHTML = notes.map(n =>
    `<div class="note-item"><h4>${escapeHtml(n.title)}</h4><p style="color:var(--text-muted);font-size:0.85rem;">${escapeHtml(n.body)}</p>
     <button class="btn btn-danger btn-sm" data-delete="${n.id}" style="margin-top:0.5rem;">Delete</button></div>`
  ).join('');
  list.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this note?')) {
        saveNotes(getNotes().filter(n => n.id !== btn.dataset.delete));
        renderNotes();
      }
    });
  });
}
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

let timerInterval = null, timerRemaining = 15 * 60, timerRunning = false, timerTotal = 15 * 60;
function initExamTimer() {
  document.querySelectorAll('.timer-presets button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (timerRunning) return;
      const mins = parseInt(btn.dataset.minutes, 10);
      document.querySelectorAll('.timer-presets button').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.minutes, 10) === mins);
      });
      timerTotal = mins * 60;
      timerRemaining = timerTotal;
      updateTimerDisplay();
    });
  });
  document.querySelectorAll('.timer-start-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (timerRunning) return;
      timerRunning = true;
      document.querySelectorAll('.timer-start-btn').forEach(b => { b.textContent = 'Running...'; });
      timerInterval = setInterval(() => {
        timerRemaining--;
        updateTimerDisplay();
        if (timerRemaining <= 0) {
          clearInterval(timerInterval);
          timerRunning = false;
          document.querySelectorAll('.timer-start-btn').forEach(b => { b.textContent = 'Start'; });
          alert('⏰ Time is up!');
        }
      }, 1000);
    });
  });
  document.querySelectorAll('.timer-pause-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!timerRunning) return;
      clearInterval(timerInterval);
      timerRunning = false;
      document.querySelectorAll('.timer-start-btn').forEach(b => { b.textContent = 'Resume'; });
    });
  });
  document.querySelectorAll('.timer-reset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(timerInterval);
      timerRunning = false;
      timerRemaining = timerTotal;
      document.querySelectorAll('.timer-start-btn').forEach(b => { b.textContent = 'Start'; });
      updateTimerDisplay();
    });
  });
  updateTimerDisplay();
}
function updateTimerDisplay() {
  const m = Math.floor(timerRemaining / 60);
  const s = timerRemaining % 60;
  const text = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  document.querySelectorAll('.timer-display-sync').forEach(display => {
    display.textContent = text;
    display.classList.remove('warning', 'danger');
    if (timerRemaining <= 60 && timerRemaining > 0) display.classList.add('danger');
    else if (timerRemaining <= 180) display.classList.add('warning');
  });
}

function init() {
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('closeBtn');
  const overlay = document.getElementById('overlay');
  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
  document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(el => {
    el.addEventListener('click', () => showPage(el.dataset.page));
  });
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => showPage(el.dataset.goto));
  });
  document.querySelectorAll('.back-btn[data-goto]').forEach(el => {
    el.addEventListener('click', () => showPage(el.dataset.goto));
  });
  updateStreak();
  renderProgress();
  initTheme();
  initExamTimer();
  ensurePageInit('home').catch(() => {});
  initServiceWorker();
  initConnectivityBanners();
}

init();
