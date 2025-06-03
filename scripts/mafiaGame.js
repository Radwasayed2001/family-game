let mafiaCurrentPlayerIndex = 0;
let playersMafia = loadPlayers();
let mafiaQuestionPairs = [];
let mafiaCurrentQuestionIndex = 0;
let mafiaVotes = {};
let mafiaScores = {};
let mafiaRoles = [];
let flag = false; // Flag to track if a choice has been made
let NightVotes = {};
let pnum = 1;
let mnum = 1;
let mafianum = Math.floor(playersMafia.length/4);
let cnum = playersMafia.length - Math.floor(playersMafia.length/4) - 2;
let originalPlayers = loadPlayers();
function startMafiaGame() {
  originalPlayers = loadPlayers();
  playersMafia = loadPlayers();
  pnum = 1;
  mnum = 1;
  mafianum = Math.floor(originalPlayers.length/4);
  cnum = originalPlayers.length - Math.floor(playersMafia.length/4) - 2;

  if (originalPlayers.length < 6) {
    showAlert('error', 'لعبة المافيا تحتاج على الأقل 6 لاعبين.');
    return;
  }
    // reset state
    mafiaCurrentPlayerIndex = 0;
    mafiaQuestionPairs = [];
    mafiaCurrentQuestionIndex = 0;
    mafiaVotes = {};
    mafiaScores = {};
    playersMafia = [...originalPlayers];
    // how many mafia members: one for every 4 playersMafia (rounded down)
    const mafiaCount = Math.floor(playersMafia.length / 4);
  
    // make a shuffled copy of playersMafia
    const shuffled = [...playersMafia].sort(() => Math.random() - 0.5);
  
    // pick mafia members
    const mafiaMembers = shuffled.slice(0, mafiaCount);
  
    // next one is doctor, then detective
    const doctor    = shuffled[mafiaCount];
    const detective = shuffled[mafiaCount + 1];
  
    // rest are villagers
    const villagers = shuffled.slice(mafiaCount + 2);
  
    // build the roles mapping: playerName → role
    mafiaRoles = {};
    mafiaMembers.forEach(p => { mafiaRoles[p] = 'مافيا'; });
    mafiaRoles[doctor]    = 'طبيب';
    mafiaRoles[detective] = 'محقق';
    villagers.forEach(p => { mafiaRoles[p] = 'مواطن'; });
  
  
    // now you can proceed to the privacy/role-reveal flow...
    showMafiaRoleRevealScreen();
  }
function showMafiaRoleRevealScreen() {
  document.getElementById('mafiaPlayerConfirmButton').textContent = `أنا ${playersMafia[mafiaCurrentPlayerIndex]}`;
  document.getElementById('playernameMafia').textContent = `${playersMafia[mafiaCurrentPlayerIndex]}`;
  showScreen('mafiaWarningScreen');
}

