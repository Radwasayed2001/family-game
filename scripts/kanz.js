// scripts/treasure.js
// Dependencies: loadPlayers(), showScreen(id)

let timerIntervalT = null;

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM refs ---
  const durationSelect   = document.getElementById("roundDuration");
  const startGameButtonT = document.getElementById("startGameButtonT");
  const nextButton       = document.getElementById("nextButton");
  const startRoundButton = document.getElementById("startRoundButton");
  const phoneFoundButton = document.getElementById("phoneFoundButton");
  const giveUpButton     = document.getElementById("giveUpButton");
  const playersList      = document.getElementById("playersList");
  const resultsBody      = document.getElementById("resultsBody");
  const timeLeftDisplay  = document.getElementById("timeLeft");
  const hiderNameDisplay = document.getElementById("hiderName");

  // --- State & scores ---
  const playersT = loadPlayers();
  const scoresT  = {};
  let currentPlayerIndexT = 0;
  let hiderPlayer = null;
  let roundDurationT = 2;  // minutes
  let secondsRemaining = 0;

  // initialize scores from localStorage
  playersT.forEach(name => {
    scoresT[name] = {
      wins: 0,
      roundPoints: 0,
      totalPoints: parseInt(localStorage.getItem(name)) || 0
    };
  });

  // --- Step 1: pick hider and go to settings ---
  startGameButtonT.addEventListener("click", () => {
    roundDurationT = parseInt(durationSelect.value, 10);
    hiderPlayer   = playersT[currentPlayerIndexT];
    hiderNameDisplay.textContent = hiderPlayer;
    showScreen("hidePhoneScreen");
  });

  nextButton.onclick = () => {
    if (playersT.length < 3) {
      showAlert('error',
        `لعبة الكنز تتطلب 3 لاعبين على الأقل! الآن: ${playersT.length}`);
      return;
    }
    showScreen('gameSettingsScreen');
  };

  // --- Step 2: start round countdown ---
  startRoundButton.addEventListener("click", () => {
    secondsRemaining = roundDurationT * 60;
    updateTimeDisplay();
    showScreen("roundRunningScreen");

    timerIntervalT = setInterval(() => {
      secondsRemaining--;
      updateTimeDisplay();
      if (secondsRemaining <= 0) {
        clearInterval(timerIntervalT);
        handleHiderWins();  // nobody found
      }
    }, 1000);
  });

  function updateTimeDisplay() {
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    timeLeftDisplay.textContent = `${m}:${s.toString().padStart(2,"0")}`;
  }

  // --- Step 3: someone finds the phone ---
  phoneFoundButton.addEventListener("click", () => {
    clearInterval(timerIntervalT);
    showWinnerSelection();
  });

  // --- Step 4: give up (treated as nobody found) ---
  giveUpButton.addEventListener("click", () => {
    clearInterval(timerIntervalT);
    handleHiderWins();
  });

  // --- build list to pick who found it ---
  function showWinnerSelection() {
    playersList.innerHTML = "";
    playersT.forEach(name => {
      if (name === hiderPlayer) return; // hider cannot find
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.className = "player-btn";
      btn.addEventListener("click", () => handleFinder(name));
      const li = document.createElement("li");
      li.appendChild(btn);
      playersList.appendChild(li);
    });
    showScreen("selectWinnerScreen");
  }

  // --- only the finder gets 10 points ---
  function handleFinder(finder) {
    scoresT[finder].wins++;
    scoresT[finder].roundPoints = 10;
    scoresT[finder].totalPoints += 10;
    localStorage.setItem(finder, scoresT[finder].totalPoints);
    advanceRound();
  }

  // --- hider wins 20 if nobody found ---
  function handleHiderWins() {
    scoresT[hiderPlayer].wins++;
    scoresT[hiderPlayer].roundPoints = 20;
    scoresT[hiderPlayer].totalPoints += 20;
    localStorage.setItem(hiderPlayer, scoresT[hiderPlayer].totalPoints);
    advanceRound();
  }

  // --- move to next hider or show final results ---
  function advanceRound() {
    // reset roundPoints
    playersT.forEach(p => { scoresT[p].roundPoints = 0; });
    currentPlayerIndexT = (currentPlayerIndexT + 1) % playersT.length;

    if (currentPlayerIndexT === 0) {
      showResultsT();
    } else {
      hiderPlayer = playersT[currentPlayerIndexT];
      hiderNameDisplay.textContent = hiderPlayer;
      showScreen("hidePhoneScreen");
    }
  }

  // --- final results table ---
  function showResultsT() {
    const sorted = [...playersT].sort((a,b) =>
      scoresT[b].totalPoints - scoresT[a].totalPoints
    );

    resultsBody.innerHTML = sorted.map((player, idx) => {
      const { wins, roundPoints, totalPoints } = scoresT[player];
      return `
        <tr>
          <td>${idx+1}</td>
          <td>${player}</td>
          <td>${wins}</td>
          <td>${roundPoints}</td>
          <td>${totalPoints}</td>
        </tr>
      `;
    }).join('');

    showScreen("resultsScreenT");
  }
});
