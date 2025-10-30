let users = {};
let questions = [];
let adLinks = [];

function loadIDs(callback) {
  fetch('db/id.txt')
    .then(res => res.text())
    .then(text => {
      text.trim().split('\n').forEach(line => {
        const [id, name] = line.split(',');
        if (id && name) users[id.trim()] = name.trim();
      });
      if (callback) callback();
    });
}

function loadQuestions(callback) {
  fetch('db/questions.txt')
    .then(res => res.text())
    .then(text => {
      text.trim().split('\n').forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 5) {
          questions.push({
            q: parts[0],
            a: [parts[1], parts[2], parts[3]],
            correct: parseInt(parts[4])
          });
        }
      });
      if (callback) callback();
    });
}

function loadAds(callback) {
  fetch('db/ads.txt')
    .then(res => res.text())
    .then(text => {
      adLinks = text.trim().split('\n').map(x => x.trim());
      if (callback) callback();
    });
}

// Elements
const loginView = document.getElementById('loginView');
const askView = document.getElementById('askView');
const quizView = document.getElementById('quizView');
const loginBtn = document.getElementById('loginBtn');
const startQuizBtn = document.getElementById('startQuizBtn');
const exitBtn = document.getElementById('exitBtn');
const welcomeAsk = document.getElementById('welcomeAsk');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const timerEl = document.getElementById('timer');

loadIDs(() => {
  loginBtn.addEventListener('click', () => {
    const idNumber = document.getElementById('idNumber').value.trim();
    if (users[idNumber]) {
      localStorage.setItem('username', users[idNumber]);
      welcomeAsk.textContent = `Hi, ${users[idNumber]}!`;
      loginView.style.display = 'none';
      askView.style.display = 'flex';
    } else alert("Invalid ID number.");
  });
});

startQuizBtn.addEventListener('click', () => {
  askView.style.display = 'none';
  quizView.style.display = 'flex';
  loadQuestions(() => showQuestion());
});

exitBtn.addEventListener('click', () => {
  if (adLinks.length > 0) {
    const randomAd = adLinks[Math.floor(Math.random() * adLinks.length)];
    window.open(randomAd, '_blank');
  }
});

let currentQuestion = 0;
let currentTime = 10;

function showQuestion() {
  const q = questions[currentQuestion];
  questionEl.style.opacity = 0;
  answersEl.style.opacity = 0;

  setTimeout(() => {
    questionEl.textContent = q.q;
    answersEl.innerHTML = '';
    q.a.forEach((ans, i) => {
      const btn = document.createElement('button');
      btn.textContent = ans;
      btn.addEventListener('click', () => handleAnswer(btn, i, q.correct));
      answersEl.appendChild(btn);
    });
    questionEl.style.opacity = 1;
    answersEl.style.opacity = 1;
  }, 500);
}

function handleAnswer(btn, selected, correct) {
  const buttons = answersEl.querySelectorAll('button');
  buttons[correct].classList.add('correct');

  if (selected !== correct) {
    btn.classList.add('wrong');
    // Delay 2s before showing ad
    setTimeout(() => {
      if (adLinks.length > 0) {
        const randomAd = adLinks[Math.floor(Math.random() * adLinks.length)];
        window.open(randomAd, '_blank');
      }
    }, 2000);
  } else {
    currentTime++;
  }

  setTimeout(() => {
    currentQuestion = (currentQuestion + 1) % questions.length;
    timerEl.textContent = `Time: ${currentTime} min`;
    showQuestion();
  }, 2000);
}

loadAds();
