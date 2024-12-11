let levels = {
  easy: 3,
  medium: 5,
  hard: 7
};

let colors = [
  "#FF5733",  // Red-Orange
  "#DAF7A6",  // Light Green
  "#900C3F",  // Dark Red
  "#C70039",  // Strong Red
  "#FFFCF9",  // Off White
  "#581845",  // Purple
  "#1D3557"   // Dark Blue
];

let selectedLevel = null;
let originalOrder = [];
let shuffledOrder = [];
let winCount = 0;
let currentRound = 1;
let draggedCup = null; // للكأس المسحوب

function startGame(level) {
  selectedLevel = level;

  // إخفاء أقسام الاختيار
  document.getElementById("level-selection").classList.add("hidden");
  document.getElementById("algorithm-selection").classList.remove("hidden");

  // إعادة تعيين العدادات
  winCount = 0;
  currentRound = 1;

  // إظهار اللعبة فقط
  document.getElementById("game-board").classList.remove("hidden");
}

function setAlgorithm(algorithm) {
  selectedAlgorithm = algorithm; // تخزين الخوارزمية المختارة
  document.getElementById("algorithm-selection").classList.add("hidden"); // إخفاء قسم اختيار الخوارزمية
  generateCups(levels[selectedLevel]); // توليد الأكواب بناءً على المستوى المختار

  // عرض رسالة التعليمات
  document.getElementById("instruction").textContent = "تذكر أماكن الكؤوس!";
  setTimeout(() => {
    document.getElementById("instruction").textContent = "الكؤوس تختلط!";
    startMixing();
  }, 3000);
}

function generateCups(count) {
  const container = document.getElementById("cups-container");
  container.innerHTML = "";
  originalOrder = [];

  // تحقق من أن عدد الأكواب لا يتجاوز عدد الألوان المتاحة
  if (count > colors.length) {
    console.error("عدد الأكواب المطلوب أكبر من عدد الألوان المتاحة!");
    return;
  }

  // خلط قائمة الألوان واختيار ألوان فريدة
  let shuffledColors = [...colors].sort(() => Math.random() - 0.5);
  let selectedColors = shuffledColors.slice(0, count);

  // إنشاء الأكواب بألوان فريدة
  selectedColors.forEach(color => {
    let cup = document.createElement("div");
    cup.classList.add("cup");
    cup.style.backgroundColor = color;
    cup.dataset.color = color; // حفظ اللون في الخاصية data-color
    originalOrder.push(color);
    container.appendChild(cup);
  });
}

function startMixing() {
  const cups = Array.from(document.querySelectorAll(".cup"));
  let cupColors = cups.map(cup => cup.dataset.color);

  // خلط الألوان عشوائيًا بعد مرور 3 ثوانٍ
  shuffledOrder = [...cupColors].sort(() => Math.random() - 0.5);
  let i = 0;
  const mixingInterval = setInterval(() => {
    if (i < shuffledOrder.length) {
      swapColors(cups, i, (i + 1) % shuffledOrder.length); // تبديل المواقع بين الكؤوس
      i++;
    } else {
      clearInterval(mixingInterval);  // إيقاف التكرار عند الانتهاء من الخلط
      shuffledOrder = cups.map(cup => cup.dataset.color);  // حفظ الترتيب الجديد
      enableUserInput();  // تفعيل الإدخال للمستخدم بعد الخلط
      document.getElementById("instruction").textContent = "قم بترتيب الكؤوس!";
    }
  }, 300); // زيادة السرعة هنا لجعل العملية أكثر سلاسة
}

function swapColors(cups, index1, index2) {
  const tempColor = cups[index1].dataset.color;

  // تبادل الألوان بين الكؤوس
  cups[index1].dataset.color = cups[index2].dataset.color;
  cups[index2].dataset.color = tempColor;

  // تحديث المظهر الخارجي
  cups[index1].style.backgroundColor = cups[index1].dataset.color;
  cups[index2].style.backgroundColor = cups[index2].dataset.color;

  // لتحريك الكؤوس بشكل مرن أثناء الخلط
  cups[index1].style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
  cups[index2].style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
}


