document.getElementById('startJawwalBtn').addEventListener('click', () => {
    // اقرأ زمن التحدي
    const time = parseInt(document.getElementById('jawwalTimeSlider').value, 10);
    // اقرأ المجموعات المحددة
    const categories = ['food','places','animals']
      .filter(id => document.getElementById(`opt-${id}`).checked);
  
    if (!categories.length) {
      return alert('اختر مجموعة واحدة على الأقل من الكلمات.');
    }
  
    // احفظ الإعدادات مؤقتاً أو مررها للعبة
    sessionStorage.setItem('jawwalTime', time);
    sessionStorage.setItem('jawwalCats', JSON.stringify(categories));
  
    // انتقل لشاشة العدّ أو البداية الفعلية
    showScreen('jawwalCountdownScreen');
    // ثم ابدأ الأطوار كما فعلت سابقًا مع الألعاب الأخرى...
  });
  