document.addEventListener('DOMContentLoaded', () => {
  const playersWho = loadPlayers();
  const allQuestions = {
    general: [
      'من هو الأكثر وفاءً؟ 🐶', 'من هو الأكثر خجلًا؟ 🙈', 'من هو الأكثر تنظيمًا؟ 📅',
      'من هو الأكثر فوضى؟ 🤯', 'من هو الأكثر صراحة؟ 🗣️', 'من هو الأكثر كسلاً؟ 😴',
      'من هو الأكثر نشاطًا؟ ⚡', 'من هو الأكثر طيبة؟ 😇', 'من هو الأكثر تسويفًا؟ 😅',
      'من هو الأكثر التزامًا؟ ✅'
    ],
    guess: [
      'من تتوقع أن يصبح مليونيرًا أولًا؟ 💸', 'من تتوقع أن يتزوج آخر واحد؟ 💍',
      'من تتوقع أن يسافر كثيرًا؟ ✈️', 'من تتوقع أن يصبح مشهورًا؟ 🌟',
      'من تتوقع أن يفتح بيزنس خاص؟ 🏢', 'من تتوقع أن يغير مجاله المهني؟ 🔄',
      'من تتوقع أن يصبح ممثل؟ 🎬', 'من تتوقع أن يعيش بالخارج؟ 🌍',
      'من تتوقع أن يكتب كتاب؟ 📖', 'من تتوقع أن ينجح في برنامج مسابقات؟ 🎯'
    ],
    food: [
      'من يأكل أكثر؟ 🍔', 'من يحب الأكل الحار؟ 🌶️', 'من لا يحب الخضار؟ 🥦',
      'من يحب الحلويات أكثر؟ 🍰', 'من يجرب أكلات غريبة؟ 🐙', 'من لا يستطيع الطبخ؟ 🍳❌',
      'من يطبخ أحسن؟ 👩‍🍳', 'من يحب الشاي أكثر؟ 🍵', 'من لا يستطيع العيش بدون قهوة؟ ☕',
      'من يطلب دليفري كثيرًا؟ 🛵'
    ],
    movies: [
      'من يشاهد أفلام أكثر؟ 🎬', 'من يحب الأنمي؟ 🎌', 'من يعيد نفس الفيلم كثير؟ 🔁',
      'من يتابع كل جديد في السينما؟ 🧠', 'من لا يتحمل مشاهد الرعب؟ 😱',
      'من يحب الأفلام الرومانسية؟ 💕', 'من يتابع مسلسلات تركي؟ 🇹🇷',
      'من يحب الأكشن؟ 💥', 'من يكره النهايات الحزينة؟ 😢', 'من لا يركز في الفيلم؟ 😴'
    ],
    awkward: [
      'من وقع في مكان عام؟ 🤦‍♀️', 'من أرسل رسالة غلط؟ 📱💥', 'من تم إحراجه في اجتماع؟ 😳',
      'من كذب كذبة كبيرة؟ 🙊', 'من يتهرب من المكالمات؟ 📵', 'من قال "أحبك" بالغلط؟ 😬',
      'من فشل في موقف رومانسي؟ 💔', 'من حصل على بلوك؟ 🚫', 'من نسي اسم شخص مهم؟ 😅',
      'من بكّى في المدرسة؟ 😭'
    ]
  };

  let selectedQuestion = '';
  let selectedCategories = [];
  let currentVoterIndex = 0;
  let currentVotes      = {};

  // DOM refs
  const startBtn              = document.getElementById('startWhoBtn');
  const startSettingsBtn      = document.getElementById('startWhoSettingsBtn');
  const backBtn               = document.getElementById('backToGamesBtnWho');
  const questionEl            = document.getElementById('whoQuestion');
  const voteForm              = document.getElementById('voteForm');
  const submitVoteBtn         = document.getElementById('whoSubmitVote');
  const passText              = document.getElementById('whoPassText');
  const passNextBtn           = document.getElementById('whoPassNextBtn');
  const resultsList           = document.getElementById('whoResultsList');
  const nextQuestionBtn       = document.getElementById('whoNextQuestionBtn');
  const changeCategoriesBtn   = document.getElementById('whoChangeCategoriesBtn');

  backBtn.onclick = () => showScreen('gamesScreen');

  startBtn.onclick = () => {
    if (playersWho.length < 3) {
      showAlert('error', `لعبة مين فينا تتطلب 3 لاعبين على الأقل! حالياً: ${playersWho.length}`);
      return;
    }
    showScreen('whoSettingsScreen');
  };

  // إعداد التصنيفات
  startSettingsBtn.onclick = () => {
    const form = new FormData(document.getElementById('categoriesForm'));
    selectedCategories = form.getAll('category');
    const pool = selectedCategories.flatMap(cat => allQuestions[cat] || []);
    if (pool.length === 0) {
      showAlert('warning', 'اختر على الأقل تصنيف واحد!');
      return;
    }
    // نختار سؤال عشوائي
    selectedQuestion = pool[Math.floor(Math.random() * pool.length)];
    resetVoting();
    showPassScreen();
  };

  // إعادة تهيئة عملية التصويت
  function resetVoting() {
    currentVotes = {};
    currentVoterIndex = 0;
  }

  passNextBtn.onclick = () => showVoteScreenForPlayer();

  submitVoteBtn.onclick = e => {
    e.preventDefault();
    const sel = voteForm.querySelector('input[name="vote"]:checked');
    if (!sel) {
      showAlert('warning', 'اختر لاعبًا للتصويت!');
      return;
    }
    currentVotes[sel.value] = (currentVotes[sel.value] || 0) + 1;
    currentVoterIndex++;
    if (currentVoterIndex >= playersWho.length) {
      showResultsWho();
    } else {
      showPassScreen();
    }
  };

  function showPassScreen() {
    const currentPlayer = playersWho[currentVoterIndex];
    passText.textContent = `📱 أعطِ الهاتف إلى: ${currentPlayer}`;
    showScreen('whoPassScreen');
  }

  function showVoteScreenForPlayer() {
    const currentPlayer = playersWho[currentVoterIndex];
    questionEl.textContent = selectedQuestion;
    voteForm.innerHTML = playersWho
      .filter(p => p !== currentPlayer)
      .map(p => `<label><input type="radio" name="vote" value="${p}"> ${p}</label>`)
      .join('<br>');
    showScreen('whoVoteScreen');
  }

  function showResultsWho() {
    // ترجمة الأصوات إلى مصفوفة مفروزة
    const sorted = Object.entries(currentVotes)
      .sort((a,b) => b[1] - a[1]);
    const mostVoted = sorted.length
      ? `${sorted[0][0]} (${sorted[0][1]} صوت)`
      : 'لا أحد';
    const votesList = sorted
      .map(([name, count]) => `${name} (${count} صوت)`)
      .join('، ') || 'لا أصوات';

    resultsList.innerHTML = `
      <div class="result-block">
        <h3>${selectedQuestion}</h3>
        <p>📊 النتائج: ${votesList}</p>
        <p>🏆 الأكثر تصويتًا: <strong>${mostVoted}</strong></p>
      </div>
    `;
    showScreen('whoResultsScreen');
  }

  // ** الأزرار الجديدة في شاشة النتائج **
  nextQuestionBtn.onclick = () => {
    // نعيد اختيار سؤال جديد من نفس التصنيفات
    const pool = selectedCategories.flatMap(cat => allQuestions[cat] || []);
    selectedQuestion = pool[Math.floor(Math.random() * pool.length)];
    resetVoting();
    showPassScreen();
  };

  changeCategoriesBtn.onclick = () => {
    showScreen('whoSettingsScreen');
  };
});
