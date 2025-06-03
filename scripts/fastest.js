document.addEventListener('DOMContentLoaded', () => {
  // ==== عناصر واجهة المستخدم ====
  const range = document.getElementById('challengeTimeRange');
  const display = document.getElementById('selectedTime');
  const backToGamesBtnFast = document.getElementById('backToGamesBtnFast');
  const startFastTimeBtn = document.getElementById('startFastTimeBtn');
  const backToRulesBtnFast = document.getElementById('backToRulesBtnFast');
  const confirmFastTimeBtn = document.getElementById('confirmFastTimeBtn');
  const backToGamesBtnFastResults = document.getElementById('backToGamesBtnFastResults');
  const nextFastChallengeBtn = document.getElementById('nextFastChallengeBtn');

  // عنصر الأزرار بعد الكشف - Container
  const postBtnsContainer = document.getElementById('postRevealButtons').parentElement;
  const originalPostBtnsHTML = postBtnsContainer.innerHTML;

  let revealBtn, countdownText, challengeText, postBtns, pickWinnerBtn, skipBtn;

  // ==== قائمة التحديات ====
  const challenges = [
    'أسرع واحد يلمس الباب ويرجع',
    'اسرع واحد يقلد اعلان مروان تلودي',
    'اسرع واحد يلبس نظارة',
    'اسرع واحد يسوي يوغا',
    'اسرع واحد يسوي حركة كاراتيه',
    'اسرع واحد يقلد اللمبي',
    'اسرع واحد ينسدح',
    'اسرع واحد يقول رقم الإسعاف',
    'اسرع واحد يقول رقم الدفاع المدني',
    'اسرع واحد يطفي النور',
    'اسرع واحد يطفي جواله',
    'اسرع واحد يشبك جواله بالشاحن',
    'اسرع واحد يبوس الجدار',
    'اسرع واحد يوقف',
    'اسرع واحد يشرب كوب ماء',
    'اسرع واحد يصور خشمه',
    'اسرع واحد يعطينا موال',
    'اسرع واحد يلبس جزمته',
    'اسرع واحد يصفق برجوله',
    'اسرع واحد يقلد صوت الدجاجة',
    'اسرع واحد يوقف ويجلس',
    'اسرع واحد يقلد صوت الضفدع',
    'اسرع واحد يقلد احتفالية كريستيانو siiiiiii',
    'اسرع واحد يقول قشطة بالشطة ٥ مرات بدون مايغلط',
    'اسرع واحد يغمز بعيونه الثنتين ورا بعض',
    'اسرع واحد يرقص سامري',
    'اسرع واحد يعد لعشرة',
    'اسرع واحد يطق اصبع'
  ];
  

  // ==== متغيرات اللعبة والإحصائيات ====
  let challengeDuration = 60; // بالثواني
  let currentChallenge = '';
  const playerStats = {};     // { name: { wins:0, pointsSession:0, pointsTotal:0 } }

  // ==== Helpers ====
  function initStats() {
    const names = loadPlayers();
    names.forEach(name => {
      const storedTotal = parseInt(localStorage.getItem(name), 10) || 0;
      playerStats[name] = {
        wins: 0,
        pointsSession: 0,
        pointsTotal: storedTotal
      };
    });
  }

  function pickRandomChallenge() {
    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  function formatSeconds(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function rebindPostRevealElements() {
    postBtns = document.getElementById('postRevealButtons');
    revealBtn = document.getElementById('revealChallengeBtn');
    countdownText = document.getElementById('countdownText');
    challengeText = document.getElementById('challengeText');
    pickWinnerBtn = document.getElementById('pickWinnerBtn');
    skipBtn = document.getElementById('skipChallengeBtn');
    revealBtn.onclick = onReveal;
    pickWinnerBtn.onclick = onPickWinner;
    skipBtn.onclick = onSkip;
  }

  // ==== Handlers ====
  function onReveal() {
    revealBtn.hidden = true;
    countdownText.hidden = false;
    let count = 3;
    countdownText.textContent = count;
    const timer = setInterval(() => {
      if (--count >= 0) {
        countdownText.textContent = count;
      } else {
        clearInterval(timer);
        countdownText.hidden = true;
        challengeText.hidden = false;
        postBtns.hidden = false;
      }
    }, 1000);
  }

  function onSkip() {
    currentChallenge = pickRandomChallenge();
    challengeText.textContent = `التحدي: ${currentChallenge}`;
    postBtns.hidden = false;
  }

  function onPickWinner() {
    const names = loadPlayers();
    const list = document.createElement('div');
    list.classList.add('info-section');
    list.innerHTML = names
      .map(n => `<button class="btn btn-secondary pick-name">${n}</button>`)
      .join('');
    postBtns.replaceWith(list);

    list.querySelectorAll('.pick-name').forEach(btn => {
      btn.onclick = () => recordAndShowResults(btn.textContent);
    });
  }

  function recordAndShowResults(winner) {
    // زيادة عدد الانتصارات في الجلسة
    playerStats[winner].wins++;
    // حساب نقاط الجلسة = الانتصارات * 5
    playerStats[winner].pointsSession = playerStats[winner].wins * 5;
    // تحديث النقاط الكلية بإضافة 5 نقاط جديدة
    playerStats[winner].pointsTotal += 5;
    localStorage.setItem(winner, playerStats[winner].pointsTotal);

    // إنشاء مصفوفة مرتبة حسب النقاط الكلية أولاً ثم نقاط الجلسة
    const sorted = Object.entries(playerStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => {
        if (b.pointsTotal !== a.pointsTotal) return b.pointsTotal - a.pointsTotal;
        return b.pointsSession - a.pointsSession;
      });

    // تعبئة الجدول مع العمود الجديد للنقاط الكلية
    const tbody = document.getElementById('fastResultsTableBody');
    tbody.innerHTML = sorted.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.name}</td>
        <td>${r.wins}</td>
        <td>${r.pointsSession}</td>
        <td>${r.pointsTotal}</td>
      </tr>
    `).join('');

    showScreen('fastResultsScreen');
  }

  // ==== بدء جولة جديدة ====
  function startFastGame(duration) {
    if (!Object.keys(playerStats).length) initStats();
    challengeDuration = duration;
    currentChallenge = pickRandomChallenge();

    // إعادة منطقة الأزرار إلى حالتها الأصلية
    postBtnsContainer.innerHTML = originalPostBtnsHTML;
    rebindPostRevealElements();

    // تهيئة عناصر الشاشة
    revealBtn.hidden = false;
    countdownText.hidden = true;
    challengeText.hidden = true;
    postBtns.hidden = true;
    challengeText.textContent = `التحدي: ${currentChallenge}`;

    showScreen('fastChallengeScreen');
  }

  // ==== ربط الأحداث الأساسية ====
  range.addEventListener('input', () => {
    display.textContent = formatSeconds(+range.value);
  });
  backToGamesBtnFast.onclick = () => showScreen('gamesScreen');
  startFastTimeBtn.onclick = () => {
    if (loadPlayers().length < 3) {
      showAlert('error', ' لعبة الأسرع تتطلب 3 لاعبين على الأقل للعب! حالياً: ' + loadPlayers().length);
      return;
    } 
    showScreen('fastTimeScreen');
  }
  backToRulesBtnFast.onclick = () => showScreen('fastRulesScreen');
  confirmFastTimeBtn.onclick = () => startFastGame(+range.value);
  nextFastChallengeBtn.onclick = () => startFastGame(challengeDuration);
  backToGamesBtnFastResults.onclick = () => showScreen('gamesScreen');

  // أول ربط لعناصر جولة التحدي
  rebindPostRevealElements();
});