function showRole() {
    const player = playersMafia[mafiaCurrentPlayerIndex];
  const content = document.getElementById('roleContent');
  document.querySelector('#roleScreen .player-name').textContent = player;

    content.innerHTML = '';
  const revealBtn = document.createElement('button');
  revealBtn.id = 'revealButtonMafia';
  revealBtn.className = 'btn btn-primary';
  revealBtn.textContent = 'هنا انقر';
  revealBtn.addEventListener('click', ()=>roleShown(mafiaRoles[player]));
  content.appendChild(revealBtn);

    const confirmBtn = document.getElementById('roleConfirmButton');
    confirmBtn.textContent = 'موافق';
    confirmBtn.style.display = 'block';
    showScreen('roleScreen');
    return;
}
function roleShown(role) {
  const player = playersMafia[mafiaCurrentPlayerIndex];
  const content = document.getElementById('roleContent');

  if (role === 'مافيا') {
    // استخراج جميع أعضاء المافيا ماعدا اللاعب نفسه
    const team = Object
      .entries(mafiaRoles)
      .filter(([p, r]) => r === 'مافيا' && p !== player)
      .map(([p]) => p);
    
    content.innerHTML = `
      <h3 class="secret-word">أنت مافيا 💀</h3>
      <p class="secret-instruction">
        مهمتك: محاولة قتل الجميع بدون أن يُكتشف أحد.<br>
        زملاؤك في المافيا: ${team.join('، ')}.<br>
        احذر من الطبيب والمحقق وحاول إخراجهم مبكرًا لزيادة فرص نجاحكم.
      </p>
    `;
  }
  else if (role === 'مواطن') {
    content.innerHTML = `
      <h3 class="secret-word">أنت مواطن 👩‍🌾</h3>
      <p class="secret-instruction">
        مهمتك الدفاع عن نفسك وباقي المواطنين عن طريق التصويت.<br>
        احذر من الخطأ في التصويت!
      </p>
    `;
  }
  else if (role === 'طبيب') {
    content.innerHTML = `
      <h3 class="secret-word">أنت طبيب 🩺</h3>
      <p class="secret-instruction">
        مهمتك حماية لاعب واحد في كل ليلة – ويمكنك حماية نفسك إذا رغبت.
      </p>
    `;
  }
  else if (role === 'محقق') {
    content.innerHTML = `
      <h3 class="secret-word">أنت محقق 🕵️‍♂️</h3>
      <p class="secret-instruction">
        مهمتك: التحقق سرًا من هوية لاعب واحد في كل ليلة وإخبار الآخرين.
      </p>
    `;
  }

  document.getElementById('roleConfirmButton').style.display = 'block';
}

  function nextMafiaPlayer() {
    document.querySelectorAll('.pnum').forEach(el => {
      el.textContent = pnum;
    });
    document.querySelectorAll('.mnum').forEach(el => {
      el.textContent = mnum;
    });
    document.querySelectorAll('.mafianum').forEach(el => {
      el.textContent = mafianum
    });
    document.querySelectorAll('.cnum').forEach(el => {
      el.textContent = cnum;
    });
    mafiaCurrentPlayerIndex++;
    if (mafiaCurrentPlayerIndex < playersMafia.length) {
        showMafiaRoleRevealScreen();
    } else {
      

    //   startQuestionsRound();
    showScreen('NightDurationScreen');
    
    }
  }
  function nextMafiaPlayerMorning() {
    document.querySelectorAll('.pnum').forEach(el => {
      el.textContent = pnum;
    });
    document.querySelectorAll('.mnum').forEach(el => {
      el.textContent = mnum;
    });
    document.querySelectorAll('.mafianum').forEach(el => {
      el.textContent = mafianum
    });
    document.querySelectorAll('.cnum').forEach(el => {
      el.textContent = cnum;
    });
    mafiaCurrentPlayerIndex++;
    if (mafiaCurrentPlayerIndex < playersMafia.length) {
        showMafiaRoleRevealScreen();
    } else {
      

    //   startQuestionsRound();
    showScreen('MorningDurationScreen');
    
    }
  }
  function startMafiaVoting(){
    mafiaCurrentPlayerIndex = 0;
    mafiaQuestionPairs = [];
    mafiaCurrentQuestionIndex = 0;
    mafiaVotes = {};
    mafiaScores = {};
    NightVotes = {};
    document.getElementById('showNightRes').style.display = 'block';

    document.getElementById("startNight").style.display = 'none';
    document.getElementById("nightResult").textContent = "";
    showVote();
  }
  function startMafiaVotingMorning(){
    mafiaCurrentPlayerIndex = 0;
    mafiaQuestionPairs = [];
    mafiaCurrentQuestionIndex = 0;
    mafiaVotes = {};
    mafiaScores = {};
    NightVotes = {};

    console.log("startMafiaVotingMorning")
    document.getElementById('showMorningRes').style.display = 'block';

  document.getElementById("startMorn").style.display = 'none';
  document.getElementById("morningResult").textContent = "";

    showVoteMorning();
  }
  function showVote(){
    // mafiaCurrentPlayerIndex = 0;
  // document.getElementById('playernameMafia').textContent = `${playersMafia[mafiaCurrentPlayerIndex]}`;
    // mafiaCurrentPlayerIndex++; 
    if (mafiaCurrentPlayerIndex > 0 && mafiaCurrentPlayerIndex <= playersMafia.length) {
      if (!flag && mafiaRoles[playersMafia[mafiaCurrentPlayerIndex -1]] === 'محقق') {
        showAlert('error','Please make a choice before confirming.');
        flag = false;
        mafiaCurrentPlayerIndex-=2;

        showQuestionVote(mafiaRoles[playersMafia[mafiaCurrentPlayerIndex - 1]])


        // if (mafiaCurrentPlayerIndex < playersMafia.length) {

        //   showScreen('mafiaVoting');
    
        // } else {
        //   console.log("any")
        // }
  
      } else if (!flag && mafiaRoles[playersMafia[mafiaCurrentPlayerIndex -1]] === 'مافيا') {
        showAlert('error','Please make a choice before confirming.');
        flag = false;
        mafiaCurrentPlayerIndex-=2;

        showQuestionVote(mafiaRoles[playersMafia[mafiaCurrentPlayerIndex - 1]])


        // if (mafiaCurrentPlayerIndex < playersMafia.length) {

        //   showScreen('mafiaVoting');
    
        // } else {
        //   console.log("any")
        // }
  
  
      } else if (!flag && mafiaRoles[playersMafia[mafiaCurrentPlayerIndex -1]] === 'طبيب') {
        showAlert('error','Please make a choice before confirming.d');
        flag = false;
        mafiaCurrentPlayerIndex-=2;
        showQuestionVote(mafiaRoles[playersMafia[mafiaCurrentPlayerIndex - 1]])
        // if (mafiaCurrentPlayerIndex < playersMafia.length) {

        //   showScreen('mafiaVoting');
    
        // } else {
        //   console.log("any")
        // }
  
  
      }
       else {
        // alert('كله تمام');
        if (mafiaCurrentPlayerIndex < playersMafia.length) {

          showScreen('mafiaVoting');
    
        } else {
          console.log("any")
        }
      }
    }
  document.getElementById('mafiaPlayerVoteButton').textContent = `${playersMafia[mafiaCurrentPlayerIndex]}`;

    if (mafiaCurrentPlayerIndex < playersMafia.length) {

      showScreen('mafiaVoting');

    } else {
      showScreen("NightRes");
    }
    
  }
  function showVoteMorning(){
    // mafiaCurrentPlayerIndex = 0;
  // document.getElementById('playernameMafia').textContent = `${playersMafia[mafiaCurrentPlayerIndex]}`;
    // mafiaCurrentPlayerIndex++; 
    if (mafiaCurrentPlayerIndex > 0 && mafiaCurrentPlayerIndex <= playersMafia.length) {
      if (!flag && mafiaRoles[playersMafia[mafiaCurrentPlayerIndex -1]] === 'محقق') {
        showAlert('error','Please make a choice before confirming.');
        flag = false;
        mafiaCurrentPlayerIndex-=2;

        showQuestionVoteMorning(mafiaRoles[playersMafia[mafiaCurrentPlayerIndex - 1]])


        // if (mafiaCurrentPlayerIndex < playersMafia.length) {

        //   showScreen('mafiaVoting');
    
        // } else {
        //   console.log("any")
        // }
  
      } else if (!flag && mafiaRoles[playersMafia[mafiaCurrentPlayerIndex -1]] === 'مافيا') {
        showAlert('error','Please make a choice before confirming.');
        flag = false;
        mafiaCurrentPlayerIndex-=2;

        showQuestionVoteMorning(mafiaRoles[playersMafia[mafiaCurrentPlayerIndex - 1]])


        // if (mafiaCurrentPlayerIndex < playersMafia.length) {

        //   showScreen('mafiaVoting');
    
        // } else {
        //   console.log("any")
        // }
  
  
      } else if (!flag && mafiaRoles[playersMafia[mafiaCurrentPlayerIndex -1]] === 'طبيب') {
        showAlert('error','Please make a choice before confirming.d');
        flag = false;
        mafiaCurrentPlayerIndex-=2;
        showQuestionVoteMorning(mafiaRoles[playersMafia[mafiaCurrentPlayerIndex - 1]])
        // if (mafiaCurrentPlayerIndex < playersMafia.length) {

        //   showScreen('mafiaVoting');
    
        // } else {
        //   console.log("any")
        // }
  
  
      }
       else {
        // alert('كله تمام');
        if (mafiaCurrentPlayerIndex < playersMafia.length) {

          showScreen('mafiaVotingMorning');
    
        } else {
          console.log("any")
        }
      }
    }
  document.getElementById('mafiaPlayerVoteButtonMorning').textContent = `${playersMafia[mafiaCurrentPlayerIndex]}`;

    if (mafiaCurrentPlayerIndex < playersMafia.length) {

      showScreen('mafiaVotingMorning');

    } else {
      showScreen("morningRes");
    }
    
  }
  function showQuestion(){
    flag = false;
    document.getElementById('player-name-vote').textContent = `${playersMafia[mafiaCurrentPlayerIndex]}`;
    
    if (mafiaCurrentPlayerIndex < playersMafia.length) {
      
    const player = playersMafia[mafiaCurrentPlayerIndex];
  const content = document.getElementById('VoteContent');
  document.querySelector('#VoteRoleScreen .player-name').textContent = player;

    content.innerHTML = '';
  const voteConButton = document.createElement('button');
  voteConButton.id = 'voteConButton';
  voteConButton.className = 'btn btn-primary';
  voteConButton.textContent = 'هنا انقر';
  voteConButton.addEventListener('click', ()=> showQuestionVote(mafiaRoles[player]));
  content.appendChild(voteConButton);

    const confirmBtn = document.getElementById('VoteConfirmButton');
    confirmBtn.textContent = 'موافق';
    confirmBtn.style.display = 'block';
    showScreen('VoteRoleScreen');
    return;
    } else {
      console.log("any")
    }
    
    
  }
  function showQuestionMorning(){
    flag = false;
    document.getElementById('player-name-vote-morning').textContent = `${playersMafia[mafiaCurrentPlayerIndex]}`;
    
    if (mafiaCurrentPlayerIndex < playersMafia.length) {
      
    const player = playersMafia[mafiaCurrentPlayerIndex];
  const content = document.getElementById('VoteContentMorning');
  document.querySelector('#VoteRoleScreenMorning .player-name').textContent = player;

    content.innerHTML = '';
  const voteConButton = document.createElement('button');
  voteConButton.id = 'voteConButtonMorning';
  voteConButton.className = 'btn btn-primary';
  voteConButton.textContent = 'هنا انقر';
  voteConButton.addEventListener('click', ()=> showQuestionVoteMorning(mafiaRoles[player]));
  content.appendChild(voteConButton);

    const confirmBtn = document.getElementById('VoteConfirmButtonMorning');
    confirmBtn.textContent = 'موافق';
    confirmBtn.style.display = 'block';
    showScreen('VoteRoleScreenMorning');
    return;
    } else {
      console.log("any")
    }
    
    
  }
  function showQuestionVoteMorning(){
    flag = false;
    document.getElementById('player-name-vote').textContent = `${playersMafia[mafiaCurrentPlayerIndex]}`;
    
    if (mafiaCurrentPlayerIndex < playersMafia.length) {
      
    const player = playersMafia[mafiaCurrentPlayerIndex];
  const content = document.getElementById('VoteContent');
  document.querySelector('#VoteRoleScreen .player-name').textContent = player;

    content.innerHTML = '';
  const voteConButton = document.createElement('button');
  voteConButton.id = 'voteConButton';
  voteConButton.className = 'btn btn-primary';
  voteConButton.textContent = 'هنا انقر';
  voteConButton.addEventListener('click', ()=> showQuestionVoteMorning(mafiaRoles[player]));
  content.appendChild(voteConButton);

    const confirmBtn = document.getElementById('VoteConfirmButton');
    confirmBtn.textContent = 'موافق';
    confirmBtn.style.display = 'block';
    showScreen('VoteRoleScreenMorning');
    return;
    } else {
      console.log("any")
    }
    
    
  }
  function showQuestionVote(role) {
    const player = playersMafia[mafiaCurrentPlayerIndex];
    const content = document.getElementById('VoteContent');
    const confirmBtn = document.getElementById('VoteConfirmButton');
  
    // Reset any previous countdown
    let countdownInterval = null;
  
    if (role === 'مواطن') {
      // عرض رسالة "أنت مواطن" مع عداد 5→1
      content.innerHTML = `
        <h3 class="secret-word">أنت مواطن 👩‍🌾</h3>
        <p class="secret-instruction">
          ليس لديك مهمة خاصة في هذه الجولة المسائية.
        </p>
        <p id="citizenCountdown" class="countdown-text">3</p>
      `;
      confirmBtn.style.display = 'none';
  
      // نبدأ العد التنازلي من 5 إلى 1
      let timeLeft = 3;
      const countdownEl = document.getElementById('citizenCountdown');
      countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 1) {
          countdownEl.textContent = timeLeft;
        } else {
          clearInterval(countdownInterval);
          countdownEl.remove();
          // بعد انتهاء العد، نظهر زر "موافق"
          confirmBtn.textContent = 'موافق';
          confirmBtn.style.display = 'block';
        }
      }, 1000);
  
    } else if (role === 'طبيب') {
      content.innerHTML = `
        <h3 class="secret-word">أنت طبيب 🩺</h3>
        <p class="secret-instruction">
          اختر اللاعب الذي تتوقع أن المافيا تريد قتله حتى تنقذه:
        </p>
        <div id="doctorChoices" class="choice-list"></div>
      `;
      const list = document.getElementById('doctorChoices');
      playersMafia.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary choice-btn';
        btn.textContent = p === player ? 'أنت' : p;
        btn.value = p;
        btn.addEventListener('click', () => {
          console.log(`الطبيب ${player} أنقذ:`, p);
          NightVotes["doctor"] = btn.value;
          document.querySelectorAll('#doctorChoices .choice-btn')
            .forEach(b => b.disabled = true);
          flag = true;
        });
        list.appendChild(btn);
      });
  
    } else if (role === 'مافيا') {
      content.innerHTML = `
        <h3 class="secret-word">أنت مافيا 💀</h3>
        <p class="secret-instruction">
          اختر اللاعب الذي تريد إخراجه من اللعبة:
        </p>
        <div id="mafiaChoices" class="choice-list"></div>
      `;
      const list = document.getElementById('mafiaChoices');
      playersMafia
        .filter(p => p !== player)
        .forEach(p => {
          const btn = document.createElement('button');
          btn.className = 'btn btn-secondary choice-btn';
          btn.textContent = p;
          btn.value = p;
          btn.addEventListener('click', () => {
            if (mafiaRoles[p] === 'مافيا') {
              showAlert('warning','لا يمكنك التصويت ضد زميلك في المافيا!');
            } else {
              console.log(`المافيا ${player} اختار قتل:`, p);
              NightVotes[p] = (NightVotes[p] || 0) + 1;
              document.querySelectorAll('#mafiaChoices .choice-btn')
                .forEach(b => b.disabled = true);
              flag = true;
            }
          });
          list.appendChild(btn);
        });
  
    } else if (role === 'محقق') {
      content.innerHTML = `
        <h3 class="secret-word">أنت محقق 🕵️‍♂️</h3>
        <p class="secret-instruction">
          اختر لاعبًا للتحقق من هويته:
        </p>
        <div id="detectiveChoices" class="choice-list"></div>
      `;
      const list = document.getElementById('detectiveChoices');
      playersMafia
        .filter(p => p !== player)
        .forEach(p => {
          const btn = document.createElement('button');
          btn.className = 'btn btn-secondary choice-btn';
          btn.textContent = p;
          btn.addEventListener('click', () => {
            showAlert('info', `${p} : ${mafiaRoles[p]}`);
            document.querySelectorAll('#detectiveChoices .choice-btn')
              .forEach(b => b.disabled = true);
            flag = true;
          });
          list.appendChild(btn);
        });
    }
  
    mafiaCurrentPlayerIndex++;
  }
  
