// scripts/similar.js

// ───────────────
// مؤقتات عامة
// ───────────────
let imageCountdownInterval = null;
let advanceTimeoutSim         = null;

// يمسح كل مؤقتات العدّ التنازلي والمؤقتات المتأخرة
function clearAllTimersSim() {
  if (imageCountdownInterval !== null) {
    clearInterval(imageCountdownInterval);
    imageCountdownInterval = null;
  }
  if (advanceTimeoutSim !== null) {
    clearTimeout(advanceTimeoutSim);
    advanceTimeoutSim = null;
  }
}

// تبديل الشاشات + تنظيف المؤقتات
function showScreenSim(id) {
  clearAllTimersSim();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  // تحميل قائمة اللاعبين
  const picPlayers   = loadPlayers();
  let currentIndex   = 0;
  let imageStartTime = 0;
  let dupUrl         = '';
  let attempts       = 0;
  let roundResults   = [];

  // مراجع DOM
  const displayNum   = document.getElementById('countdownNumber');
  const displayName  = document.getElementById('playerNameDisplay');
  const grid         = document.querySelector('.image-grid');
  const startBtn     = document.getElementById('startSimilarBtn');
  const againBtn     = document.getElementById('playAgainBtn');
  const homeBtn      = document.getElementById('backHomeBtn');

  // إعادة تهيئة الحالة لكل لعبة
  function resetGame() {
    clearAllTimersSim();
    currentIndex = 0;
    dupUrl       = '';
    attempts     = 0;
    roundResults = [];
  }

  // زرّ البدء
  startBtn.addEventListener('click', () => {
    if (picPlayers.length === 0) {
      alert('لا يوجد لاعبين!');
      return;
    }
    resetGame();
    runTurn();
  });

  // زر إعادة اللعب
  againBtn.addEventListener('click', () => {
    resetGame();
    runTurn();
  });

  // زر العودة للقائمة
  homeBtn.addEventListener('click', () => showScreenSim('gamesScreen'));

  // 1) دور اللاعب: عدّ تنازلي
  function runTurn() {
    attempts = 0;
    const name = picPlayers[currentIndex];
    displayName.textContent = `📱 دور: ${name}`;

    showScreenSim('countdownScreen');
    let count = 3;
    displayNum.textContent = count;
    displayNum.classList.add('pop');

    clearAllTimersSim();
    imageCountdownInterval = setInterval(() => {
      count--;
      displayNum.classList.remove('pop');
      void displayNum.offsetWidth;
      displayNum.classList.add('pop');
      displayNum.textContent = count;
      if (count <= 0) {
        clearInterval(imageCountdownInterval);
        imageCountdownInterval = null;
        startImagePhase();
      }
    }, 1000);
  }

  // 2) عرض الصور
  function startImagePhase() {
    showScreenSim('imagesScreen');
    setupImages();
  }

  function setupImages() {
    const start   = Math.floor(Math.random() * 12) + 1;
    const names   = Array.from({ length: 24 }, (_, i) => `${start + i}.avif`);
    const dupIdx  = Math.floor(Math.random() * names.length);
    dupUrl        = `./public/${names[dupIdx]}`;

    const final = names.map(n => `./public/${n}`);
    for (let i = 0; i < 2; i++) {
      let pos;
      do {
        pos = Math.floor(Math.random() * (final.length + 1));
      } while (final[pos] === dupUrl);
      final.splice(pos, 0, dupUrl);
    }
    final.length = 25;
    final.sort(() => Math.random() - 0.5);
    imageStartTime = Date.now();

    grid.innerHTML = '';
    final.forEach(src => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `<img src="${src}" alt="">`;
      card.onclick   = () => onImageClick(src, card);
      grid.appendChild(card);
    });
  }

  // 3) التعامل مع نقر الصور
  function onImageClick(src, card) {
    if (!dupUrl) return;
    const name = picPlayers[currentIndex];

    if (src === dupUrl) {
      const elapsed = ((Date.now() - imageStartTime) / 1000).toFixed(2);
      roundResults.push({
        name,
        time: parseFloat(elapsed),
        attempts,
        points: 0
      });
      card.classList.add('matched');
      dupUrl = '';
      advanceTimeoutSim = setTimeout(nextPlayer, 500);
    } else {
      attempts++;
      card.classList.add('error');
      if (attempts >= 2) {
        roundResults.push({ name, time: 90, attempts, points: 0 });
        advanceTimeoutSim = setTimeout(nextPlayer, 500);
      }
    }
  }

  // 4) التالي أو إنهاء الجولة
  function nextPlayer() {
    currentIndex++;
    if (currentIndex < picPlayers.length) {
      runTurn();
    } else {
      showResults();
    }
  }

  // 5) حساب وعرض النتائج
  function showResults() {
    roundResults.sort((a, b) => a.time - b.time);
    const ptsArr = [20, 10, 5];
    roundResults.forEach((r, i) => r.points = i < 3 ? ptsArr[i] : 0);

    picPlayers.forEach(p => {
      const prev = +localStorage.getItem(p) || 0;
      const curr = roundResults.find(r => r.name === p)?.points || 0;
      localStorage.setItem(p, prev + curr);
    });

    document.getElementById('roundResultsBody').innerHTML =
      roundResults.map((r, i) => `
        <tr>
          <td>${i+1}</td>
          <td>${r.name}</td>
          <td>${r.time.toFixed(2)}</td>
          <td>${r.attempts}</td>
          <td>${r.points}</td>
        </tr>
      `).join('');

    const totalArr = picPlayers.map(p => ({
      name:  p,
      total: +localStorage.getItem(p) || 0
    })).sort((a,b) => b.total - a.total);

    document.getElementById('totalResultsBody').innerHTML =
      totalArr.map((r, i) => `
        <tr>
          <td>${i+1}</td>
          <td>${r.name}</td>
          <td>${r.total}</td>
        </tr>
      `).join('');

    showScreenSim('similarResultsScreen');
  }
});
