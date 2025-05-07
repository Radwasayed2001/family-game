// scripts/boxes.js
document.addEventListener('DOMContentLoaded', () => {
  // ——————————————————————————————————————————
  // 1) Load players into module-scope variable
  // ——————————————————————————————————————————
  const playersBoxes = loadPlayers();

  // ——————————————————————————————————————————
  // 2) Game state
  // ——————————————————————————————————————————
  let currentIndexBoxes = 0;
  let boxStartTime      = 0;
  let nextNumber        = 1;
  let timeLeft          = 60;
  let boxResults        = [];

  // ——————————————————————————————————————————
  // 3) DOM references
  // ——————————————————————————————————————————
  const playerDisplay   = document.getElementById('playerBoxName');
  const boxGrid         = document.querySelector('.box-grid');
  const timerDisplay    = document.getElementById('boxTimer');
  const countdownNumber = document.getElementById('boxCountdownNumber');
  const startBtn        = document.getElementById('startBoxesBtn');
  const playAgainBtn    = document.getElementById('boxPlayAgainBtn');
  const backHomeBtn     = document.getElementById('boxBackHomeBtn');

  // ——————————————————————————————————————————
  // 4) Kick off on “Start” and on “Play Again”
  // ——————————————————————————————————————————
  function resetGameState() {
    clearInterval(timerInterval);
    currentIndexBoxes = 0;
    boxResults        = [];
  }

  startBtn.addEventListener('click', () => {
    if (playersBoxes.length < 3) {
      return alert('لعبة الصناديق تحتاج من 3 إلى 12 لاعبًا.');
    }
    resetGameState();
    runBoxTurn();
  });

  playAgainBtn.addEventListener('click', () => {
    resetGameState();
    runBoxTurn();
  });
  backHomeBtn.addEventListener('click', () => showScreen('gamesScreen'));

  // ——————————————————————————————————————————
  // 5) One player’s countdown → challenge
  // ——————————————————————————————————————————
  function runBoxTurn() {
    timeLeft   = 60;
    nextNumber = 1;

    // display current player
    const name = playersBoxes[currentIndexBoxes];
    playerDisplay.textContent = `📱 أعطِ الجهاز إلى: ${name}`;

    // countdown 3…2…1
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

  function startBoxChallenge() {
    showScreen('boxGameScreen');
    setupBoxes();
    boxStartTime = Date.now();

    // 60s timer
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
  // 6) Build 1–20 buttons
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

  function handleBoxClick(num, btn) {
    if (num === nextNumber) {
      btn.classList.add('correct');
      btn.disabled = true;
      nextNumber++;
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
      // mistake: reset challenge
      nextNumber = 1;
      setupBoxes();
    }
  }

  // ——————————————————————————————————————————
  // 7) Next player or final results
  // ——————————————————————————————————————————
  function nextBoxPlayer() {
    currentIndexBoxes++;
    if (currentIndexBoxes < playersBoxes.length) {
      runBoxTurn();
    } else {
      showBoxResults();
    }
  }

  function showBoxResults() {
    // sort, award, persist
    boxResults.sort((a,b) => a.time - b.time);
    const pts = [20,10,5];
    const final = boxResults.map((r,i) => ({
      name:   r.name,
      time:   r.time,
      points: i < 3 ? pts[i] : 0
    }));

    playersBoxes.forEach(p => {
      const prev = parseInt(localStorage.getItem(p)) || 0;
      const curr = final.find(r=>r.name===p)?.points || 0;
      localStorage.setItem(p, prev + curr);
    });

    populateRoundResultsBox(final);
    const total = playersBoxes.map(p=>({
      name:  p,
      total: parseInt(localStorage.getItem(p))||0
    })).sort((a,b)=>b.total - a.total);
    populateTotalResultsBox(total);

    showScreen('boxResultsScreen');
  }

  function populateRoundResultsBox(results) {
    document.getElementById('roundResultsBody1').innerHTML =
      results.map((r,i) => `
        <tr>
          <td>${i+1}</td>
          <td>${r.name}</td>
          <td>${r.time}s</td>
          <td>${r.points}</td>
        </tr>
      `).join('');
  }

  function populateTotalResultsBox(results) {
    document.getElementById('totalResultsBody1').innerHTML =
      results.map((r,i) => `
        <tr>
          <td>${i+1}</td>
          <td>${r.name}</td>
          <td>${r.total}</td>
        </tr>
      `).join('');
  }

});