function showQuestionVoteMorning(role) {
  const player = playersMafia[mafiaCurrentPlayerIndex];
  const content = document.getElementById('VoteContentMorning');
  const confirmBtn = document.getElementById('VoteConfirmButtonMorning');


  content.innerHTML = `
      <h3 class="secret-word">اختر اللاعب الذي تريد إخراجه من اللعبة:</h3>
      <div id="mafiaChoicesMorning" class="choice-list"></div>
    `;
    const list = document.getElementById('mafiaChoicesMorning');
    playersMafia
      .filter(p => p !== player)
      .forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary choice-btn';
        btn.textContent = p;
        btn.value = p;
        btn.addEventListener('click', () => {
            console.log(` ${player} اختار استبعاد:`, p);
            btn.value = p;
            NightVotes[p]?NightVotes[p]++:NightVotes[p]=1;
            document.querySelectorAll('#mafiaChoicesMorning .choice-btn')
              .forEach(b => b.disabled = true);
            flag = true; // Set flag to true when a valid choice is made
          
        });
        list.appendChild(btn);
      });
  mafiaCurrentPlayerIndex++; 
  confirmBtn.style.display = 'block';
    
  
  

}
document.getElementById('showNightRes').addEventListener('click', ()=>{
  console.log("oooooooooooooooooooooooooooooooooooooooo")
  let max = 0;
  let maxPlayer = "";
  for (const player in NightVotes) {
    if (NightVotes[player] > max) {
      max = NightVotes[player];
      maxPlayer = player;
    }
  }
  console.log(maxPlayer);
  console.log(max + " : mafia number = " + Math.floor(playersMafia.length/4));
  
  if (Math.floor(originalPlayers.length/4) == 1 && max == 1) {
    if(maxPlayer !== NightVotes["doctor"]){
      document.getElementById("nightResult").textContent = `تم استبعاد ${maxPlayer} من اللعبة`;
      maxPlayer&&playersMafia.splice(playersMafia.indexOf(maxPlayer), 1);
      if(mafiaRoles[maxPlayer] === "مافيا"){
        mafianum--;
    }
      else if(mafiaRoles[maxPlayer] === "مواطن"){
        cnum--;
    }
      else if(mafiaRoles[maxPlayer] === "طبيب"){
        mnum--;
    }
      else if(mafiaRoles[maxPlayer] === "محقق"){
        pnum--;
    }
    document.querySelectorAll('.pnum').forEach(el => {
      el.textContent = pnum;
    });
    document.querySelectorAll('.mnum').forEach(el => {
      el.textContent = mnum;
    });
    document.querySelectorAll('.mafianum').forEach(el => {
      el.textContent = mafianum
    });
    document.querySelectorAll('.cnum').forEach(el => {
      el.textContent = cnum;
    });
    }
    else
      document.getElementById("nightResult").textContent = "لم يتم استبعاد أحد من اللعبة";

  }else if (max > 1) {
    if(maxPlayer !== NightVotes["doctor"]){
      document.getElementById("nightResult").textContent = `تم استبعاد ${maxPlayer} من اللعبة`;
      if(mafiaRoles[maxPlayer] === "مافيا"){
        mafianum--;
    }
      else if(mafiaRoles[maxPlayer] === "مواطن"){
        cnum--;
    }
      else if(mafiaRoles[maxPlayer] === "طبيب"){
        mnum--;
    }
      else if(mafiaRoles[maxPlayer] === "محقق"){
        pnum--;
    }
    document.querySelectorAll('.pnum').forEach(el => {
      el.textContent = pnum;
    });
    document.querySelectorAll('.mnum').forEach(el => {
      el.textContent = mnum;
    });
    document.querySelectorAll('.mafianum').forEach(el => {
      el.textContent = mafianum
    });
    document.querySelectorAll('.cnum').forEach(el => {
      el.textContent = cnum;
    });
      maxPlayer&&playersMafia.splice(playersMafia.indexOf(maxPlayer), 1);
    }
    else
      document.getElementById("nightResult").textContent = "لم يتم استبعاد أحد من اللعبة";
  } else {
    document.getElementById("nightResult").textContent = "لم يتم استبعاد أحد من اللعبة";

    
  }
  document.getElementById('showNightRes').style.display = 'none';

  document.getElementById("startMorn").style.display = 'block';

  if(mafianum == 0){
    originalPlayers.forEach(player => {
      if (mafiaRoles[player] !== 'مافيا'){
        localStorage.setItem(player, localStorage.getItem(player)*1 +70);
      }
    });
    showScreen("finalCitizen");
    return;
  }
  if(!mnum && !pnum && !cnum ){
    originalPlayers.forEach(player => {
      if (mafiaRoles[player] === 'مافيا'){
        localStorage.setItem(player, localStorage.getItem(player)*1 +70);
      }
    });
    showScreen("finalMafia");
    return;
  }
});
document.getElementById('showMorningRes').addEventListener('click', ()=>{
  let max = 0;
  let maxPlayer = "";
  let equality = 0;
  for (const player in NightVotes) {
    if (NightVotes[player] > max) {
      max = NightVotes[player];
      maxPlayer = player;
    }
    else if (NightVotes[player] == max) {
      equality = NightVotes[player];
    }
  }
  
  console.log(maxPlayer);
  console.log(max + " : mafia number = " + Math.floor(playersMafia.length/4));
  if(equality == max ){
    document.getElementById("morningResult").textContent = "لم يتم استبعاد أحد من اللعبة بسبب تساوي الأصوات";

  }
   else if (max > 1) {
      document.getElementById("morningResult").textContent = `تم استبعاد ${maxPlayer} من اللعبة`;
      if(mafiaRoles[maxPlayer] === "مافيا"){
        mafianum--;
    }
      else if(mafiaRoles[maxPlayer] === "مواطن"){
        cnum--;
    }
      else if(mafiaRoles[maxPlayer] === "طبيب"){
        mnum--;
    }
      else if(mafiaRoles[maxPlayer] === "محقق"){
        pnum--;
    }
    
    document.querySelectorAll('.pnum').forEach(el => {
      el.textContent = pnum;
    });
    document.querySelectorAll('.mnum').forEach(el => {
      el.textContent = mnum;
    });
    document.querySelectorAll('.mafianum').forEach(el => {
      el.textContent = mafianum
    });
    document.querySelectorAll('.cnum').forEach(el => {
      el.textContent = cnum;
    });
      maxPlayer&&playersMafia.splice(playersMafia.indexOf(maxPlayer), 1);
  }
    else {
    document.getElementById("morningResult").textContent = "لم يتم استبعاد أحد من اللعبة";

    
  }
  document.getElementById('showMorningRes').style.display = 'none';
  document.getElementById("startNight").style.display = 'block';

  if(mafianum == 0){
    originalPlayers.forEach(player => {
      if (mafiaRoles[player] !== 'مافيا'){
        localStorage.setItem(player, localStorage.getItem(player)*1 +70);
      }
    });
    showScreen("finalCitizen");
    
    return;
  }
  if(!mnum && !pnum && !cnum ){
    originalPlayers.forEach(player => {
      if (mafiaRoles[player] === 'مافيا'){
        localStorage.setItem(player, localStorage.getItem(player)*1 +70);
      }
    });
    showScreen("finalMafia");
    
    return;
  }
});

function loadStoredResultsMafia() {
  console.log("press");
  // 1. نجمع النقاط المخزنة لكل لاعب في مصفوفة
  const storedResults = originalPlayers.map(p => ({
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
