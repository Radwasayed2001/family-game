

// Game state
let currentCategory = '';
let secretWord = '';
let outOfTopicPlayer = '';
let currentPlayerIndex = 0;
let questionPairs = [];
let currentQuestionIndex = 0;
let votes = {};
let scores = {};
let outOfTopicInput = 'sldkl;';
let timerId = null;
let preTimerId;
// Category words mapping
const categoryWords = {
  food: ['كبسة', 'مندي', 'برياني', 'مقلوبة', 'محشي', 'فتوش', 'شاورما', 'سندويش', 'فلافل', 'حريرة', 'ملوخية', 'فتة', 'مسبحة', 'طاجن'],
  places: ['مكة', 'المدينة', 'جدة', 'الرياض', 'دبي', 'بيروت', 'القاهرة', 'حيفا', 'دمشق', 'القدس', 'العين', 'مسقط', 'الدوحة', 'طرابلس'],
  animals: ['أسد', 'نمر', 'فهد', 'ذئب', 'فيل', 'زرافة', 'دب', 'قطة', 'كلب', 'سنجاب', 'طائر', 'سمكة', 'فرس', 'ثعبان'],
  clothes: ['ثوب', 'بدلة سباحة', 'عباية', 'جلابية', 'قميص', 'بنطال', 'جاكيت', 'حذاء', 'قبعة', 'وشاح', 'حزام', 'قفازات', 'جراب', 'بنطلون جينز'],
  produce: ['تفاح', 'موز', 'برتقال', 'طماطم', 'خيار', 'جزر', 'بطاطا', 'بصل', 'ثوم', 'فلفل', 'باذنجان', 'خس', 'سبانخ', 'فراولة'],
  drinks: ['ماء', 'عصير', 'قهوة', 'شاي', 'لبن', 'مشروب غازي', 'عصير رمان', 'عصير تفاح', 'كولا', 'ليمونادة', 'سوبيا', 'شاي مثلج'],
  household: ['كرسي', 'طاولة', 'سرير', 'خزانة', 'مصباح', 'مروحة', 'تلفزيون', 'ثلاجة', 'فرن', 'ميكرويف', 'مقبس', 'سجادة'],
  vehicles: ['سيارة', 'دراجة', 'دراجة نارية', 'حافلة', 'قطار', 'طائرة', 'سفينة', 'ترام', 'مترو', 'تاكسي', 'شاحنة', 'قارب'],
  cities: ['القاهرة', 'جدة', 'دبي', 'باريس', 'لندن', 'ريو', 'نيويورك', 'طوكيو', 'مدريد', 'روما', 'سيدني', 'كييف'],
  cartoons: ['ميكي ماوس', 'توم', 'جيري', 'سبونج بوب', 'نينجا سلاريز', 'باور رينجرز', 'بوكيمون', 'دوغ', 'باغز باني', 'هالك'],
  games: ['شطرنج', 'مونوبولي', 'ليدو', 'دوكر', 'سوليتير', 'باك غامون', 'بلياردو', 'بوكر', 'جراند ثفت أوتو', 'فيفا'],
  jobs: ['طبيب', 'مهندس', 'معلم', 'محامي', 'شرطي', 'مزارع', 'فنّان', 'مبرمج', 'صحفي', 'طباخ', 'سائق', 'ممرضة']
};

// Initialize players array
let players = loadPlayers();

// Initialize the application
function initApp() {
  renderPlayerList(players);
  setupEventListeners(); 
}

document.addEventListener('DOMContentLoaded', initApp);

