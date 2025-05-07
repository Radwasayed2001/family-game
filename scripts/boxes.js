// scripts/boxes.js
document.addEventListener('DOMContentLoaded', () => {

// 1) تعريف صريح لللاعبين
const playersBoxes = loadPlayers();

// 2) متغيرات اللعبة
let currentIndexBoxes  = 0;
let boxStartTime  = 0;
let nextNumber    = 1;
let timerInterval = null;
let timeLeft      = 60;
let boxResults    = []; // سنقوم بإعادة تهيئته في بداية كل تشغيل

// 3) عناصر الـ DOM
const playerDisplay   = document.getElementById('playerBoxName');
const boxGrid         = document.querySelector('.box-grid');
const timerDisplay    = document.getElementById('boxTimer');
const countdownScreen = document.getElementById('boxCountdownScreen');
const countdownNumber = document.getElementById('boxCountdownNumber');
const gameScreen      = document.getElementById('boxGameScreen');
const resultsScreen   = document.getElementById('boxResultsScreen');
const boxPlayAgainBtn    = document.getElementById('boxPlayAgainBtn');
const boxBackHomeBtn     = document.getElementById('boxBackHomeBtn');
const startBtn        = document.getElementById('startBoxesBtn');

// 4) زر البدء
startBtn.addEventListener('click', () => {
  if (playersBoxes.length < 3) {
    alert('لعبة الصناديق تحتاج من 3 إلى 12 لاعبًا.');
    return;
  }
  // إعادة تهيئة النتائج والمؤشرات
  currentIndexBoxes = 0;
  boxResults   = [];
  runBoxTurn();
});

// 5) زر إعادة اللعب والعودة للقائمة
boxPlayAgainBtn.addEventListener('click', () => runBoxTurn());
boxBackHomeBtn.addEventListener('click', () => showScreen('gamesScreen'));

// 6) دالة التنقل بين الشاشات
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// 7) بدء دور اللاعب بالصناديق
function runBoxTurn() {
  // تهيئة
  timeLeft   = 60;
  nextNumber = 1;

  const name = playersBoxes[currentIndexBoxes];
  playerDisplay.textContent = `📱 أعطِ الجهاز إلى: ${name}`;

  // عرض العد التنازلي
  showScreen('boxCountdownScreen');
  let count = 3;
  countdownNumber.textContent = count;

  const iv = setInterval(() => {
    count--;
    countdownNumber.textContent = count;
    if (count === 0) {
      clearInterval(iv);
      startBoxChallenge();
    }
  }, 1000);
}

// 8) بدء التحدي بعد العد التنازلي
function startBoxChallenge() {
  showScreen('boxGameScreen');
  setupBoxes();
  boxStartTime = Date.now();

  // تشغيل المؤقت
  timerDisplay.textContent = `⏰ ${timeLeft}s`;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏰ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      boxResults.push({ name: playersBoxes[currentIndexBoxes], time: 90 }); // زمن ثابت عند نفاد الوقت
      setTimeout(nextBoxPlayer, 300);
    }
  }, 1000);
}

// 9) إعداد أزرار الصناديق
function setupBoxes() {
  // 20 رقمًا عشوائيًا
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

// 10) التعامل مع نقر الصندوق
function handleBoxClick(num, btn) {
  if (num === nextNumber) {
    btn.classList.add('correct');
    btn.disabled = true;
    nextNumber++;
    if (nextNumber > 20) {
      // أكمل التحدي
      clearInterval(timerInterval);
      const timeTaken = ((Date.now() - boxStartTime) / 1000).toFixed(2);
      boxResults.push({ name: playersBoxes[currentIndexBoxes], time: parseFloat(timeTaken) });
      setTimeout(nextBoxPlayer, 300);
    }
  } else {
    // خطأ → إعادة الترتيب للنقطة الأولى
    nextNumber = 1;
    setupBoxes();
  }
}

// 11) الانتقال للاعب التالي أو عرض النتائج
function nextBoxPlayer() {
  currentIndexBoxes++;
  if (currentIndexBoxes < playersBoxes.length) {
    runBoxTurn();
  } else {
    showBoxResults();
  }
}

// 12) عرض النتائج وتخزين النقاط
function showBoxResults() {
  // ترتيب حسب الزمن
  boxResults.sort((a, b) => a.time - b.time);

  // توزيع النقاط
  const pointsArray = [20, 10, 5];
  const finalResults = boxResults.map((r, i) => ({
    name:   r.name,
    time:   r.time,
    points: i < 3 ? pointsArray[i] : 0
  }));

  // حفظ النقاط التراكمية في localStorage
  playersBoxes.forEach(p => {
    const prev  = parseInt(localStorage.getItem(p)) || 0;
    const curr  = finalResults.find(r => r.name === p)?.points || 0;
    localStorage.setItem(p, prev + curr);
  });

  // تعبئة الجداول
  populateRoundResults(finalResults);
  const totalResults = playersBoxes.map(p => ({
    name:  p,
    total: parseInt(localStorage.getItem(p)) || 0
  })).sort((a,b) => b.total - a.total);
  populateTotalResults(totalResults);

  showScreen('boxResultsScreen');
}

// 13) ملء جدول نتائج الجولة
function populateRoundResults(results) {
  const tbody = document.getElementById('roundResultsBody1');
  tbody.innerHTML = results.map((r, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${r.name}</td>
      <td>${r.time}s</td>
      <td>${r.points}</td>
    </tr>
  `).join('');
}

// 14) ملء جدول النقاط التراكمية
function populateTotalResults(results) {
  const tbody = document.getElementById('totalResultsBody1');
  tbody.innerHTML = results.map((r, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${r.name}</td>
      <td>${r.total}</td>
    </tr>
  `).join('');
}
});