// scripts/spy.js
// Dependencies: loadPlayers(), showScreen(id)

document.addEventListener('DOMContentLoaded', () => {
  const players = loadPlayers();
  

  // State
  let roundSeconds  = 480;  // 8*60
  let killerIndex   = null;
  let location      = '';
  let assignments   = [];

  const LOCATIONS = ['بنك','مسجد','مستشفى','مدرسة','مطعم','مطار','سوق','سينما'];
  const TASKS = {
    'بنك': [
      'صراف',
      'مدير فرع',
      'أمين صندوق',
      'حارس أمن',
      'مراجع حسابات',
      'مسؤول تمويل شخصي',
      'محلل مخاطر',
      'موظف خدمة عملاء'
    ],
    'مسجد': [
      'إمام',
      'مؤذن',
      'خطيب',
      'خادم',
      'محفظ قرآن',
      'منسق فعاليات',
      'مسؤول مكتبة إسلامية'
    ],
    'مستشفى': [
      'طبيب',
      'ممرض',
      'جراح',
      'صيدلي',
      'فني مختبر',
      'أخصائي علاج طبيعي',
      'أخصائي أشعة',
      'موظف استقبال'
    ],
    'مدرسة': [
      'معلم',
      'مدير',
      'مشرف',
      'أمين مكتبة',
      'موظف استقبال',
      'معلم لغة إنجليزية',
      'معلم تربية بدنية',
      'محاسب المدرسة'
    ],
    'مطعم': [
      'طباخ',
      'نادل',
      'مدير',
      'شيف حلويات',
      'عامل نظافة',
      'مندوب تسليم',
      'مشرف طهاة',
      'محاسب'
    ],
    'مطار': [
      'مراقب جوي',
      'موظف جوازات',
      'سائق عربة',
      'أمين أمتعة',
      'موظف استقبال',
      'ضابط أمن المطار',
      'منسق رحلات',
      'فني صيانة طائرات'
    ],
    'سوق': [
      'بائع فواكه',
      'صياد سمك',
      'بائع توابل',
      'حارس أمن',
      'مشرف أمن',
      'موظف كاشير',
      'منسق محلات',
      'مسؤول مواقف'
    ],
    'سينما': [
      'بائع تذاكر',
      'مدير دور عرض',
      'مشغل فيلم',
      'عامل نظافة',
      'موظف مطعم',
      'منسق فعاليات',
      'فني صوت',
      'مسؤول إضاءة'
    ]
  };
  

  // Scores
  const scores = {};
  players.forEach(p => scores[p] = +localStorage.getItem(p) || 0);

  // DOM refs
  const backToGames      = document.getElementById('spyBackToGames');
  const startRules       = document.getElementById('spyStartRules');
  const backRules        = document.getElementById('spyBackRules');
  const timeSlider       = document.getElementById('spyTimeSlider');
  const timeValue        = document.getElementById('spyTimeValue');
  const confirmSettings  = document.getElementById('spyConfirmSettings');

  const passPlayerText   = document.getElementById('spyPassPlayerText');
  const passPlayerBtn    = document.getElementById('spyPassPlayerBtn');
  const passPlayerScreen = 'spyPassPlayerScreen';

  const revealPrompt     = document.getElementById('spyRevealPrompt');
  const confirmRevealBtn = document.getElementById('spyConfirmRevealBtn');
  const revealTitle      = document.getElementById('spyRevealTitle');
  const revealText       = document.getElementById('spyRevealText');
  const revealNext       = document.getElementById('spyRevealNext');
  const revealScreenId   = 'spyRevealScreen';

  const gameTimer        = document.getElementById('spyTimer');
  const accuseBtn        = document.getElementById('spyAccuseBtn');
  const spyGuessBtn      = document.getElementById('spyGuessBtn'); // جديد

  const playerList       = document.getElementById('spyPlayerList');
  const roundText        = document.getElementById('spyRoundText');
  const resultsBody      = document.getElementById('spyResultsBody');
  const replayBtn        = document.getElementById('spyReplay');
  const backGamesBtn     = document.getElementById('spyBackGames');

  let timerId, remainingTime;

  // Navigation
  backToGames.onclick = () => showScreen('gamesScreen');
  backRules.onclick   = () => showScreen('spyRulesScreen');

  // Validate players before settings
  startRules.onclick = () => {
    if (players.length < 5 || players.length > 8) {
      showAlert('error', 'يتطلب من 5 إلى 8 لاعبين للعب! حالياً: ' + players.length);
    } else {
      showScreen('spySettingsScreen');
    }
  };

  // Slider for round duration
  timeSlider.oninput = e => {
    roundSeconds = +e.target.value;
    const m = String(Math.floor(roundSeconds/60)).padStart(2,'0');
    const s = String(roundSeconds%60).padStart(2,'0');
    timeValue.textContent = `${m}:${s}`;
  };

  // After confirming settings: pick spy & location & assign roles
  confirmSettings.onclick = () => {
    killerIndex = Math.floor(Math.random() * players.length);
    location    = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    // prepare assignment for innocents
    const roles = [...TASKS[location]];
    // shuffle roles
    for (let i=roles.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    assignments = players.map((p,i) => {
      if (i === killerIndex) return { spy: true };
      return { spy: false, location, role: roles.pop() || 'موظف' };
    });

    revealNextRound(0);
  };

  // Reveal loop
  function revealNextRound(i) {
    if (i >= players.length) return startGame();

    const p = players[i];
    passPlayerText.textContent = `📱 أعطِ الهاتف للاعب: ${p}`;
    passPlayerBtn.textContent  = `أنا ${p}`;
    passPlayerBtn.onclick      = () => {
      // show prompt
      revealPrompt.style.display      = 'block';
      confirmRevealBtn.style.display  = 'inline-block';
      revealTitle.style.display       = 'none';
      revealText.style.display        = 'none';
      revealNext.style.display        = 'none';

      showScreen(passPlayerScreen);
      showScreen(revealScreenId);

      confirmRevealBtn.onclick = () => {
        const a = assignments[i];
        if (a.spy) {
          revealTitle.textContent = 'أنت الجاسوس';
          revealText.textContent  = 'حاول اكتشاف الموقع والمهمة دون أن يُكتشف دورك.';
        } else {
          revealTitle.textContent = 'أنت بريء';
          revealText.textContent  = `الموقع: ${a.location}\nالمهمة: ${a.role}`;
        }

        revealPrompt.style.display     = 'none';
        confirmRevealBtn.style.display = 'none';
        revealTitle.style.display      = 'block';
        revealText.style.display       = 'block';
        revealNext.style.display       = 'inline-block';

        revealNext.onclick = () => revealNextRound(i+1);
      };
    };
    showScreen(passPlayerScreen);
  }

  // Start the main game
  function startGame() {
    remainingTime = roundSeconds;
    gameTimer.textContent = formatTime(remainingTime);

    // show both buttons
    accuseBtn.style.display   = 'inline-block';
    spyGuessBtn.style.display = (players[killerIndex] === loadPlayers()[remainingTime%players.length] ? 'inline-block' : 'inline-block');
    // actually show spyGuessBtn only if the local role is spy
    // but here we simply show it and will check inside handler

    showScreen('spyGameScreen');

    accuseBtn.onclick = forceAccuse;
    spyGuessBtn.onclick = spyGuess;

    clearInterval(timerId);
    timerId = setInterval(() => {
      remainingTime--;
      gameTimer.textContent = formatTime(remainingTime);
      if (remainingTime <= 0) {
        clearInterval(timerId);
        forceAccuse();
      }
    }, 1000);
  }

  // When spy clicks "خاص بالجاسوس"
  function spyGuess() {
    if (!assignments[killerIndex].spy) {
      return alert('هذا الزر للجاسوس فقط!');
    }

    // build location options
    const opts = LOCATIONS.map(loc => `
      <button class="btn btn-primary spy-guess-option">${loc}</button>
    `).join('');
    playerList.innerHTML = opts;
    // override container title
    document.getElementById('spyAccuseScreen').querySelector('h2').textContent =
      '🔍 اختر الموقع السري';
    showScreen('spyAccuseScreen');

    document.querySelectorAll('.spy-guess-option').forEach(btn => {
      btn.onclick = () => {
        if (btn.textContent === location) {
          scores[players[killerIndex]] += 75;
          localStorage.setItem(players[killerIndex], scores[players[killerIndex]]);
          roundText.textContent = `🎉 الجاسوس نجح في كشف الموقع! +75 نقطة.`;
        } else {
          roundText.textContent = `❌ تخمين خاطئ. انتهاء الجولة.`;
        }
        renderResultsTable();
        showScreen('spyRoundResults');
      };
    });
  }

  // Accusation phase
  function forceAccuse() {
    clearInterval(timerId);
    playerList.innerHTML = '';
    players.forEach(p => {
      const li = document.createElement('li');
      const btn= document.createElement('button');
      btn.textContent = p;
      btn.className   = 'btn btn-warning player-btn';
      btn.onclick     = () => finalizeAccusation(p);
      li.appendChild(btn);
      playerList.appendChild(li);
    });
    showScreen('spyAccuseScreen');
  }

  function finalizeAccusation(suspect) {
    clearInterval(timerId);
    const correct = (suspect === players[killerIndex]);
    if (correct) {
      players.forEach((p,i) => {
        if (i !== killerIndex) {
          scores[p] += 20;
          localStorage.setItem(p, scores[p]);
        }
      });
      roundText.textContent = `✅ اكتشفتم الجاسوس! (+20 لكل بريء)`;
    } else {
      scores[players[killerIndex]] += 50;
      localStorage.setItem(players[killerIndex], scores[players[killerIndex]]);
      roundText.textContent = `😈 الجاسوس انتصر! (+50 نقطة)`;
    }
    renderResultsTable();
    showScreen('spyRoundResults');
  }

  function renderResultsTable() {
    const sorted = players
      .map(p => ({ name:p, pts:scores[p] }))
      .sort((a,b)=>b.pts - a.pts);
    resultsBody.innerHTML = sorted.map((r,i)=>`
      <tr>
        <td>${i+1}</td><td>${r.name}</td><td>${r.pts}</td>
        <td>${localStorage.getItem(r.name)||0}</td>
      </tr>`).join('');
  }

  replayBtn.onclick    = () => confirmSettings.onclick();
  backGamesBtn.onclick = () => showScreen('gamesScreen');

  function formatTime(sec) {
    const m = String(Math.floor(sec/60)).padStart(2,'0'),
          s = String(sec%60).padStart(2,'0');
    return `${m}:${s}`;
  }
});
