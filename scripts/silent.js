// scripts/charades.js
// Dependencies: loadPlayers(), showScreen(id)

document.addEventListener('DOMContentLoaded', () => {
  const players = loadPlayers();
  let roundTime     = 60;
  let actorIndex    = 0;
  let timerId       = null;
  let teamA = [], teamB = [];
  let currentPair   = null;
  let changeCount   = 2;

  // مجموعة الأزواج (موضوع + عنوان)
  const titles      = [ { topic: 'مسلسل تلفزيوني', title: 'لن أعيش في جلباب أبي' },
    { topic: 'مسلسل تلفزيوني', title: 'صاحبة السعادة' },
    { topic: 'مسلسل تلفزيوني', title: 'كيد النسا' },
    { topic: 'مسلسل تلفزيوني', title: 'رأفت الهجان' },
    { topic: 'فيلم سينمائي',     title: 'عمارة يعقوبيان' },
    { topic: 'فيلم سينمائي',     title: 'صعيدي في الجامعة الأمريكية' },
    { topic: 'فيلم سينمائي',     title: 'إسماعيلية رايح جاي' },
    { topic: 'فيلم سينمائي',     title: 'أبدا أهلا ولو بعد حين' },
    { topic: 'برنامج تلفزيوني',  title: 'ست الستات' },
    { topic: 'برنامج تلفزيوني',  title: 'تخاريف' },
    { topic: 'برنامج تلفزيوني',  title: 'رامز جلال' },
    { topic: 'برنامج تلفزيوني',  title: 'خواطر' },
    { topic: 'شخصية تاريخية',    title: 'صلاح الدين الأيوبي' },
    { topic: 'شخصية تاريخية',    title: 'نابليون بونابرت' },
    { topic: 'شخصية تاريخية',    title: 'الخديو إسماعيل' },
    { topic: 'شخصية تاريخية',    title: 'عمرو بن العاص' },
    { topic: 'كتاب معروف',      title: 'لا تكن لطيفاً إلى درجة النفاق' },
    { topic: 'كتاب معروف',      title: 'عبر ودروب' },
    { topic: 'كتاب معروف',      title: 'قواعد العشق الأربعون' },
    { topic: 'شخصية كرتونية',   title: 'سبونج بوب' },
    { topic: 'شخصية كرتونية',   title: 'ميكي ماوس' },
    { topic: 'شخصية كرتونية',   title: 'باباي' },
    { topic: 'حيوان',            title: 'الزرافة' },
    { topic: 'حيوان',            title: 'الدلفين' },
    { topic: 'حيوان',            title: 'التمساح' },
    { topic: 'اختراع',           title: 'الهاتف الذكي' },
    { topic: 'اختراع',           title: 'العجلة' },
    { topic: 'اختراع',           title: 'الإنترنت' }];

  // نتائج كل لاعب
  const playerResults = players.map(name => ({
    name,
    roundPoints: 0,
    totalPoints: parseInt(localStorage.getItem(name)) || 0
  }));

  // DOM refs
  const backToGames            = document.getElementById('backToGamesBtnCharades');
  const startRulesBtn          = document.getElementById('startCharadesBtn');
  const backRulesBtn           = document.getElementById('backToRulesBtnCharades');
  const assignmentForm         = document.getElementById('teamAssignmentForm');
  const timeSlider             = document.getElementById('charadesTimeSlider');
  const timeValue              = document.getElementById('charadesTimeValue');
  const startGameBtn           = document.getElementById('startCharadesGameBtn');
  const passText               = document.getElementById('charadesPassText');
  const passNextBtn            = document.getElementById('charadesPassNextBtn');
  const topicEl                = document.getElementById('charadesTopic');
  const titleEl                = document.getElementById('charadesTitle');
  const timerEl                = document.getElementById('charadesTimer');
  const correctBtn             = document.getElementById('charadesCorrectBtn');
  const failBtn                = document.getElementById('charadesFailBtn');
  const changeBtn              = document.getElementById('charadesChangeBtn');
  const changeCountSpan        = document.getElementById('charadesChangeCount');
  const roundResultText        = document.getElementById('charadesRoundResultText');
  const roundResultsBody       = document.getElementById('charadesRoundResultsBody');
  const nextRoundBtn           = document.getElementById('charadesNextRoundBtn');
  const endGameBtn             = document.getElementById('charadesEndGameBtn');
  const finalBody              = document.getElementById('charadesFinalResultsBody');
  const replayBtn              = document.getElementById('charadesReplayBtn');
  const backBtn                = document.getElementById('charadesBackBtn');

  // تنقل بين الشاشات
  backToGames.onclick   = () => showScreen('gamesScreen');
  startRulesBtn.onclick = () => {
    if (players.length < 4) {
      showAlert('error', ' لعبة بدون كلام تتطلب 4 لاعبين على الأقل للعب! حالياً: ' + players.length);
      return;
    } 
    showScreen('charadesSettingsScreen');
  }
  backRulesBtn.onclick  = () => showScreen('charadesRulesScreen');

  // تقسيم الفرق
  function renderAssignment() {
    assignmentForm.innerHTML = '';
    players.forEach((p,i) => {
      const div = document.createElement('div');
      div.className = 'player-item';
      div.innerHTML = `
        <label>${p}</label>
        <label><input type="radio" name="team-${i}" value="A" checked> فريق A</label>
        <label><input type="radio" name="team-${i}" value="B"> فريق B</label>
      `;
      assignmentForm.appendChild(div);
    });
  }
  renderAssignment();

  // ضبط الوقت
  timeSlider.oninput = e => {
    roundTime = +e.target.value;
    timeValue.textContent = `${roundTime}s`;
  };

  // بدء اللعبة
  startGameBtn.onclick = () => {
    teamA = []; teamB = [];
    players.forEach((p,i) => {
      const sel = document.querySelector(`input[name="team-${i}"]:checked`).value;
      if (sel==='A') teamA.push(p);
      else           teamB.push(p);
    });
    if (teamA.length < 2 || teamB.length < 2) {
      return showAlert("warning",'يجب أن يحتوي كل فريق على لاعبين اثنين على الأقل.');
    }
    actorIndex = 0;
    playerResults.forEach(pr => pr.roundPoints = 0);
    nextPass();
  };

  // تمرير الهاتف
  function nextPass() {
    currentPair = titles[Math.floor(Math.random()*titles.length)];
    const team = (actorIndex % 2 === 0) ? 'A' : 'B';
    passText.textContent = `📱 الدور على فريق ${team} لتخمين العنوان`;
    showScreen('charadesPassScreen');
  }
  passNextBtn.onclick = () => {
    topicEl.textContent       = `🔖 الموضوع: ${currentPair.topic}`;
    titleEl.textContent       = `🎬 العنوان: ${currentPair.title}`;
    changeCount               = 2;
    changeCountSpan.textContent = changeCount;
    startTimer();
    showScreen('charadesGameScreen');
  };

  // تغيير الموضوع
  changeBtn.onclick = () => {
    if (changeCount > 0) {
      changeCount--;
      changeCountSpan.textContent = changeCount;
      currentPair = titles[Math.floor(Math.random()*titles.length)];
      topicEl.textContent = `🔖 الموضوع: ${currentPair.topic}`;
      titleEl.textContent = `🎬 العنوان: ${currentPair.title}`;
    } else {
      showAlert('error','انتهت فرص تغيير الموضوع.');
    }
  };

  // المؤقت
  function startTimer() {
    clearInterval(timerId);
    let t = roundTime;
    timerEl.textContent = `${t}s`;
    timerId = setInterval(() => {
      t--; timerEl.textContent = `${t}s`;
      if (t <= 0) onFail();
    }, 1000);
  }

  // نجاح التمثيل
  function onSuccess() {
    clearInterval(timerId);
    const winningTeam = (actorIndex % 2 === 0) ? teamB : teamA;
    winningTeam.forEach(name => {
      const pr = playerResults.find(r => r.name === name);
      pr.roundPoints += 20;
      pr.totalPoints += 20;
      localStorage.setItem(name, pr.totalPoints);
    });
    renderRoundResults();
    roundResultText.textContent = `✅ فاز فريق ${(actorIndex % 2 === 0 ? 'B' : 'A')}! كل لاعب +20 نقطة`;
    showScreen('charadesRoundResultsScreen');
  }

  // فشل التمثيل
  function onFail() {
    clearInterval(timerId);
    renderRoundResults();
    roundResultText.textContent = `❌ خطأ أو انتهى الوقت. لا نقاط لهذه الجولة.`;
    showScreen('charadesRoundResultsScreen');
  }

  correctBtn.onclick = onSuccess;
  failBtn.onclick    = onFail;

  // عرض جدول نتائج هذه الجولة
  function renderRoundResults() {
    // ترتيب لاعبين حسب نقاط الجولة تنازليًا
    const sorted = [...playerResults].sort((a,b)=>b.roundPoints - a.roundPoints);
    roundResultsBody.innerHTML = sorted.map((r,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${r.name}</td>
        <td>${r.roundPoints}</td>
        <td>${r.totalPoints}</td>
      </tr>
    `).join('');
  }

  // بعد انتهاء الجولة
  nextRoundBtn.onclick = () => {
    actorIndex++;
    nextPass();
  };

  // إنهاء اللعبة وعرض النتائج الكاملة
  endGameBtn.onclick = () => {
    const sorted = [...playerResults].sort((a,b)=>b.totalPoints - a.totalPoints);
    finalBody.innerHTML = sorted.map((r,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${r.name}</td>
        <td>${r.roundPoints}</td>
        <td>${r.totalPoints}</td>
      </tr>
    `).join('');
    showScreen('charadesFinalResultsScreen');
  };

  replayBtn.onclick = () => showScreen('charadesSettingsScreen');
  backBtn.onclick   = () => showScreen('gamesScreen');
});
