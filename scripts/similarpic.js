// scripts/similar.js
document.addEventListener('DOMContentLoaded', () => {
  // —— 1) التحضير ——
  const picPlayers      = loadPlayers();
  let currentIndex      = 0;
  let imageStartTime    = 0;
  let dupUrl            = '';
  let attempts          = 0;
  let roundResults      = [];  // { name, time, attempts, points }

  // DOM References
  const displayNum      = document.getElementById('countdownNumber');
  const displayName     = document.getElementById('playerNameDisplay');
  const grid            = document.querySelector('.image-grid');
  const playAgainBtn    = document.getElementById('playAgainBtn');
  const backHomeBtn     = document.getElementById('backHomeBtn');
  const startSimilarBtn = document.getElementById('startSimilarBtn');

  // زر البداية من شاشة القوانين
  startSimilarBtn?.addEventListener('click', () => {
    if (!picPlayers.length) {
      alert('لا يوجد لاعبين!');
      return;
    }
    // إعادة تهيئة
    currentIndex   = 0;
    dupUrl         = '';
    attempts       = 0;
    roundResults   = [];
    runTurn();
  });

  // إعادة اللعب وعودة للقائمة
  playAgainBtn.addEventListener('click', () => {
    currentIndex   = 0;
    dupUrl         = '';
    attempts       = 0;
    roundResults   = [];
    runTurn();
  });
  backHomeBtn.addEventListener('click', () => showScreen('gamesScreen'));

  // —— 2) الدور الحالي ——
  function runTurn() {
    attempts = 0;
    const name = picPlayers[currentIndex];
    displayName.textContent = `📱 أعطِ الهاتف إلى: ${name}`;

    showScreen('countdownScreen');
    let count = 3;
    displayNum.textContent = count;
    displayNum.classList.add('pop');
    const iv = setInterval(() => {
      count--;
      displayNum.classList.remove('pop');
      void displayNum.offsetWidth;
      displayNum.classList.add('pop');
      displayNum.textContent = count;
      if (count === 0) {
        clearInterval(iv);
        startImagePhase();
      }
    }, 1000);
  }

  // —— 3) مرحلة الصور ——
  function startImagePhase() {
    showScreen('imagesScreen');
    setupImages();
  }

  function setupImages() {
    const start = Math.floor(Math.random() * 12) + 1;
    const names = Array.from({ length: 24 }, (_, i) => `${start + i}.avif`);
    const dupIdx = Math.floor(Math.random() * names.length);
    dupUrl = `./public/${names[dupIdx]}`;

    const final = names.map(n => `./public/${n}`);
    for (let i = 0; i < 2; i++) {
      let pos;
      do { pos = Math.floor(Math.random() * (final.length + 1)); }
      while (final[pos] === dupUrl);
      final.splice(pos, 0, dupUrl);
    }
    final.splice(25);
    final.sort(() => Math.random() - 0.5);
    imageStartTime = Date.now();

    grid.innerHTML = '';
    final.forEach(src => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `<img src="${src}" alt="">`;
      card.addEventListener('click', () => onImageClick(src, card));
      grid.appendChild(card);
    });
  }

  function onImageClick(src, card) {
    if (!dupUrl) return;
    const name = picPlayers[currentIndex];
    if (src === dupUrl) {
      const elapsed = (Date.now() - imageStartTime) / 1000;
      roundResults.push({ name, time: elapsed, attempts, points: 0 });
      card.classList.add('matched');
      dupUrl = '';
      setTimeout(nextPlayer, 500);
    } else {
      attempts++;
      card.classList.add('error');
      if (attempts >= 2) {
        roundResults.push({ name, time: 90, attempts, points: 0 });
        setTimeout(nextPlayer, 500);
      }
    }
  }

  // —— 4) التالي ——
  function nextPlayer() {
    currentIndex++;
    if (currentIndex < picPlayers.length) {
      runTurn();
    } else {
      showResults();
    }
  }

  // —— 5) النتائج ——
  function showResults() {
    roundResults.sort((a, b) => a.time - b.time);
    const ptsArr = [20, 10, 5];
    roundResults.forEach((r, i) => r.points = (i < 3 ? ptsArr[i] : 0));

    picPlayers.forEach(p => {
      const prev = parseInt(localStorage.getItem(p)) || 0;
      const curr = roundResults.find(r => r.name === p)?.points || 0;
      localStorage.setItem(p, prev + curr);
    });

    const totalResults = picPlayers
      .map(p => ({ name: p, total: parseInt(localStorage.getItem(p)) || 0 }))
      .sort((a, b) => b.total - a.total);

    populateRoundResults(roundResults);
    populateTotalResults(totalResults);
    showScreen('similarResultsScreen');
  }

  function populateRoundResults(arr) {
    document.getElementById('roundResultsBody').innerHTML = arr.map((r, i) => `
      <tr>
        <td>${i+1}</td><td>${r.name}</td><td>${r.time.toFixed(2)}</td>
        <td>${r.attempts}</td><td>${r.points}</td>
      </tr>
    `).join('');
  }

  function populateTotalResults(arr) {
    document.getElementById('totalResultsBody').innerHTML = arr.map((r, i) => `
      <tr>
        <td>${i+1}</td><td>${r.name}</td><td>${r.total}</td>
      </tr>
    `).join('');
  }
});
