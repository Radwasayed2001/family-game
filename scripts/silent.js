// scripts/charades.js
// Dependencies: loadPlayers(), showScreen(id)

document.addEventListener('DOMContentLoaded', () => {
  const players = loadPlayers();
  let roundTime     = 180; // بالثواني
  let actorIndex    = 0;
   timerId       = null;
  let teamA = [], teamB = [];
  let currentPair   = null;
  let changeCount   = 3;

  // مجموعة الأزواج (موضوع + عنوان)
  const titles = [
    // مسلسلات
    { topic: 'مسلسل تلفزيوني', title: 'لن أعيش في جلباب أبي' },
    { topic: 'مسلسل تلفزيوني', title: 'المال والبنون' },
    { topic: 'مسلسل تلفزيوني', title: 'الاختيار' },
    { topic: 'مسلسل تلفزيوني', title: 'نيللي وشريهان' },
    { topic: 'مسلسل تلفزيوني', title: 'الكبير أوي' },
    { topic: 'مسلسل تلفزيوني', title: 'جعفر العمدة' },
    { topic: 'مسلسل تلفزيوني', title: 'حديث الصباح والمساء' },
    { topic: 'مسلسل تلفزيوني', title: 'عوالم خفية' },
    { topic: 'مسلسل تلفزيوني', title: 'الوصية' },
    { topic: 'مسلسل تلفزيوني', title: 'ذات' },
    { topic: 'مسلسل تلفزيوني', title: 'طايع' },
    { topic: 'مسلسل تلفزيوني', title: 'السبع وصايا' },
    { topic: 'مسلسل تلفزيوني', title: 'بين السما والأرض' },
    { topic: 'مسلسل تلفزيوني', title: 'في بيتنا روبوت' },
    { topic: 'مسلسل تلفزيوني', title: 'البرنس' },
    { topic: 'مسلسل تلفزيوني', title: 'الأسطورة' },
    { topic: 'مسلسل تلفزيوني', title: 'سوق العصر' },
    { topic: 'مسلسل تلفزيوني', title: 'العصيان' },
    { topic: 'مسلسل تلفزيوني', title: 'دموع في عيون وقحة' },
    { topic: 'مسلسل تلفزيوني', title: 'الزيني بركات' },
    { topic: 'مسلسل تلفزيوني', title: 'رأفت الهجان' },
  
    // أفلام
    { topic: 'فيلم سينمائي', title: 'إسماعيلية رايح جاي' },
    { topic: 'فيلم سينمائي', title: 'الفيل الأزرق' },
    { topic: 'فيلم سينمائي', title: 'كده رضا' },
    { topic: 'فيلم سينمائي', title: 'هي فوضى' },
    { topic: 'فيلم سينمائي', title: 'الجزيرة' },
    { topic: 'فيلم سينمائي', title: 'الباشا تلميذ' },
    { topic: 'فيلم سينمائي', title: 'غبي منه فيه' },
    { topic: 'فيلم سينمائي', title: 'ولاد رزق' },
    { topic: 'فيلم سينمائي', title: 'واحد من الناس' },
    { topic: 'فيلم سينمائي', title: 'حين ميسرة' },
    { topic: 'فيلم سينمائي', title: 'البدلة' },
    { topic: 'فيلم سينمائي', title: 'نادي الرجال السري' },
    { topic: 'فيلم سينمائي', title: 'صعيدي في الجامعة الأمريكية' },
    { topic: 'فيلم سينمائي', title: 'عمارة يعقوبيان' },
    { topic: 'فيلم سينمائي', title: 'عسل أسود' },
    { topic: 'فيلم سينمائي', title: 'أحلام عمرنا' },
    { topic: 'فيلم سينمائي', title: 'يا أنا يا خالتي' },
    { topic: 'فيلم سينمائي', title: 'حبيبي نائماً' },
    { topic: 'فيلم سينمائي', title: 'مافيا' },
    { topic: 'فيلم سينمائي', title: 'سهر الليالي' },
    { topic: 'فيلم سينمائي', title: 'تيتة رهيبة' },
  
    // أغاني
    { topic: 'أغنية مشهورة', title: 'تملي معاك' },
    { topic: 'أغنية مشهورة', title: 'نسم علينا الهوى' },
    { topic: 'أغنية مشهورة', title: 'حبيبي يا نور العين' },
    { topic: 'أغنية مشهورة', title: 'بحبك وحشتيني' },
    { topic: 'أغنية مشهورة', title: 'أما براوة' },
    { topic: 'أغنية مشهورة', title: 'الناس الرايقة' },
    { topic: 'أغنية مشهورة', title: 'يابتاع النعناع' },
    { topic: 'أغنية مشهورة', title: 'الليلة دوب' },
    { topic: 'أغنية مشهورة', title: 'يا منعنع' },
    { topic: 'أغنية مشهورة', title: 'نقلنا القلب' },
    { topic: 'أغنية مشهورة', title: 'أنت عمري' },
    { topic: 'أغنية مشهورة', title: 'يا حبيبي تعال الحقني' },
    { topic: 'أغنية مشهورة', title: 'أنا مش أناني' },
    { topic: 'أغنية مشهورة', title: 'أماكن السهر' },
    { topic: 'أغنية مشهورة', title: '3 دقات' },
    { topic: 'أغنية مشهورة', title: 'من أول دقيقة' },
    { topic: 'أغنية مشهورة', title: 'أهواك' },
    { topic: 'أغنية مشهورة', title: 'يا بتاع النعناع' },
    { topic: 'أغنية مشهورة', title: 'الغزالة رايقة' },
    { topic: 'أغنية مشهورة', title: 'آه لو لعبت يا زهر' },
  
    // ممثلين
    { topic: 'ممثل', title: 'عادل إمام' },
    { topic: 'ممثل', title: 'أحمد حلمي' },
    { topic: 'ممثل', title: 'كريم عبد العزيز' },
    { topic: 'ممثل', title: 'يحيى الفخراني' },
    { topic: 'ممثل', title: 'محمد رمضان' },
    { topic: 'ممثل', title: 'أحمد عز' },
    { topic: 'ممثل', title: 'هاني سلامة' },
    { topic: 'ممثل', title: 'أحمد مكي' },
    { topic: 'ممثل', title: 'أمير كرارة' },
    { topic: 'ممثل', title: 'بيومي فؤاد' },
  
    { topic: 'ممثلة', title: 'منى زكي' },
    { topic: 'ممثلة', title: 'غادة عبد الرازق' },
    { topic: 'ممثلة', title: 'ياسمين عبد العزيز' },
    { topic: 'ممثلة', title: 'دنيا سمير غانم' },
    { topic: 'ممثلة', title: 'هند صبري' },
    { topic: 'ممثلة', title: 'نيللي كريم' },
    { topic: 'ممثلة', title: 'روجينا' },
    { topic: 'ممثلة', title: 'صابرين' },
    { topic: 'ممثلة', title: 'حلا شيحة' },
    { topic: 'ممثلة', title: 'شيرين رضا' },
  
    // أماكن
    { topic: 'مكان في مصر', title: 'الأقصر' },
    { topic: 'مكان في مصر', title: 'أسوان' },
    { topic: 'مكان في مصر', title: 'خان الخليلي' },
    { topic: 'مكان في مصر', title: 'مكتبة الإسكندرية' },
    { topic: 'مكان في مصر', title: 'الأهرامات' },
    { topic: 'مكان في مصر', title: 'القرية الفرعونية' },
    { topic: 'مكان في مصر', title: 'النيل' },
    { topic: 'مكان في مصر', title: 'قلعة صلاح الدين' },
    { topic: 'مكان في مصر', title: 'شارع المعز' },
    { topic: 'مكان في مصر', title: 'سيوة' },
  
  ];
  
  // نتائج كل لاعب
  const playerResults = players.map(name => ({
    name,
    roundPoints: 0,
    totalPoints: parseInt(localStorage.getItem(name)) || 0
  }));

  // DOM refs
  const backToGames       = document.getElementById('backToGamesBtnCharades');
  const startRulesBtn     = document.getElementById('startCharadesBtn');
  const backRulesBtn      = document.getElementById('backToRulesBtnCharades');
  const assignmentForm    = document.getElementById('teamAssignmentForm');
  const timeSlider        = document.getElementById('charadesTimeSlider');
  const timeValue         = document.getElementById('charadesTimeValue');
  const startGameBtn      = document.getElementById('startCharadesGameBtn');
  const passText          = document.getElementById('charadesPassText');
  const passNextBtn       = document.getElementById('charadesPassNextBtn');
  const topicEl           = document.getElementById('charadesTopic');
  const titleEl           = document.getElementById('charadesTitle');
  const timerEl           = document.getElementById('charadesTimer');
  const correctBtn        = document.getElementById('charadesCorrectBtn');
  const changeBtn         = document.getElementById('charadesChangeBtn');
  const changeCountSpan   = document.getElementById('charadesChangeCount');
  const roundResultText   = document.getElementById('charadesRoundResultText');
  const roundResultsBody  = document.getElementById('charadesRoundResultsBody');
  const nextRoundBtn      = document.getElementById('charadesNextRoundBtn');
  const endGameBtn        = document.getElementById('charadesEndGameBtn');
  const finalBody         = document.getElementById('charadesFinalResultsBody');
  const replayBtn         = document.getElementById('charadesReplayBtn');
  const backBtn           = document.getElementById('charadesBackBtn');

  // تنقل بين الشاشات
  backToGames.onclick   = () => showScreen('gamesScreen');
  startRulesBtn.onclick = () => {
    if (players.length < 4) {
      showAlert('error', 'لعبة بدون كلام تتطلب 4 لاعبين على الأقل للعب! حالياً: ' + players.length);
      return;
    }
    showScreen('charadesSettingsScreen');
  };
  backRulesBtn.onclick  = () => showScreen('charadesRulesScreen');

  // تقسيم الفرق
  function renderAssignment() {
    assignmentForm.innerHTML = '';
    players.forEach((p, i) => {
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

  // صيغة عرض الوقت (00:00)
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  // ضبط الـ slider
  timeSlider.oninput = e => {
    roundTime = +e.target.value;
    timeValue.textContent = formatTime(roundTime);
  };

  // بدء اللعبة
  startGameBtn.onclick = () => {
    teamA = []; teamB = [];
    players.forEach((p, i) => {
      const sel = document.querySelector(`input[name="team-${i}"]:checked`).value;
      if (sel === 'A') teamA.push(p);
      else              teamB.push(p);
    });
    if (teamA.length < 2 || teamB.length < 2) {
      return showAlert("warning", 'يجب أن يحتوي كل فريق على لاعبين اثنين على الأقل.');
    }
    actorIndex = 0;
    playerResults.forEach(pr => pr.roundPoints = 0);
    nextPass();
  };

  // تمرير الهاتف
  function nextPass() {
    currentPair = titles[Math.floor(Math.random() * titles.length)];
    const team = (actorIndex % 2 === 0) ? 'A' : 'B';
    passText.textContent = `📱 دور فريق ${team} لتخمين العناوين عدة مرات`;
    showScreen('charadesPassScreen');
  }
  passNextBtn.onclick = () => {
    topicEl.textContent          = `🔖 الموضوع: ${currentPair.topic}`;
    titleEl.textContent          = `🎬 العنوان: ${currentPair.title}`;
    changeCount                  = 3;
    changeCountSpan.textContent  = changeCount;
    startTimer();
    showScreen('charadesGameScreen');
  };

  // تغيير الموضوع
  changeBtn.onclick = () => {
    if (changeCount > 0) {
      changeCount--;
      changeCountSpan.textContent = changeCount;
      currentPair = titles[Math.floor(Math.random() * titles.length)];
      topicEl.textContent = `🔖 الموضوع: ${currentPair.topic}`;
      titleEl.textContent = `🎬 العنوان: ${currentPair.title}`;
    } else {
      showAlert('error', 'انتهت فرص تغيير الموضوع.');
    }
  };

  // المؤقت الرئيسي
  function startTimer() {
    clearInterval(timerId);
    let t = roundTime;
    timerEl.textContent = formatTime(t);
    timerId = setInterval(() => {
      t--;
      timerEl.textContent = formatTime(t);
      if (t <= 0) endTurn();
    }, 1000);
  }

  // عندما يضغط على "صحيح" – يحصل الفريق الآخر على 10 نقاط ويُظهر عنوانًا جديدًا
  function handleCorrect() {
    const winningTeam = (actorIndex % 2 === 0) ? teamB : teamA;
    winningTeam.forEach(name => {
      const pr = playerResults.find(r => r.name === name);
      pr.roundPoints += 10;
      pr.totalPoints += 10;
      localStorage.setItem(name, pr.totalPoints);
    });
    // توليد عنوان جديد فوريًا
    currentPair = titles[Math.floor(Math.random() * titles.length)];
    topicEl.textContent = `🔖 الموضوع: ${currentPair.topic}`;
    titleEl.textContent = `🎬 العنوان: ${currentPair.title}`;
  }

  correctBtn.onclick = handleCorrect;

  // عند انتهاء وقت فريق A، ننتقل مباشرة إلى فريق B بدون شاشة نتائج
  function endTurn() {
    clearInterval(timerId);
    if (actorIndex % 2 === 0) {
      // إذا كان فريق A انتهى، نزيد الفهرس ونبدأ فريق B
      actorIndex++;
      nextPass();
    } else {
      // إذا كان فريق B انتهى، نعرض نتائج الجولة
      renderRoundResults();
      roundResultText.textContent = `⏳ انتهى وقت فريق B! هذه نهايتها.`;
      showScreen('charadesRoundResultsScreen');
    }
  }

  // عرض جدول نتائج هذه الجولة
  function renderRoundResults() {
    const sorted = [...playerResults].sort((a, b) => b.roundPoints - a.roundPoints);
    roundResultsBody.innerHTML = sorted.map((r, i) => `
      <tr>
        <td>${i+1}</td>
        <td>${r.name}</td>
        <td>${r.roundPoints}</td>
        <td>${r.totalPoints}</td>
      </tr>
    `).join('');
  }

  // بعد انتهاء الجولة والضغط على "الجولة الجديدة"
  nextRoundBtn.onclick = () => {
    actorIndex = 0; // نعيد الفهرس لفريق A في جولة جديدة
    playerResults.forEach(pr => pr.roundPoints = 0);
    nextPass();
  };

  // إنهاء اللعبة وعرض النتائج الكاملة
  endGameBtn.onclick = () => {
    const sorted = [...playerResults].sort((a, b) => b.totalPoints - a.totalPoints);
    finalBody.innerHTML = sorted.map((r, i) => `
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
