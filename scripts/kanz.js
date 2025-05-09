// scripts/treasure.js
// Dependencies: loadPlayers(), showScreen(id)

document.addEventListener('DOMContentLoaded', () => {
  // عناصر DOM
  const durationSelect   = document.getElementById("roundDuration");
  const startGameButtonT = document.getElementById("startGameButtonT");
  const startRoundButton = document.getElementById("startRoundButton");
  const phoneFoundButton = document.getElementById("phoneFoundButton");
  const giveUpButton     = document.getElementById("giveUpButton");
  const playersList      = document.getElementById("playersList");
  const resultsBody      = document.getElementById("resultsBody");
  const timeLeftDisplay  = document.getElementById("timeLeft");
  const hiderName        = document.getElementById("hiderName");

  // بيانات اللاعبين
  const playersT = loadPlayers(); // [ "Alice", "Bob", ... ]

  // scoresT structure: { "Alice": { wins: 0, roundPoints: 0, totalPoints: 0 }, ... }
  const scoresT = {};
  let currentPlayerIndexT = 0;
  let roundDurationT      = 2; // دقائق
  let timerIntervalT;
  let secondsRemaining    = 0;

  // تهيئة النقاط من localStorage
  playersT.forEach(name => {
    scoresT[name] = {
      wins: 0,
      roundPoints: 0,
      totalPoints: parseInt(localStorage.getItem(name)) || 0
    };
  });

  // العودة للقائمة الرئيسية

  // بدء اللعبة: اختر مدة الجولة
  startGameButtonT.addEventListener("click", () => {
    roundDurationT = parseInt(durationSelect.value, 10);
    hiderName.textContent = playersT[currentPlayerIndexT];
    showScreen("hidePhoneScreen");
  });

  // بدء العد التنازلي
  startRoundButton.addEventListener("click", () => {
    secondsRemaining = roundDurationT * 60;
    updateTimeDisplay();
    showScreen("roundRunningScreen");
    timerIntervalT = setInterval(() => {
      secondsRemaining--;
      updateTimeDisplay();
      if (secondsRemaining <= 0) {
        clearInterval(timerIntervalT);
        showWinnerScreen();
      }
    }, 1000);
  });

  function updateTimeDisplay() {
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    timeLeftDisplay.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  }

  // عند العثور على الهاتف
  phoneFoundButton.addEventListener("click", () => {
    clearInterval(timerIntervalT);
    // يحصل الـ hider على صفر نقاط هذه الجولة
    scoresT[playersT[currentPlayerIndexT]].roundPoints = 0;
    showWinnerScreen();
  });

  // استسلام: يعطي صفر نقاط أيضاً
  giveUpButton.addEventListener("click", () => {
    clearInterval(timerIntervalT);
    scoresT[playersT[currentPlayerIndexT]].roundPoints = 0;
    showWinnerScreen();
  });

  // عرض شاشة اختيار الذي وجد الهاتف
  function showWinnerScreen() {
    playersList.innerHTML = "";
    playersT.forEach(name => {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.className = "player-btn";
      btn.addEventListener("click", () => handleWinnerSelected(name));
      const li = document.createElement("li");
      li.appendChild(btn);
      playersList.appendChild(li);
    });
    showScreen("selectWinnerScreen");
  }

  // من اختار الفائز يضاف له 10 نقاط
  function handleWinnerSelected(winner) {
    scoresT[winner].wins++;
    scoresT[winner].roundPoints = 10;
    scoresT[winner].totalPoints += 10;

    // حدِّث localStorage
    localStorage.setItem(winner, scoresT[winner].totalPoints);

    nextRoundT();
  }

  // انتقال لجولة تالية أو عرض النتيجة النهائية
  function nextRoundT() {
    // دورة اللاعب التالي
    currentPlayerIndexT = (currentPlayerIndexT + 1) % playersT.length;
    hiderName.textContent = playersT[currentPlayerIndexT];
    showResultsT();
  }

  // عرض نتائج اللعبة كما في باقي الألعاب
  function showResultsT() {
    // رتب وفق المجموع الكلي
    const sorted = [...playersT].sort((a, b) =>
      scoresT[b].totalPoints - scoresT[a].totalPoints
    );

    // أفرغ الجدول ثم أضف الصفوف
    resultsBody.innerHTML = "";
    sorted.forEach((player, idx) => {
      const { wins, roundPoints, totalPoints } = scoresT[player];
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${player}</td>
        <td>${wins}</td>
        <td>${roundPoints}</td>
        <td>${totalPoints}</td>
      `;
      resultsBody.appendChild(row);
    });

    // بعد العرض، صفِّر نقاط الجولة لكل اللاعبين
    playersT.forEach(p => scoresT[p].roundPoints = 0);

    showScreen("resultsScreenT");
  }
});
