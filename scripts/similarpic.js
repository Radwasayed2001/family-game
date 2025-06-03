// scripts/similar.js

// ───────────────
// مؤقتات عامة
// ───────────────
let imageCountdownInterval = null;
let advanceTimeoutSim      = null;

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
function showScreen(id) {
  clearAllTimersSim();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Optional: makes the scroll smooth
  });
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
    if (picPlayers.length < 1) {
      showAlert('error', 'لعبة الصور المتشابهة تتطلب لاعب واحد على الأقل');
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
  homeBtn.addEventListener('click', () => showScreen('gamesScreen'));

  // 1) دور اللاعب: عدّ تنازلي
  function runTurn() {
    attempts = 0;
    const name = picPlayers[currentIndex];
    displayName.textContent = `📱 دور: ${name}`;

    showScreen('countdownScreen');
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
    document.getElementById("picgamename")
            .textContent = `دورك يا ${picPlayers[currentIndex]}`;
    showScreen('imagesScreen');
    setupImages();
  }

  function setupImages() {
    // 1) جهّز أسماء الملفات من 1.webp إلى 13.webp
    const names = Array.from({ length: 13 }, (_, i) => `${i+1}.webp`);
  
    // 2) اختر عشوائيًا أي صورة ستكرّر
    const dupIdx = Math.floor(Math.random() * names.length);
    dupUrl = `./public/${names[dupIdx]}`;
  
    // 3) احسب القائمة النهائية: نسخة عن كل اسم + الإدراج الأحادي للمكرّر
    const final = names.map(n => `./public/${n}`);
    
    // أدرج المكرر مرة واحدة فقط في موقع عشوائي
    let pos;
    do {
      pos = Math.floor(Math.random() * (final.length + 1)); 
    } while (final[pos] === dupUrl);
    final.splice(pos, 0, dupUrl);
  
    // 4) خلط البطاقات
    final.sort(() => Math.random() - 0.5);
  
    imageStartTime = Date.now();
  
    // 5) عرضها في الشبكة
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
      // نجح اللاعب
      const elapsed = ((Date.now() - imageStartTime) / 1000).toFixed(2);
      roundResults.push({
        name,
        time:   parseFloat(elapsed),
        attempts,
        incomplete: false,
        points: 0 // سيحسب لاحقًا
      });
      card.classList.add('matched');
      dupUrl = '';
      advanceTimeoutSim = setTimeout(nextPlayer, 500);

    } else {
      // خطأ في التخمين
      attempts++;
      card.classList.add('error');
      if (attempts >= 2) {
        // استُنفدت المحاولات → فشل اللاعب
        roundResults.push({
          name,
          time:   null,     // null للدلالة على "لم يُكمل"
          attempts,
          incomplete: true,
          points: 0
        });
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
    // نفرز: أولًا المكتملين حسب الزمن، ثم غير المكتملين
    roundResults.sort((a, b) => {
      if (a.incomplete && b.incomplete) return 0;
      if (a.incomplete) return 1;
      if (b.incomplete) return -1;
      return a.time - b.time;
    });

    const ptsArr = [20, 10, 5];
    roundResults.forEach((r, i) => {
      r.points = r.incomplete ? 0 : (i < 3 ? ptsArr[i] : 0);
    });

    // احتساب النقاط في localStorage
    picPlayers.forEach(p => {
      const prev = +localStorage.getItem(p) || 0;
      const curr = roundResults.find(r => r.name === p)?.points || 0;
      localStorage.setItem(p, prev + curr);
    });

    // جدول نتائج الجولة
    document.getElementById('roundResultsBody').innerHTML =
      roundResults.map((r, i) => `
        <tr>
          <td>${i+1}</td>
          <td>${r.name}</td>
          <td>${r.incomplete ? 'استنفذ المحاولات' : r.time.toFixed(2)}</td>
          <td>${r.attempts}</td>
          <td>${r.points}</td>
        </tr>
      `).join('');

    // جدول النقاط الإجمالية
    const totalArr = picPlayers.map(p => ({
      name:  p,
      total: +localStorage.getItem(p) || 0
    })).sort((a, b) => b.total - a.total);

    document.getElementById('totalResultsBody').innerHTML =
      totalArr.map((r, i) => `
        <tr>
          <td>${i+1}</td>
          <td>${r.name}</td>
          <td>${r.total}</td>
        </tr>
      `).join('');

    showScreen('similarResultsScreen');
  }
});
