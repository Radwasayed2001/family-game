// عناصر الشا
  // باقي العناصر
  const durationSelect = document.getElementById("roundDuration");
  const startGameButtonT = document.getElementById("startGameButtonT");
  const startRoundButton = document.getElementById("startRoundButton");
  const phoneFoundButton = document.getElementById("phoneFoundButton");
  const giveUpButton = document.getElementById("giveUpButton");
  const playersList = document.getElementById("playersList");
  const resultsBody = document.getElementById("resultsBody");
  const timeLeftDisplay = document.getElementById("timeLeft");
  const hiderName = document.getElementById("hiderName");
  
  // بيانات اللاعبين
  let playersT = loadPlayers();
  let scoresT = {};
  let currentPlayerIndexT = 0;
  let roundDurationT = 2; // بالدقائق
  let timerIntervalT;
  let secondsRemaining = 0;
  
  // تجهيز بيانات أولية
  playersT.forEach(name => {
    scoresT[name] = { wins: 0, roundPoints: 0, totalPoints: localStorage.getItem(name)*1 || 0 };
  });
  
  // عرض شاشة معينة فقط
  
  // بدء اللعبة
  startGameButtonT.addEventListener("click", () => {
    roundDurationT = parseInt(durationSelect.value);
    hiderName.textContent = playersT[currentPlayerIndexT];
    showScreen("hidePhoneScreen");
  });
  
  // بدء الجولة
  startRoundButton.addEventListener("click", () => {
    secondsRemaining = roundDurationT * 60;
    updateTimeDisplay();
    showScreen("roundRunningScreen");
    timerIntervalT = setInterval(() => {
      secondsRemaining--;
      updateTimeDisplay();
      if (secondsRemaining <= 0) {
        clearInterval(timerIntervalT);
        showWinnerScreen(); // نهاية الوقت
      }
    }, 1000);
  });
  
  // تحديث عداد الوقت
  function updateTimeDisplay() {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    timeLeftDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // عند العثور على الهاتف
  phoneFoundButton.addEventListener("click", () => {
    showWinnerScreen();
    clearInterval(timerIntervalT);
  });
  
  // لم يتم العثور على الهاتف
  giveUpButton.addEventListener("click", () => {
    scoresT[playersT[currentPlayerIndexT]].roundPoints = 0;
    scoresT[playersT[currentPlayerIndexT]].totalPoints += 0;
    nextRoundT();
  });
  
  // عرض أسماء اللاعبين للاختيار
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
  
  // تحديد اللاعب الفائز
  function handleWinnerSelected(name) {
    scoresT[name].wins++;
    scoresT[name].roundPoints = 10;
    scoresT[name].totalPoints += 10;
    nextRoundT();
  }
  
  // انتقال للجولة التالية أو عرض النتيجة
  function nextRoundT() {
    showResultsT();
    currentPlayerIndexT = (currentPlayerIndexT + 1) % playersT.length;
    hiderName.textContent = playersT[currentPlayerIndexT];
  }
  
  // عرض النتائج
  function showResultsT() {
    const sorted = [...playersT].sort((a, b) => scoresT[b].totalPoints - scoresT[a].totalPoints);
    resultsBody.innerHTML = "";
    sorted.forEach((player, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player}</td>
        <td>${scoresT[player].wins}</td>
        <td>${scoresT[player].roundPoints}</td>
        <td>${scoresT[player].totalPoints}</td>
      `;
      resultsBody.appendChild(row);
    });
  
    showScreen("resultsScreenT");
  
    // إعادة تعيين النقاط المؤقتة للجولة
    playersT.forEach(p => scoresT[p].roundPoints = 0);
  }
  