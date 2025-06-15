// scripts/wink.js
// Dependencies: loadPlayers(), showScreen(id), showAlert(type, msg)

document.addEventListener('DOMContentLoaded', () => {
  const players        = loadPlayers();
  let impostorIndices  = [];        // array of impostor positions
  let eliminated       = new Set();  // eliminated players
  let scores           = {};
  const PRE_VOTE_TIME  = 3 * 60;      // 3 دقائق بالثواني

  // load historic scores
  players.forEach(p => {
    scores[p] = parseInt(localStorage.getItem(p), 10) || 0;
  });

  let preRemaining;
  let voteTally = {};
  let voteTurn  = 0;
  let remaining;  // array of alive players

  // --- DOM refs ---
  const showScreenById    = id => {
    clearInterval(preTimerId);

    showScreen(id)
  
  };
  const backToGames       = document.getElementById('backToGamesBtnWink');
  const startWink         = document.getElementById('startWinkBtn');
  const confirmSet        = document.getElementById('confirmWinkSettingsBtn');
  const backRulesBtn      = document.getElementById('backToRulesBtnWink');
  const impostorCountEl   = document.getElementById('impostorCountSelect');

  // Role reveal
  const passText          = document.getElementById('winkPassText');
  const passNextBtn       = document.getElementById('winkPassNextBtn');
  const roleTitle         = document.getElementById('winkRoleTitle');
  const roleExplain       = document.getElementById('winkRoleExplain');
  const roleDoneBtn       = document.getElementById('winkRoleDoneBtn');

  // Pre-vote
  const preTimerEl        = document.getElementById('winkPreTimer');
  const sosBtn            = document.getElementById('winkCallVoteBtn');
  const exitBtn           = document.getElementById('winkMarkVictimBtn');
  const callVoteBtn       = document.getElementById('winkCallVoteBtn');
  const skipBtn           = document.getElementById('winkSkipBtn');

  // Victim selection
  const victimList        = document.getElementById('winkVictimList');

  // Voting
  const votePrompt        = document.getElementById('winkVotePrompt');
  const voteOptions       = document.getElementById('winkVoteOptions');
  const voteSubmitBtn     = document.getElementById('winkSubmitVoteBtn');

  // Innocent warning
  const innocentText      = document.getElementById('winkInnocentText');
  const innocentContinueBtn = document.getElementById('winkInnocentContinueBtn');

  // Results
  const resultsText       = document.getElementById('winkResultsText');
  const resultsBody       = document.getElementById('winkResultsBody');
  const replayBtn         = document.getElementById('winkReplayBtn');
  const endBtn            = document.getElementById('winkEndBtn');

  // Screens
  const settingsScreen    = 'winkSettingsScreen';
  const passScreen        = 'winkPassScreen';
  const roleScreen        = 'winkRoleScreen';
  const preVoteScreen     = 'winkPreVoteScreen';
  const victimScreen      = 'winkVictimScreen';
  const voteScreen        = 'winkVoteScreen';
  const innocentScreen    = 'winkInnocentScreen';
  const resultScreen      = 'winkResultsScreen';

  // format seconds as MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Navigation handlers ---
  backToGames.onclick  = () => showScreenById('gamesScreen');
  backRulesBtn.onclick = () => showScreenById('winkRulesScreen');
  startWink.onclick    = () => {
    if (players.length < 5) {
      showAlert('error', 'لا يمكن اللعب بأقل من 5 لاعبين!');
    } else {
      showScreenById(settingsScreen);
    }
  };

  // --- Setup impostors ---
  // --- Setup impostors ---
confirmSet.onclick = () => {
  const count = parseInt(impostorCountEl.value, 10);
  const total = players.length;
  // حساب عدد الأبرياء
  const innocents = total - count;
  // نتحقق أن count ≥ 1 وأقل من total، وبالإضافة count ≤ innocents - 2
  if (
    count < 1 ||
    count >= total ||
    count > innocents - 2
  ) {
    showAlert(
      'error',
      `عدد الدخلاء يجب أن يكون على الأقل 1 وأقل من عدد الأبرياء بمقدار 2 لاعبين.\n` +
      `الأبرياء: ${innocents} → الدخلاء ≤ ${innocents - 2}`
    );
    return;
  }

  // لو اجتاز التحقق، نوزِّع الأدوار:
  const indices = players.map((_, i) => i);
  impostorIndices = [];
  while (impostorIndices.length < count) {
    const rnd = Math.floor(Math.random() * indices.length);
    impostorIndices.push(indices.splice(rnd, 1)[0]);
  }
  eliminated.clear();
  showNextRole(0);
};


  // --- Role reveal ---
  function showNextRole(i) {
    if (i >= players.length) return beginPreVote();

    const playerName = players[i];
    passText.textContent = `📱 ${playerName} يكشف دوره ▶️`;

    passNextBtn.onclick = () => {
      const isImp = impostorIndices.includes(i);
      roleTitle.textContent = isImp ? 'أنت دخيل 😈' : 'أنت بريء 😇';
      if (isImp) {
        const coImps = impostorIndices
          .map(idx => players[idx])
          .filter(n => n !== playerName)
          .join(' و ');
        roleExplain.textContent = coImps
          ? `أنت دخيل مع: ${coImps}`
          : `أنت الدخيل الوحيد`;
      } else {
        roleExplain.textContent = 'مهمتك: حاول البقاء حيًّا واكتشاف الدخلاء.';
      }

      showScreenById(roleScreen);
      roleDoneBtn.onclick = () => showNextRole(i + 1);
    };

    showScreenById(passScreen);
  }

  // --- Pre-vote countdown ---
  function beginPreVote() {
    remaining    = players.filter(p => !eliminated.has(p));
    preRemaining = PRE_VOTE_TIME;
    preTimerEl.textContent = formatTime(preRemaining);
    showScreenById(preVoteScreen);

    const leftImps = impostorIndices
      .map(i => players[i])
      .filter(p => !eliminated.has(p))
      .length;
    sosBtn.style.display = leftImps === 1 ? 'inline-block' : 'none';


    clearInterval(preTimerId);
    preTimerId = setInterval(() => {
      preRemaining--;
      preTimerEl.textContent = formatTime(preRemaining);
      if (preRemaining <= 0) {
        clearInterval(preTimerId);
        pickVictim();
      }
    }, 1000);

    sosBtn.onclick = () => {
      clearInterval(preTimerId);
      exitBtn.style.display     = 'inline-block';
      skipBtn.style.display     = 'inline-block';
      callVoteBtn.style.display = 'inline-block';
    };
    exitBtn.onclick    = () => pickVictim();
    callVoteBtn.onclick = () => {
      
      startVoting();
    }
    skipBtn.onclick     = () => beginPreVote();
  }

  // --- Pick victim (exit) ---
  function pickVictim() {
    remaining = players.filter(p => !eliminated.has(p));
    victimList.innerHTML = '';
    remaining.forEach(p => {
      const btn = document.createElement('button');
      btn.textContent = p;
      btn.className   = 'btn btn-warning player-btn';
      btn.onclick     = () => {
        const idx = players.indexOf(p);
        if (impostorIndices.includes(idx)) {
          showAlert('error', 'خطأ! لقد استهدفت دخيلًا. تعاد اللعبة من البداية.');
          confirmSet.onclick();
          return;
        }
        eliminated.add(p);
        startVoting();
      };
      const li = document.createElement('li');
      li.appendChild(btn);
      victimList.appendChild(li);
    });
    showScreenById(victimScreen);
  }

  // --- Voting ---
  function startVoting() {
    clearInterval(preTimerId);

    remaining = players.filter(p => !eliminated.has(p));
    voteTally = {};
    voteTurn  = 0;
    askNextVote();
  }

  function askNextVote() {
    clearInterval(preTimerId);

    if (voteTurn >= remaining.length) return tallyVotes();
    const voter = remaining[voteTurn];
    votePrompt.textContent = `🕵️ ${voter} يصوّت`;
    voteOptions.innerHTML = remaining
      .map(n => `<label><input type="radio" name="suspect" value="${n}"> ${n}</label>`)
      .join('<br>');
    voteOptions.querySelector('input').checked = true;
    voteSubmitBtn.onclick = () => {
      const choice = voteOptions.querySelector('input:checked').value;
      voteTally[choice] = (voteTally[choice] || 0) + 1;
      voteTurn++;
      askNextVote();
    };
    showScreenById(voteScreen);
  }

  // --- Tally & Results ---
  function tallyVotes() {
    let top = null, max = 0;
    Object.entries(voteTally).forEach(([n, c]) => {
      if (c > max) { max = c; top = n; }
    });
    const idxImp = players.indexOf(top);
    const isImp  = impostorIndices.includes(idxImp);

    if (isImp) {
      // discovered impostor
      eliminated.add(top);

      const left = impostorIndices
        .map(i => players[i])
        .filter(p => !eliminated.has(p));

      if (left.length > 0) {
        showAlert('info', `✅ اللاعب ${top} دخيل وخرج من اللعبة`);
        beginPreVote();
      } else {
        // Innocents win → only innocents get +25
        players
          .filter(p => !impostorIndices.includes(players.indexOf(p)))
          .forEach(p => {
            scores[p] += 25;
            localStorage.setItem(p, scores[p]);
          });
        showFinalResult('🎉 الأبرياء انتصروا!');
      }
    } else {
      // innocent wrongly out
      eliminated.add(top);

      const innocentsLeft = players
        .filter(p => !eliminated.has(p))
        .filter(p => !impostorIndices.includes(players.indexOf(p)))
        .length;
      const impostorsLeft = impostorIndices
        .map(i => players[i])
        .filter(p => !eliminated.has(p))
        .length;

      if (innocentsLeft <= impostorsLeft) {
        // Impostors win → only impostors get +100
        impostorIndices
          .map(i => players[i])
          .forEach(p => {
            scores[p] += 100;
            localStorage.setItem(p, scores[p]);
          });
        showFinalResult('😎 الدخلاء انتصروا!');
      } else {
        innocentText.textContent = `اللاعب ${top} بريء.`;
        innocentContinueBtn.onclick = () => beginPreVote();
        showScreenById(innocentScreen);
      }
    }
  }

  // --- Display final result and restart ---
  function showFinalResult(txt) {
    resultsText.textContent = txt;
    resultsBody.innerHTML = players.map((p, idx) => {
      const roundPts = scores[p];
      const totalPts = parseInt(localStorage.getItem(p), 10) || 0;
      return `
        <tr>
          <td>${idx+1}</td>
          <td>${p}</td>
          <td>${roundPts}</td>
          <td>${totalPts}</td>
        </tr>`;
    }).join('');
    showScreenById(resultScreen);
    replayBtn.textContent = 'جولة جديدة';
    replayBtn.onclick = () => confirmSet.onclick();
  }

  // --- Init ---
  endBtn.onclick = () => showScreenById('gamesScreen');
});
