const loginContainer = document.getElementById('login-container');
const promptContainer = document.getElementById('prompt-container');
const quizContainer = document.getElementById('quiz-container');

const idInput = document.getElementById('idInput');
const loginBtn = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');

const exitBtn = document.getElementById('exitBtn');
const continueBtn = document.getElementById('continueBtn');

const userInfo = document.getElementById('userInfo');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const resultEl = document.getElementById('result');
const liveScore = document.getElementById('liveScore');

let users = [];
let questions = [];
let ads = [];
let index = 0;
let score = 0;
let currentUser = null;

// --- Load Excel Files ---
async function loadUsers() {
  const res = await fetch('spreadsheets/users.xlsx');
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  users = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
}

async function loadQuestions() {
  const res = await fetch('spreadsheets/questions.xlsx');
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);
  questions = json.map(row => ({ question: row.Question }));
}

async function loadAds() {
  const res = await fetch('spreadsheets/ads.xlsx');
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  ads = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
}

// --- Login Logic ---
loginBtn.onclick = async () => {
  if (!users.length) await loadUsers();
  const id = idInput.value.trim();
  const found = users.find(u => u['ID number'] == id);

  if (found) {
    currentUser = found;
    loginMessage.textContent = '';
    loginContainer.style.display = 'none';
    promptContainer.style.display = 'block';
  } else {
    loginMessage.textContent = '❌ Invalid ID number.';
    loginMessage.style.color = 'red';
  }
};

// --- Prompt Buttons ---
exitBtn.onclick = async () => {
  if (!ads.length) await loadAds();
  if (!ads.length) return alert("No ads available.");

  const randomAd = ads[Math.floor(Math.random() * ads.length)];
  if (randomAd.Link) window.open(randomAd.Link, "_blank");
};

continueBtn.onclick = async () => {
  promptContainer.style.display = 'none';
  quizContainer.style.display = 'block';
  userInfo.textContent = `Welcome, ${currentUser['FULL NAME']} (ID: ${currentUser['ID number']})`;
  await loadQuestions();
  startAutoQuiz();
};

// --- Auto Quiz Logic ---
async function startAutoQuiz() {
  index = 0;
  score = 0;
  liveScore.textContent = `Score: ${score}`;
  showAutoQuestion();
}

function showAutoQuestion() {
  if (index >= questions.length) {
    showResult();
    return;
  }

  const q = questions[index];
  quizContainer.style.opacity = 0;
  setTimeout(() => {
    questionEl.textContent = q.question;
    choicesEl.innerHTML = ''; // remove buttons
    quizContainer.style.opacity = 1;
  }, 500);

  setTimeout(() => {
    index++;
    showAutoQuestion();
  }, 3000);
}

function showResult() {
  quizContainer.style.opacity = 0;
  setTimeout(() => {
    questionEl.textContent = '✅ Quiz Completed!';
    resultEl.textContent = `You viewed ${questions.length} questions.`;
    quizContainer.style.opacity = 1;
  }, 500);
}

window.onload = loadUsers;