// Set up all event listeners
function setupEventListeners() {
  playerNameInput.addEventListener('input', () => {
    addPlayerButton.disabled = playerNameInput.value.trim() === '' || players.length >= MAX_PLAYERS;
  });
  addPlayerButton.addEventListener('click', addPlayer);
  
  // guessInput.addEventListener('keyup', (e) => {
  //   outOfTopicInput = e.target.value;
  //   console.log(outOfTopicInput)
  // }); 
  playerListElement.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-player')) removePlayer(parseInt(e.target.dataset.index));
  });
  startButton.addEventListener('click', () => { renderGamesList(); showScreen('gamesScreen'); });
  backButton.addEventListener('click', () => showScreen('playerScreen'));
  gamesGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.game-card');
    if (card && getComputedStyle(card).opacity === '1') {
      if (card.dataset.gameId === 'outOfTopic') showScreen('outOfTopicScreen');
      else if (card.dataset.gameId === 'mafia') showScreen('mafiaScreen');
      else if (card.dataset.gameId === 'phoneOnHead') showScreen('jawwalRulesScreen');
      else if (card.dataset.gameId === 'similarPictures') showScreen('similarPicturesScreen');
      else if (card.dataset.gameId === 'boxes') showScreen('boxesRulesScreen');
      else if (card.dataset.gameId === 'whoAmongUs') showScreen('whoRulesScreen');
      else if (card.dataset.gameId === 'fastest') showScreen('fastRulesScreen');
      else if (card.dataset.gameId === 'treasure') showScreen('treasureRulesScreen');
      else if (card.dataset.gameId === 'balance') showScreen('balanceRulesScreen');
      else if (card.dataset.gameId === 'noSpeech') showScreen('charadesRulesScreen');
      else if (card.dataset.gameId === 'ghomza') showScreen('winkRulesScreen');
      else if (card.dataset.gameId === 'jassos') showScreen('spyRulesScreen');

    }
  });
  submitGuessButton.addEventListener('click', calculateResults);
  document.getElementById('backToGamesButton').addEventListener('click', () => showScreen('gamesScreen'));
  document.getElementById('startGameButton').addEventListener('click', () => {
    if (players.length < 3 || players.length > 12) {
      showAlert('error', 'يتطلب من 3 إلى 12 لاعبين للعب! حالياً: ' + players.length);
      return;

    } 
    showScreen('categoryScreen')
  });
  document.querySelector('.category-grid').addEventListener('click', e => {
    // find the nearest ancestor (or self) that has the .category-card class
    const card = e.target.closest('.category-card');
    if (!card) return;                // click was outside any card
    currentCategory = card.dataset.category;
    startGame();
  });
document.getElementById('mafiaPlayerConfirmButton').addEventListener('click', showRole);
document.getElementById('mafiaPlayerVoteButton').addEventListener('click', showQuestion);
document.getElementById('mafiaPlayerVoteButtonMorning').addEventListener('click', showQuestionMorning);
  
  document.getElementById('playerConfirmButton').addEventListener('click', showSecretWord);
  // Note: reveal button now created dynamically in showSecretWord
  document.getElementById('secretConfirmButton').addEventListener('click', nextPlayer);
  document.getElementById('roleConfirmButton').addEventListener('click', nextMafiaPlayer);
  document.getElementById('roleConfirmButtonMorning').addEventListener('click', nextMafiaPlayerMorning);
  document.getElementById('nextQuestionButton').addEventListener('click', nextQuestion);
  document.getElementById('backToMenuButton').addEventListener('click', () => {
    resetGame();
    renderGamesList();
  showScreen('gamesScreen');
  });
}

/**
 * Add a new player
 */
/**
 * Add a new player and reload the app so every game picks up the change
 */
function addPlayer() {
  const name = playerNameInput.value.trim();
  const { isValid, error } = validatePlayerName(name, players);
  if (!isValid) {
    showAlert('error',error);
    return;
  }
  players.push(name);
  savePlayers(players);

  // تنظيف localStorage من كل المفاتيح سوى 'players'
  Object.keys(localStorage).forEach(key => {
    if (key !== 'players') {
      localStorage.removeItem(key);
    }
  });

  // إعادة الرسم وإعادة تحميل التطبيق
  renderPlayerList(players);
  clearPlayerInput();
  setTimeout(() => location.reload(), 0);
}
      
/**
 * Remove a player and reload the app so every game picks up the change
 */