function displayShuffledCups(cups, shuffledColors) {
  cups.forEach((cup, index) => {
    // تحديث اللون الخارجي فقط
    cup.style.backgroundColor = shuffledColors[index];
    cup.dataset.color = shuffledColors[index]; // تأكد من أن البيانات محدثة
  });
  console.log("Current Colors After Shuffle:", shuffledColors);
}

function enableUserInput() {
  const cups = Array.from(document.querySelectorAll(".cup"));
  const container = document.getElementById("cups-container");

  cups.forEach(cup => {
    cup.draggable = true;

    // أحداث السحب والإفلات للماوس
    cup.addEventListener("dragstart", handleDragStart);
    cup.addEventListener("dragover", handleDragOver);
    cup.addEventListener("drop", handleDrop);

    // أحداث السحب والإفلات للمس
    cup.addEventListener("touchstart", handleTouchStart);
    cup.addEventListener("touchmove", handleTouchMove);
    cup.addEventListener("touchend", handleTouchEnd);
  });

  // زر التحقق
  const button = document.createElement("button");
  button.textContent = "تحقق من الترتيب";
  button.onclick = checkUserOrder;
  container.appendChild(button);
}

function handleDragStart(e) {
  draggedCup = e.target;
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  swapCups(e.target);
}

// للمس
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  draggedCup = e.target;
}

function handleTouchMove(e) {
  const touch = e.touches[0];
  const offsetX = touch.clientX - touchStartX;
  const offsetY = touch.clientY - touchStartY;
  
  draggedCup.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  const targetCup = document.elementFromPoint(touch.clientX, touch.clientY);

  if (targetCup && targetCup.classList.contains("cup")) {
    swapCups(targetCup);
  }

  // إعادة موقع الكأس إلى الوضع الطبيعي بعد السحب
  draggedCup.style.transform = "none";
}

function swapCups(targetCup) {
  if (targetCup && targetCup.classList.contains("cup")) {
    const draggedColor = draggedCup.dataset.color;
    const targetColor = targetCup.dataset.color;

    // تبديل الألوان بين الكؤوس
    draggedCup.dataset.color = targetColor;
    targetCup.dataset.color = draggedColor;

    // تحديث المظهر الخارجي
    draggedCup.style.backgroundColor = targetColor;
    targetCup.style.backgroundColor = draggedColor;
  }
}

function checkUserOrder() {
  const cups = Array.from(document.querySelectorAll(".cup"));
  const userOrder = cups.map(cup => cup.dataset.color);

  if (JSON.stringify(userOrder) === JSON.stringify(originalOrder)) {
    winCount++;
    alert(`أحسنت! ${winCount}/3 جولات ناجحة.`);

    if (winCount >= 3) {
      alert("أحسنت! انتقلت إلى المستوى التالي!");
      const levelsKeys = Object.keys(levels);
      const nextLevelIndex = levelsKeys.indexOf(selectedLevel) + 1;

      if (nextLevelIndex < levelsKeys.length) {
        startGame(levelsKeys[nextLevelIndex]); // ابدأ المستوى التالي
      } else {
        alert("مبروك! لقد أنهيت اللعبة!");
        resetGame();
      }
    } else {
      startNewRound();
    }
  } else {
    alert("خطأ! حاول مرة أخرى.");
    startNewRound();
  }
}

function startNewRound() {
  document.getElementById("instruction").textContent = "تذكر أماكن الكؤوس!";
  generateCups(levels[selectedLevel]); // إعادة إنشاء الأكواب بألوان عشوائية
  setTimeout(() => {
    document.getElementById("instruction").textContent = "الكؤوس تختلط!";
    startMixing(); // استدعاء الخلط
  }, 6000);
}

function resetGame() {
  document.getElementById("game-board").classList.add("hidden");
  document.getElementById("level-selection").classList.remove("hidden");
  document.getElementById("algorithm-selection").classList.add("hidden");
}

  






 


  






 



