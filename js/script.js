// -------------------------
// DYNAMIC LOAD: IDs, QUESTIONS, ADS
// -------------------------
let users = {};
let questions = [];
let adLinks = [];

// Load user IDs and names
function loadIDs(callback) {
    fetch('spreadsheet/id.xlsx')
        .then(res => res.arrayBuffer())
        .then(buffer => {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row[0] && row[1]) users[row[0]] = row[1];
            }
            if (callback) callback();
        })
        .catch(err => console.error('Error loading id.xlsx:', err));
}

// Load quiz questions
function loadQuestions(callback) {
    fetch('spreadsheet/questions.xlsx')
        .then(res => res.arrayBuffer())
        .then(buffer => {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                questions.push({
                    q: row[0],
                    a: [row[1], row[2], row[3]],
                    correct: parseInt(row[4])
                });
            }
            if (callback) callback();
        })
        .catch(err => console.error('Error loading questions.xlsx:', err));
}

// Load ads
function loadAds(callback) {
    fetch('spreadsheet/ads.xlsx')
        .then(res => res.arrayBuffer())
        .then(buffer => {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row[0]) adLinks.push(row[0]);
            }
            if (callback) callback();
        })
        .catch(err => console.error('Error loading ads.xlsx:', err));
}

// -------------------------
// DOM ELEMENTS
// -------------------------
const loginView = document.getElementById('loginView');
const askView = document.getElementById('askView');
const quizView = document.getElementById('quizView');

const loginBtn = document.getElementById('loginBtn');
const startQuizBtn = document.getElementById('startQuizBtn');
const exitBtn = document.getElementById('exitBtn');

const welcomeAsk = document.getElementById('welcomeAsk');
const welcomeQuiz = document.getElementById('welcomeQuiz');

const questionContainer = document.getElementById('question-container');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const timerEl = document.getElementById('timer');

// -------------------------
// LOGIN LOGIC
// -------------------------
loadIDs(() => {
    loginBtn.addEventListener('click', () => {
        const idNumber = document.getElementById('idNumber').value;
        if (users[idNumber]) {
            localStorage.setItem('username', users[idNumber]);
            welcomeAsk.textContent = `Hi, ${users[idNumber]}!`;
            loginView.style.display = 'none';
            askView.style.display = 'block';
        } else {
            alert("ID not found!");
        }
    });
});

// -------------------------
// ASK VIEW BUTTONS
// -------------------------
startQuizBtn.addEventListener('click', () => {
    askView.style.display = 'none';
    quizView.style.display = 'block';
    welcomeQuiz.textContent = `Hi, ${localStorage.getItem('username') || 'Guest'}!`;
    loadQuestions(() => {
        showQuestion();
    });
});

exitBtn.addEventListener('click', () => {
    if (adLinks.length > 0) {
        const randomAd = adLinks[Math.floor(Math.random() * adLinks.length)];
        window.open(randomAd, '_blank');
    } else {
        window.open('https://example.com/defaultAd', '_blank');
    }
});

// -------------------------
// QUIZ LOGIC
// -------------------------
let currentQuestion = 0;
let currentTime = 10;

function showQuestion() {
    const q = questions[currentQuestion];

    // fade out question/answers
    questionEl.style.opacity = 0;
    answersEl.style.opacity = 0;

    setTimeout(() => {
        questionEl.textContent = q.q;
        answersEl.innerHTML = '';

        q.a.forEach((ans, i) => {
            const btn = document.createElement('button');
            btn.textContent = ans;

            btn.addEventListener('click', () => {
                const buttons = answersEl.querySelectorAll('button');
                buttons[q.correct].classList.add('correct');

                if (i !== q.correct) {
                    btn.classList.add('wrong');
                    if (adLinks.length > 0) {
                        const randomAd = adLinks[Math.floor(Math.random() * adLinks.length)];
                        window.open(randomAd, '_blank');
                    }
                } else currentTime++;

                setTimeout(() => {
                    currentQuestion = (currentQuestion + 1) % questions.length;
                    showQuestion();
                    timerEl.textContent = `Time: ${currentTime} min`;
                }, 3000);
            });

            answersEl.appendChild(btn);
        });

        // fade in
        questionEl.style.transition = "opacity 0.5s";
        answersEl.style.transition = "opacity 0.5s";
        questionEl.style.opacity = 1;
        answersEl.style.opacity = 1;
    }, 500);
}

// Load ads once on page load
loadAds();
