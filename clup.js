document.getElementById('btn-info').addEventListener('click', function() {
    // إظهار قسم المعلومات باستخدام الكلاس
    document.getElementById('info-section').classList.add('visible');

    // تغيير نص الترحيب
    document.getElementById('welcome-text').innerText = 
    "شكرًا لاهتمامك! إليك بعض المعلومات حول النادي العلمي: " + 
    "نادي UREX ليس مجرد نادي متخصص في علوم الحاسوب، بل هو مصدر قوة للابتكار والتعاون والطموح. " + 
    "هنا، لا نتبع الاتجاهات فقط، بل نجسد أفكارًا جريئة باستخدام التكنولوجيا المتقدمة. " + 
    "حيث يقود الشغف عجلة التقدم. " + 
    "يُزدهر نادي UREX بفضل أقسامه الأربعة الأساسية: " + 
    "تكنولوجيا المعلومات (IT)، الاتصال (COMMUNICATION)، العلاقات الخارجية (EXTERNAL RELATIONS)، " + 
    "والموارد البشرية (HUMAN RESOURCES). " + 
    "معًا، ندفع الحدود، نبني الروابط، ونحوّل الرؤى إلى واقع.";
    
    // إخفاء الزر بعد النقر عليه
    this.style.display = 'none';
});