function removePlayer(index) {
  players.splice(index, 1);
  savePlayers(players);

  // تنظيف localStorage من كل المفاتيح سوى 'players'
  Object.keys(localStorage).forEach(key => {
    if (key !== 'players') {
      localStorage.removeItem(key);
    }
  });

  renderPlayerList(players);
  setTimeout(() => location.reload(), 0);
}



/**
 * Start the OutOfTopic game flow
 */
function startGame() {
  
  currentPlayerIndex = 0;
  questionPairs = [];
  currentQuestionIndex = 0;
  votes = {};
  scores = {};
  const words = categoryWords[currentCategory];
  secretWord = words[Math.floor(Math.random() * words.length)];
  outOfTopicPlayer = players[Math.floor(Math.random() * players.length)];
  showWarningScreen();
}

/**
 * Warning screen for each player
 */
function showWarningScreen() {
  document.getElementById('playerConfirmButton').textContent = `أنا ${players[currentPlayerIndex]}`;
  showScreen('warningScreen');
}

/**
 * Secret word reveal screen
 */
function showSecretWord() {
  const player = players[currentPlayerIndex];
  const content = document.getElementById('secretContent');
  document.querySelector('#secretScreen .player-name').textContent = player;
  // If this player is the out-of-topic one, show outsider screen immediately
  if (player === outOfTopicPlayer) {
    content.innerHTML = '';
  const revealBtn = document.createElement('button');
  revealBtn.id = 'revealButton';
  revealBtn.className = 'btn btn-primary';
  revealBtn.textContent = 'هنا انقر';
  revealBtn.addEventListener('click', outOfTopicShown);
  content.appendChild(revealBtn);

    const confirmBtn = document.getElementById('secretConfirmButton');
    confirmBtn.textContent = 'موافق';
    confirmBtn.style.display = 'block';
    showScreen('secretScreen');
    return;
  }
  // Normal secret reveal flow for in-topic players
  
  content.innerHTML = '';
  const revealBtn = document.createElement('button');
  revealBtn.id = 'revealButton';
  revealBtn.className = 'btn btn-primary';
  revealBtn.textContent = 'هنا انقر';
  revealBtn.addEventListener('click', revealSecret);
  content.appendChild(revealBtn);

  document.getElementById('secretConfirmButton').style.display = 'none';
  showScreen('secretScreen');
}

/**
 * Reveal the actual secret word
 */
function revealSecret() {
  const content = document.getElementById('secretContent');
  content.innerHTML = `
    <h3 class="secret-word">${secretWord}</h3>
    <p class="secret-instruction">حاول أن توضح للمجموعة أنك تعرف الموضوع بدون كشفه حتى لا يعرف اللاعب برا السالفة</p>
  `;
  document.getElementById('secretConfirmButton').style.display = 'block';
}

function outOfTopicShown() {
  const content = document.getElementById('secretContent');
  content.innerHTML = `
    <h3 class="secret-word">أنت برا السالفة</h3>
    <p class="secret-instruction">مهمتك أن توضح للمجموعة أنك تعرف الموضوع بالإجابة بشكل عام وإيهام المجموعة أنك تعرف الموضوع</p>
  `;
  document.getElementById('secretConfirmButton').style.display = 'block';
}

/**
 * Proceed to next player or questions
 */
function nextPlayer() {
  currentPlayerIndex++;
  if (currentPlayerIndex < players.length) {
    showWarningScreen();
  } else {
    startQuestionsRound();
  }
}

/**
 * Start the questions round
 */
function startQuestionsRound() {
  questionPairs = [];

  // Create a shallow copy of players and shuffle it
  const shuffledAskers = [...players].sort(() => Math.random() - 0.5);
  const shuffledTargets = [...players];

  // Shuffle targets until there's no player matched with themselves
  let attempts = 0;
  do {
    shuffledTargets.sort(() => Math.random() - 0.5);
    attempts++;
  } while (
    shuffledAskers.some((player, idx) => player === shuffledTargets[idx]) && attempts < 100
  );

  for (let i = 0; i < players.length; i++) {
    questionPairs.push({
      asker: shuffledAskers[i],
      target: shuffledTargets[i]
    });
  }
  currentQuestionIndex = 0;
  updateCurrentQuestion();
  showScreen('questionsScreen');
}


