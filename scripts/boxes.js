// scripts/boxes.js

let boxTimerIntervalBox = null;
let boxCountDownIntervalBox = null;
let boxAdvanceTimeoutBox = null;

// مسح كل المؤقتات
function clearBoxAllTimers() {
  if (boxTimerIntervalBox !== null) {
    clearInterval(boxTimerIntervalBox);
    boxTimerIntervalBox = null;
  }
  if (boxCountDownIntervalBox !== null) {
    clearInterval(boxCountDownIntervalBox);
    boxCountDownIntervalBox = null;
  }
  if (boxAdvanceTimeoutBox !== null) {
    clearTimeout(boxAdvanceTimeoutBox);
    boxAdvanceTimeoutBox = null;
  }
}

// تغيير الشاشة مع مسح كل المؤقتات
function showScreen(id) {
  clearBoxAllTimers();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  const playersBoxes = loadPlayers();
  let currentPlayer = 0, nextNumber = 1, timeLeft = 60, startTime = 0;
  let boxResults = [];

  // DOM refs
  const playerLabel     = document.getElementById('playerBoxName');
  const countdownNumber = document.getElementById('boxCountdownNumber');
  const timerLabel      = document.getElementById('boxTimer');
  const grid            = document.querySelector('.box-grid');
  const startBtn        = document.getElementById('startBoxesBtn');
  const againBtn        = document.getElementById('boxPlayAgainBtn');
  const homeBtn         = document.getElementById('boxBackHomeBtn');

  function resetGame() {
    clearBoxAllTimers();
    currentPlayer = 0;
    boxResults = [];
  }

  startBtn.addEventListener('click', () => {
    if (playersBoxes.length < 3) return showAlert('error','يحتاج 3 لاعبين على الأقل');
    resetGame();
    playTurn();
  });
  againBtn.addEventListener('click', () => {
    resetGame();
    playTurn();
  });
  homeBtn.addEventListener('click', () => showScreen('gamesScreen'));

  function playTurn() {
    nextNumber = 1;
    timeLeft = 60;

    playerLabel.textContent = `📱 دور: ${playersBoxes[currentPlayer]}`;
    showScreen('boxCountdownScreen');

    // عدّ تنازلي 3
    let c = 3;
    countdownNumber.textContent = c;
    boxCountDownIntervalBox = setInterval(() => {
      c--;
      countdownNumber.textContent = c;
      if (c <= 0) {
        clearInterval(boxCountDownIntervalBox);
        boxCountDownIntervalBox = null;
        startChallenge();
      }
    }, 1000);
  }

  function startChallenge() {
    showScreen('boxGameScreen');
    startTime = Date.now();
    renderBoxes();

    timerLabel.textContent = `⏰ ${timeLeft}s`;
    boxTimerIntervalBox = setInterval(() => {
      timeLeft--;
      timerLabel.textContent = `⏰ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(boxTimerIntervalBox);
        boxTimerIntervalBox = null;
        recordResult(90);
        boxAdvanceTimeoutBox = setTimeout(nextPlayer, 300);
      }
    }, 1000);
  }

  function renderBoxes() {
    const nums = Array.from({ length: 20 }, (_, i) => i+1).sort(() => Math.random()-0.5);
    grid.innerHTML = '';
    nums.forEach(n => {
      const btn = document.createElement('button');
      btn.className = 'box';
      btn.textContent = n;
      btn.onclick = () => handleClick(n, btn);
      grid.appendChild(btn);
    });
  }

  function handleClick(n, btn) {
    if (n === nextNumber) {
      btn.classList.add('correct');
      btn.disabled = true;
      nextNumber++;
      if (nextNumber > 20) {
        clearInterval(boxTimerIntervalBox);
        boxTimerIntervalBox = null;
        const elapsed = ((Date.now() - startTime)/1000).toFixed(2);
        recordResult(parseFloat(elapsed));
        boxAdvanceTimeoutBox = setTimeout(nextPlayer, 300);
      }
    } else {
      nextNumber = 1;
      renderBoxes();
    }
  }

  function recordResult(time) {
    boxResults.push({ name: playersBoxes[currentPlayer], time });
  }

  function nextPlayer() {
    currentPlayer++;
    if (currentPlayer < playersBoxes.length) {
      playTurn();
    } else {
      showResults();
    }
  }

  function showResults() {
    boxResults.sort((a,b)=>a.time-b.time);
    const pts = [20,10,5];
    const final = boxResults.map((r,i)=>({
      name: r.name,
      time: r.time,
      points: i<3?pts[i]:0
    }));
    // تحديث localStorage
    playersBoxes.forEach(p=>{
      const prev = +localStorage.getItem(p)||0;
      const curr = final.find(r=>r.name===p)?.points||0;
      localStorage.setItem(p, prev+curr);
    });
    // عرض الجداول
    document.getElementById('roundResultsBody1').innerHTML =
      final.map((r,i)=>`
        <tr><td>${i+1}</td><td>${r.name}</td><td>${r.time}s</td><td>${r.points}</td></tr>
      `).join('');
    const total = playersBoxes.map(p=>({
      name:p, total:+localStorage.getItem(p)||0
    })).sort((a,b)=>b.total-a.total);
    document.getElementById('totalResultsBody1').innerHTML =
      total.map((r,i)=>`
        <tr><td>${i+1}</td><td>${r.name}</td><td>${r.total}</td></tr>
      `).join('');
    showScreen('boxResultsScreen');
  }
});
