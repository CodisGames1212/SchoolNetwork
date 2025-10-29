async function loadExcel() {
  const response = await fetch('spreadsheets/questions.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header:1 });
  data.shift();
  return data.map(row => ({
    q: row[0],
    choices: [row[1], row[2], row[3]],
    a: ['A','B','C'].indexOf(row[4]?.trim().toUpperCase())
  }));
}

let questions = [], index = 0, answers = [];
const questionText = document.getElementById('questionText');
const choicesEl = document.getElementById('choices');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const resultEl = document.getElementById('result');
const scoreValue = document.getElementById('scoreValue');
const summaryText = document.getElementById('summaryText');
const restartBtn = document.getElementById('restartBtn');

function render(){
  const q = questions[index];
  questionText.textContent = q.q;
  choicesEl.innerHTML = '';
  q.choices.forEach((c,i)=>{
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = c;
    if(answers[index] === i) div.classList.add('selected');
    div.onclick = () => select(i);
    choicesEl.appendChild(div);
  });
  prevBtn.disabled = index===0;
  nextBtn.disabled = index===questions.length-1;
}

function select(i){
  answers[index] = i;
  [...choicesEl.children].forEach(c=>c.classList.remove('selected'));
  choicesEl.children[i].classList.add('selected');
}

prevBtn.onclick = ()=>{ index=Math.max(0,index-1); render(); };
nextBtn.onclick = ()=>{ index=Math.min(questions.length-1,index+1); render(); };
submitBtn.onclick = showResults;
restartBtn.onclick = ()=>{
  index=0;answers=Array(questions.length).fill(null);
  resultEl.style.display='none';
  document.getElementById('questionBox').style.display='';
  document.querySelector('.controls').style.display='';
  render();
};

function showResults(){
  let correct=0;
  questions.forEach((q,i)=>{ if(answers[i]===q.a) correct++; });
  scoreValue.textContent = `${correct} / ${questions.length}`;
  summaryText.textContent = `You scored ${Math.round((correct/questions.length)*100)}%`;
  document.getElementById('questionBox').style.display='none';
  document.querySelector('.controls').style.display='none';
  resultEl.style.display='';
}

(async ()=>{
  questions = await loadExcel();
  answers = Array(questions.length).fill(null);
  render();
})();