/**
 * Update displayed question
 */
function updateCurrentQuestion() {
  const para = document.getElementById('currentQuestion');
  const pair = questionPairs[currentQuestionIndex];
  para.textContent = `${pair.asker} تسأل ${pair.target}`;
}

/**
 * Handle next question or proceed to voting
 */
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questionPairs.length) {
    updateCurrentQuestion();
  } else {
    startVotingRound();
  }
}

/**
 * Voting round setup
 */
/**
 * Voting round setup
 */
function startVotingRound() {
  const area = document.getElementById('votingArea');
  area.innerHTML = '';
  players.forEach(voter => {
    const div = document.createElement('div'); div.className = 'voting-section';
    const h3 = document.createElement('h3'); h3.textContent = `${voter} يصوت على:`;
    const btns = document.createElement('div'); btns.className = 'voting-buttons';
    players.filter(x => x !== voter).forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.className = 'btn btn-secondary';
      btn.onclick = () => submitVote(voter, opt);
      btns.appendChild(btn);
    });
    div.append(h3, btns);
    area.appendChild(div);
  });
  showScreen('votingScreen');
}

/**
 * Record a vote
 */
function submitVote(voter, candidate) {
  votes[voter] = candidate;
  // disable buttons for this voter
  document.querySelectorAll('.voting-section').forEach(sec => {
    if (sec.querySelector('h3').textContent.startsWith(voter)) {
      sec.querySelectorAll('button').forEach(b => b.disabled = true);
    }
  });

  // If all votes in, prepare guess screen data
  if (Object.keys(votes).length === players.length) {
    // select 3 random wrong options from categoryWords
    const options = categoryWords[currentCategory].filter(w => w !== secretWord);
    const randomWrong = [];
    while (randomWrong.length < 3 && options.length) {
      const idx = Math.floor(Math.random() * options.length);
      randomWrong.push(options.splice(idx, 1)[0]);
    }
    // combine and shuffle
    const guessItems = [...randomWrong, secretWord]
      .sort(() => 0.5 - Math.random());
    // store for guess screen
    window._guessOptions = guessItems;
    const area = document.getElementById('guessWord');
  area.innerHTML = '';
    const div = document.createElement('div'); div.className = 'voting-section';
    const h3 = document.createElement('h3'); h3.textContent = `${outOfTopicPlayer} الكلمة السرية هي :`;
    const btns = document.createElement('div'); btns.className = 'voting-buttons';
    guessItems.filter(x => x !== voter).forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.className = 'btn btn-secondary';
      btn.onclick = () => submitVote(voter, opt);
      btn.onclick = () => calculateResults(opt);
      btns.appendChild(btn);
  
    div.append(h3, btns);
    area.appendChild(div);
  });
    showScreen('guessScreen');
  }
}

