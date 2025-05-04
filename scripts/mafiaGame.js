
let mafiaCurrentPlayerIndex = 0;
let mafiaQuestionPairs = [];
let mafiaCurrentQuestionIndex = 0;
let mafiaVotes = {};
let mafiaScores = {};
let mafiaRoles = [];
function startMafiaGame() {
    // reset state
    mafiaCurrentPlayerIndex = 0;
    mafiaQuestionPairs = [];
    mafiaCurrentQuestionIndex = 0;
    mafiaVotes = {};
    mafiaScores = {};
  
    // how many mafia members: one for every 4 players (rounded down)
    const mafiaCount = Math.floor(players.length / 4);
  
    // make a shuffled copy of players
    const shuffled = [...players].sort(() => Math.random() - 0.5);
  
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
  
    console.log('Assigned Mafia roles:', mafiaRoles);
  
    // now you can proceed to the privacy/role-reveal flow...
    showMafiaRoleRevealScreen();
  }
function showMafiaRoleRevealScreen() {
  console.log("outside_______________", mafiaRoles)
  document.getElementById('mafiaPlayerConfirmButton').textContent = `أنا ${players[mafiaCurrentPlayerIndex]}`;
  document.getElementById('playernameMafia').textContent = `${players[mafiaCurrentPlayerIndex]}`;
  showScreen('mafiaWarningScreen');
}

function showRole() {
    const player = players[mafiaCurrentPlayerIndex];
  console.log(player)
  console.log(mafiaRoles[player])
  const content = document.getElementById('roleContent');
  document.querySelector('#roleScreen .player-name').textContent = player;

    content.innerHTML = '';
  const revealBtn = document.createElement('button');
  revealBtn.id = 'revealButton';
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
    const content = document.getElementById('roleContent');
    if(role === 'مواطن'){
        content.innerHTML = `
        <h3 class="secret-word">أنت  ${role}</h3>
        <p class="secret-instruction">مهمتك الدفاع عن نفسك وباقي المواطنين عن طريق التصويت على أعضاء المافيا. احذر من الخطأ في التصويت</p>
      `; 
    }
    else if(role === 'مافيا'){
        content.innerHTML = `
        <h3 class="secret-word">أنت  ${role}</h3>
        <p class="secret-instruction">مهمتك محاولة قتل الجميع بدون ان يكتشفك احد. احذر من الطبيب والمحقق وحاول إخراجهم مبكرا لتنجح في المهمة</p>
      `; 
    }
    else if(role === 'طبيب'){
        content.innerHTML = `
        <h3 class="secret-word">أنت  ${role}</h3>
        <p class="secret-instruction">مهمتك حماية اللاعب الذي تشعر بأنه مستهدف من المافيا. تسطبيع حماية نفسك أيضا في حال اعتقدت أنك أنت الهدف.</p>
      `; 
    }
    else if(role === 'محقق'){
        content.innerHTML = `
        <h3 class="secret-word">أنت  ${role}</h3>
        <p class="secret-instruction">مهمتك محاولة التعرف على المافيا. واخبار باقي اللاعبين بدون كشف هويتك</p>
      `; 
    }
    
    document.getElementById('roleConfirmButton').style.display = 'block';
  }
  function nextMafiaPlayer() {
    mafiaCurrentPlayerIndex++;
    if (mafiaCurrentPlayerIndex < players.length) {
        showMafiaRoleRevealScreen();
    } else {
    //   startQuestionsRound();
    console.log("end")
    }
  }