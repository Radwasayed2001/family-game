// scripts/wink.js
// Dependencies: loadPlayers(), showScreen(id)

document.addEventListener('DOMContentLoaded', () => {
    const players       = loadPlayers();
  
    // --- State ---
    let impostorIndices = [];         // can hold 2 or 3 indices now
    let eliminated      = new Set();
    let scores          = {};
    const PRE_VOTE_TIME = 3 * 60;     // 3 دقائق بالثواني
  
    // load historic scores
    players.forEach(p => scores[p] = parseInt(localStorage.getItem(p)) || 0);
  
    let preTimerId, preRemaining;
    let voteTally   = {};
    let voteTurn    = 0;     // index of whose turn to vote
    let remaining;           // array of alive players
  
    // --- DOM refs ---
    const showScreenById    = id => showScreen(id);
    const backToGames       = document.getElementById('backToGamesBtnWink');
    const startWink         = document.getElementById('startWinkBtn');
    const confirmSet        = document.getElementById('confirmWinkSettingsBtn');
    const backRulesBtn      = document.getElementById('backToRulesBtnWink');
    const impostorSelect    = document.getElementById('impostorCountSelect');
  
    // Role reveal
    const passText          = document.getElementById('winkPassText');
    const passNextBtn       = document.getElementById('winkPassNextBtn');
    const roleTitle         = document.getElementById('winkRoleTitle');
    const roleExplain       = document.getElementById('winkRoleExplain');
    const roleDoneBtn       = document.getElementById('winkRoleDoneBtn');
  
    // Pre-vote
    const preTimerEl        = document.getElementById('winkPreTimer');
    const sosBtn            = document.getElementById('winkSOSBtn');
    const markVictimBtn     = document.getElementById('winkMarkVictimBtn');
    const callVoteBtn       = document.getElementById('winkCallVoteBtn');
  
    // Victim selection
    const victimList        = document.getElementById('winkVictimList');
  
    // Voting
    const votePrompt        = document.getElementById('winkVotePrompt');
    const voteOptions       = document.getElementById('winkVoteOptions');
    const voteSubmitBtn     = document.getElementById('winkSubmitVoteBtn');
  
    // Innocent screen
    const innocentText        = document.getElementById('winkInnocentText');
    const innocentContinueBtn = document.getElementById('winkInnocentContinueBtn');
    const innocentScreenId    = 'winkInnocentScreen';
  
    // Results
    const resultsText       = document.getElementById('winkResultsText');
    const resultsBody       = document.getElementById('winkResultsBody');
    const replayBtn         = document.getElementById('winkReplayBtn');
    const endBtn            = document.getElementById('winkEndBtn');
  
    // Screens
    const settingsScreen = 'winkSettingsScreen';
    const passScreen     = 'winkPassScreen';
    const roleScreen     = 'winkRoleScreen';
    const preVoteScreen  = 'winkPreVoteScreen';
    const victimScreen   = 'winkVictimScreen';
    const voteScreen     = 'winkVoteScreen';
    const resultScreen   = 'winkResultsScreen';
  
    // Helper: format seconds as mm:ss
    function formatTime(sec) {
      const m = Math.floor(sec/60), s = sec % 60;
      return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
  
    // --- Flow ---
    backToGames.onclick  = () => showScreenById('gamesScreen');
    startWink.onclick    = () => {
      if (players.length < 5) return showAlert('error','لا يمكن اللعب بأقل من 5 لاعبين!');
      showScreenById(settingsScreen);
      // set initial select value
      impostorSelect.value = '2';
    };
    backRulesBtn.onclick = () => showScreenById('winkRulesScreen');
  
    confirmSet.onclick = () => {
      const count = parseInt(impostorSelect.value, 10);
      // pick `count` unique random indices
      const available = players.map((_,i) => i);
      impostorIndices = [];
      while (impostorIndices.length < count && available.length) {
        const rnd = Math.floor(Math.random() * available.length);
        impostorIndices.push(available.splice(rnd,1)[0]);
      }
      eliminated.clear();
      showNextRole(0);
    };
  
    function showNextRole(i) {
      if (i >= players.length) return beginPreVote();
      const p = players[i];
      passText.textContent = `📱 ${p} يكشف دوره ▶️`;
      passNextBtn.onclick = () => {
        const isImpostor = impostorIndices.includes(i);
        roleTitle.textContent   = isImpostor ? 'أنت دخيل 😈' : 'أنت بريء 😇';
        roleExplain.textContent = isImpostor
          ? 'مهمتك: غمزة سرّية لإقصاء الآخرين دون أن ينكشف أمرك.'
          : 'مهمتك: حاول البقاء حيًّا واكتشاف الدخيل!';
        showScreenById(roleScreen);
        roleDoneBtn.onclick = () => showNextRole(i+1);
      };
      showScreenById(passScreen);
    }
    function beginPreVote() {
        remaining    = players.filter(p => !eliminated.has(p));
        preRemaining = PRE_VOTE_TIME;
        preTimerEl.textContent = formatTime(preRemaining);
        showScreenById(preVoteScreen);
    
        clearInterval(preTimerId);
        preTimerId = setInterval(() => {
          preRemaining--;
          preTimerEl.textContent = formatTime(preRemaining);
          if (preRemaining <= 0) {
            clearInterval(preTimerId);
            startVoting();
          }
        }, 1000);
    
        // **SOS now reveals two buttons (victim or vote)**
        sosBtn.onclick = () => {
          clearInterval(preTimerId);
          // show both action buttons
          document.getElementById('winkMarkVictimBtn').style.display = 'inline-block';
          document.getElementById('winkCallVoteBtn').style.display   = 'inline-block';
        };
    
        // hide them initially
        markVictimBtn.style.display = 'none';
        callVoteBtn.style.display   = 'none';
    
        markVictimBtn.onclick = () => {
          pickVictim();
        };
        callVoteBtn.onclick = () => {
          startVoting();
        };
      }
    
      // --- Victim selection ---
      function pickVictim() {
        remaining = players.filter(p => !eliminated.has(p));
        victimList.innerHTML = '';
        remaining.forEach(p => {
          const li = document.createElement('li');
          const btn= document.createElement('button');
          btn.textContent = p;
          btn.className   = 'btn btn-warning player-btn';
          btn.onclick     = () => {
            if (players[killerIndex] === p) {
              alert('❌ قمتم باستبعاد القاتل. انتهت الجولة.');
              confirmSet.onclick();
            } else {
              eliminated.add(p);
              startVoting();
            }
          };
          li.appendChild(btn);
          victimList.appendChild(li);
        });
        showScreenById(victimScreen);
      }
    
      // --- Voting ---
      function startVoting() {
        remaining = players.filter(p => !eliminated.has(p));
        voteTally = {};
        voteTurn  = 0;
        askNextVote();
      }
    
      function askNextVote() {
        if (voteTurn >= remaining.length) {
          tallyVotes();
          return;
        }
        const voter = remaining[voteTurn];
        votePrompt.textContent = `🕵️ ${voter} يصوّت`;
        voteOptions.innerHTML = remaining.map(c =>
          `<label><input type="radio" name="suspect" value="${c}"> ${c}</label>`
        ).join('<br>');
        voteOptions.querySelector('input').checked = true;
        voteSubmitBtn.onclick = () => {
          const choice = voteOptions.querySelector('input[name="suspect"]:checked').value;
          voteTally[choice] = (voteTally[choice]||0) + 1;
          voteTurn++;
          askNextVote();
        };
        showScreenById(voteScreen);
      }
    
      // --- Tally & Results ---
      function tallyVotes() {
        let top=null, max=0;
        Object.entries(voteTally).forEach(([n,c])=>{
          if(c>max){max=c;top=n;}
        });
        if (top===players[killerIndex]) {
          remaining.filter(p=>p!==top).forEach(p=>{
            scores[p]+=25;
            localStorage.setItem(p,scores[p]);
          });
          showRoundResult(`✅ اكتشفتم القاتل (${top})! كل بريء يحصل على 25 نقطة`);
        } else {
          eliminated.add(top);
          const innocentsLeft = players.length - eliminated.size - 1;
          if (innocentsLeft<2) {
            const k=players[killerIndex];
            scores[k]+=100;
            localStorage.setItem(k,scores[k]);
            showRoundResult(`😎 القاتل (${k}) انتصر! يحصل على 100 نقطة`);
          } else {
            innocentText.textContent=`اللاعب ${top} بريء وليس هو القاتل.`;
            innocentContinueBtn.onclick=()=>beginPreVote();
            showScreenById(innocentScreenId);
          }
        }
      }
    
      function showRoundResult(txt) {
        resultsText.textContent=txt;
        resultsBody.innerHTML = players.map((p,i)=>{
          return `<tr><td>${i+1}</td><td>${p}</td><td>${scores[p]}</td>
          <td>${localStorage.getItem(p)||0}</td></tr>`;
        }).join('');
        showScreenById(resultScreen);
      }
    
      replayBtn.onclick = () => confirmSet.onclick();
      endBtn.onclick    = () => showScreenById('gamesScreen');
    
    // ... rest of the code remains unchanged ...
  });
  