/**
 * Calculate and show results
 */function calculateResults(choosenWord) {
  // 1. حساب النقاط لكل لاعب وفقًا لقواعد اللعبة
  players.forEach(p => scores[p] = localStorage.getItem(p)*1);
  let outVotes = 0;
  Object.entries(votes).forEach(([voter, vote]) => {
    if (vote === outOfTopicPlayer) {
      scores[voter] += 25*1;
      outVotes++;
    }
  });
  // مكافأة 100 نقطة إذا اكتشف الأغلبية الخارج
  if (outVotes > players.length / 2) {
    players
      .filter(p => p !== outOfTopicPlayer)
      .forEach(p => scores[p] += 100);
  }
  // الآن حساب نقاط الخارج حسب اختياره للكلمة
  if (secretWord === choosenWord && outVotes < players.length / 2) {
    // نجا الخارج
    scores[outOfTopicPlayer] += 125;
  } else if (secretWord === choosenWord && outVotes >= players.length / 2) {
    // انكشف الخارج
    scores[outOfTopicPlayer] += 75;
  }
  
  // 2. عرض النتائج على الشاشة
  const resArea = document.getElementById('resultsArea');
  resArea.innerHTML = `
    <h2>برا السالفة: ${outOfTopicPlayer}</h2>
    <h3>الكلمة السرية: ${secretWord}</h3>
    <div class="scores">
      ${players
        .slice() // لعدم تغيير ترتيب المصفوفة الأصلية
        .sort((a, b) => scores[b] - scores[a])
        .map(p => `
          <div class="score-row"><span>${p}</span><span>${scores[p]} نقطة</span></div>
        `).join('')}
    </div>
  `;
  
  // 3. تخزين نتائج الجميع في localStorage
  players.forEach(p => {
    // نحفظ تحت مفتاح هو اسم اللاعب، والقيمة هي نقاطه في هذه الجولة
    localStorage.setItem(p, scores[p]);
  });

  // 4. الانتقال لصفحة النتائج
  showScreen('resultsScreen');
}
function loadStoredResults() {
  // 1. نجمع النقاط المخزنة لكل لاعب في مصفوفة
  const storedResults = players.map(p => ({
    name: p,
    score: Number(localStorage.getItem(p) || 0)
  }));

  // 2. نرتبها تنازليًا حسب النقاط
  storedResults.sort((a, b) => b.score - a.score);

  // 3. نبني الـ HTML لكل صف
  const rowsHTML = storedResults.map(({ name, score }) => `
    <div class="score-row">
      <p class="player-name">${name}</p>
      <p class="player-score">${score} نقطة</p>
    </div>
  `).join('');

  // 4. ندخلها داخل العنصر
  const resArea = document.getElementById('resultsArea');
  resArea.innerHTML = `
    <h2>النتائج الكاملة</h2>
    <div class="scores">
      ${rowsHTML}
    </div>
  `;
  showScreen('resultsScreen');
}
/**
 * Reset game state
 */
function resetGame() {
  currentCategory = '';
  secretWord = '';
  outOfTopicPlayer = '';
  currentPlayerIndex = 0;
  questionPairs = [];
  currentQuestionIndex = 0;
  votes = {};
  scores = {};
}
// في app.js أو ui.js
document.getElementById('nav-players').addEventListener('click', () => {
  clearAllTimersSim();
  clearBoxAllTimers();
  clearInterval(timerIntervalT);
  clearTimersJ();
  clearInterval(countdownId);
  clearInterval(timerId);
  clearInterval(preTimerId);
  showScreen('playerScreen');
});
document.getElementById('nav-games').addEventListener('click', () => {
  renderGamesList();
  clearAllTimersSim();
  clearBoxAllTimers();
  clearInterval(timerIntervalT);
  clearTimersJ();
  clearInterval(countdownId);
  clearInterval(timerId);
  clearInterval(preTimerId);
  showScreen('gamesScreen');
});
document.getElementById('nav-results').addEventListener('click', () => {
  clearAllTimersSim();
  clearBoxAllTimers() ;
  clearInterval(timerIntervalT);
  clearTimersJ();
  clearInterval(countdownId);
  clearInterval(timerId);
  clearInterval(preTimerId);
  loadStoredResults()
});

// دالة مساعدة لإظهار الشاشة المطلوبة
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(sec => {
    sec.classList.toggle('active', sec.id === screenId);
  });
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Optional: makes the scroll smooth
  });
}
function showAlert(type, message, duration = 4000) {
  const icons = {
    success: '✅',
    info:    'ℹ️',
    warning: '⚠️',
    error:   '❌'
  };
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span class="icon">${icons[type]}</span>
    <div class="message">${message}</div>
    <button class="close-btn">&times;</button>
  `;
  const container = document.getElementById('alertContainer');
  container.append(alert);

  // Close on click:
  alert.querySelector('.close-btn').onclick = () => dismiss(alert);

  // Auto dismiss:
  setTimeout(() => dismiss(alert), duration);
}

function dismiss(el) {
  el.classList.add('exit');
  el.addEventListener('animationend', () => el.remove());
}