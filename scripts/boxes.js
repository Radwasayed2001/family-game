// scripts/boxes.js

// ——————————————————————————————————————————
// 1) Load players into module‐scope variable
// ——————————————————————————————————————————
const playersBoxes = loadPlayers();  // now always available

// ——————————————————————————————————————————
// 2) Game state (also module‐scope)
// ——————————————————————————————————————————
let currentIndexBoxes = 0;
let boxStartTime      = 0;
let nextNumber        = 1;
let timerInterval     = null;
let timeLeft          = 60;
let boxResults        = [];  // will be reset on (re)start

// ——————————————————————————————————————————
// 3) DOM references
// ——————————————————————————————————————————
const playerDisplay   = document.getElementById('playerBoxName');
const boxGrid         = document.querySelector('.box-grid');
const timerDisplay    = document.getElementById('boxTimer');
const countdownScreen = document.getElementById('boxCountdownScreen');
const countdownNumber = document.getElementById('boxCountdownNumber');
const gameScreen      = document.getElementById('boxGameScreen');
const resultsScreen   = document.getElementById('boxResultsScreen');
const boxPlayAgainBtn = document.getElementById('boxPlayAgainBtn');
const boxBackHomeBtn  = document.getElementById('boxBackHomeBtn');
const startBtn        = document.getElementById('startBoxesBtn');

// ——————————————————————————————————————————
// 4) show/hide screens helper
// ——————————————————————————————————————————



// ——————————————————————————————————————————
// 6) Start game (first time)
// ——————————————————————————————————————————
startBtn.addEventListener('click', () => {
  if (playersBoxes.length < 3) {
    return alert('لعبة الصناديق تحتاج من 3 إلى 12 لاعبًا.');
  }
  resetGameState();
  runBoxTurn();
});

// ——————————————————————————————————————————
// 7) “Play again” just restarts entire flow
// ——————————————————————————————————————————
boxPlayAgainBtn.addEventListener('click', () => {
  resetGameState();
  runBoxTurn();
});
boxBackHomeBtn.addEventListener('click', () => {
  showScreen('gamesScreen');
});

// ——————————————————————————————————————————
// 8) Reset everything between full plays
// ——————————————————————————————————————————
function resetGameState() {
  clearInterval(timerInterval);
  currentIndexBoxes = 0;
  boxResults        = [];
}

// ——————————————————————————————————————————
// 9) Run one player’s turn (countdown)
// ——————————————————————————————————————————
function runBoxTurn() {
  // reset per-turn only
  timeLeft   = 60;
  nextNumber = 1;

  // show player prompt
  const name = playersBoxes[currentIndexBoxes];
  playerDisplay.textContent = `📱 أعطِ الجهاز إلى: ${name}`;

  // show countdown screen
  showScreen('boxCountdownScreen');
  let count = 3;
  countdownNumber.textContent = count;
  const iv = setInterval(() => {
    count--;
    countdownNumber.textContent = count;
    if (count <= 0) {
      clearInterval(iv);
      startBoxChallenge();
    }
  }, 1000);
}

// ——————————————————————————————————————————
// 10) Start the actual challenge
// ——————————————————————————————————————————
function startBoxChallenge() {
  showScreen('boxGameScreen');
  setupBoxes();
  boxStartTime = Date.now();

  // start 60s timer
  timerDisplay.textContent = `⏰ ${timeLeft}s`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏰ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      boxResults.push({ 
        name: playersBoxes[currentIndexBoxes], 
        time: 90 
      });
      setTimeout(nextBoxPlayer, 300);
    }
  }, 1000);
}

// ——————————————————————————————————————————
// 11) Setup 20 randomized boxes
// ——————————————————————————————————————————
function setupBoxes() {
  const numbers = Array.from({ length: 20 }, (_, i) => i + 1)
                       .sort(() => Math.random() - 0.5);
  boxGrid.innerHTML = '';
  numbers.forEach(num => {
    const btn = document.createElement('button');
    btn.className = 'box';
    btn.textContent = num;
    btn.addEventListener('click', () => handleBoxClick(num, btn));
    boxGrid.appendChild(btn);
  });
}

// ——————————————————————————————————————————
// 12) Handle clicks
// ——————————————————————————————————————————
function handleBoxClick(num, btn) {
  if (num === nextNumber) {
    btn.classList.add('correct');
    btn.disabled = true;
    nextNumber++;
    // finished all 20?
    if (nextNumber > 20) {
      clearInterval(timerInterval);
      const elapsed = ((Date.now() - boxStartTime) / 1000).toFixed(2);
      boxResults.push({ 
        name: playersBoxes[currentIndexBoxes], 
        time: parseFloat(elapsed) 
      });
      setTimeout(nextBoxPlayer, 300);
    }
  } else {
    // mistake: reset order
    nextNumber = 1;
    setupBoxes();
  }
}

// ——————————————————————————————————————————
// 13) Next player or results
// ——————————————————————————————————————————
function nextBoxPlayer() {
  currentIndexBoxes++;
  if (currentIndexBoxes < playersBoxes.length) {
    runBoxTurn();
  } else {
    showBoxResults();
  }
}

// ——————————————————————————————————————————
// 14) Final results
// ——————————————————————————————————————————
function showBoxResults() {
  // sort by time ascending
  boxResults.sort((a,b)=> a.time - b.time);
  const pointsArray = [20,10,5];
  const finalResults = boxResults.map((r,i)=>({
    name:   r.name,
    time:   r.time,
    points: i < 3 ? pointsArray[i] : 0
  }));

  // persist cumulative
  playersBoxes.forEach(p => {
    const prev = parseInt(localStorage.getItem(p))||0;
    const curr = finalResults.find(r=>r.name===p)?.points||0;
    localStorage.setItem(p, prev + curr);
  });

  // render tables
  populateRoundResults(finalResults);
  const totalResults = playersBoxes
    .map(p=>({ name:p, total: parseInt(localStorage.getItem(p))||0 }))
    .sort((a,b)=>b.total - a.total);
  populateTotalResults(totalResults);

  showScreen('boxResultsScreen');
}

function populateRoundResults(results) {
  const tbody = document.getElementById('roundResultsBody1');
  tbody.innerHTML = results.map((r,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${r.name}</td>
      <td>${r.time}s</td>
      <td>${r.points}</td>
    </tr>
  `).join('');
}

function populateTotalResults(results) {
  const tbody = document.getElementById('totalResultsBody1');
  tbody.innerHTML = results.map((r,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${r.name}</td>
      <td>${r.total}</td>
    </tr>
  `).join('');
}
