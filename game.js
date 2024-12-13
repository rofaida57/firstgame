let levels = {
  easy: 3,
  medium: 5,
  hard: 7
};

let colors = [
  "#FF5733",  // Red-Orange
  "#00ffcc",  // Light Green
  "#ff00ff",  // Dark Red
  "#C70039",  // Strong Red
  "#FFFCF9",  // Off White
  "#0066ff",  // Purple
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

  // إخفاء قسم اختيار المستوى
  document.getElementById("level-selection").classList.add("hidden");

  // إعادة تعيين العدادات
  winCount = 0;
  currentRound = 1;

  // إظهار لوحة اللعبة
  document.getElementById("game-board").classList.remove("hidden");

  // مباشرة توليد الأكواب دون الحاجة لاختيار الخوارزمية
  generateCups(levels[selectedLevel]); 

  // عرض التعليمات وتمديد مدة تذكر الأكواب
  document.getElementById("instruction").textContent = "تذكر أماكن الكؤوس!";
  setTimeout(() => {
    document.getElementById("instruction").textContent = "الكؤوس تختلط!";
    startMixing();
  }, 5000); // تمديد الوقت إلى 5 ثوانٍ
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

  // خوارزمية Fisher-Yates Shuffle لخلط الألوان
  let shuffledColors = [...originalOrder];
  for (let i = shuffledColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledColors[i], shuffledColors[j]] = [shuffledColors[j], shuffledColors[i]];
  }

  let i = 0;
  const mixingInterval = setInterval(() => {
    if (i < cups.length) {
      // تبديل الألوان بين الكؤوس بشكل متكرر
      const randomIndex = Math.floor(Math.random() * cups.length);
      swapColors(cups, i, randomIndex);
      i++;
    } else {
      clearInterval(mixingInterval); // إيقاف الخلط

      // تطبيق الألوان العشوائية الجديدة
      cups.forEach((cup, index) => {
        cup.style.backgroundColor = shuffledColors[index];
        cup.dataset.color = shuffledColors[index];
        cup.style.transform = "none"; // إعادة ضبط التحولات
      });

      enableUserInput(); // تفعيل الإدخال للمستخدم
      document.getElementById("instruction").textContent = "قم بترتيب الكؤوس!";
    }
  }, 300); // تأخير لكل تبديل لزيادة التأثير
}

function swapColors(cups, index1, index2) {
  if (index1 !== index2) {
    // تبديل الألوان بين الكأسين
    const tempColor = cups[index1].dataset.color;
    cups[index1].dataset.color = cups[index2].dataset.color;
    cups[index2].dataset.color = tempColor;

    // تحديث المظهر الخارجي
    cups[index1].style.backgroundColor = cups[index1].dataset.color;
    cups[index2].style.backgroundColor = cups[index2].dataset.color;

    // إضافة حركة عشوائية صغيرة لجعل التبديل مرئيًا
    cups[index1].style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
    cups[index2].style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
  }
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
  draggedCup.classList.add("dragging");
}

function handleTouchMove(e) {
  const touch = e.touches[0];
  const offsetX = touch.clientX - touchStartX;
  const offsetY = touch.clientY - touchStartY;

  draggedCup.style.position = "absolute";
  draggedCup.style.left = `${touch.clientX}px`;
  draggedCup.style.top = `${touch.clientY}px`;
}


function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  const targetCup = document.elementFromPoint(touch.clientX, touch.clientY);

  if (targetCup && targetCup.classList.contains("cup")) {
    swapCups(targetCup);
  } else {
    console.warn("لم يتم العثور على كأس في هذه النقطة.");
  }

  // إعادة الكأس إلى موقعه الافتراضي
  if (draggedCup) {
    draggedCup.style.transform = "none";
  }
}
function handleTouchEnd(e) {
  if (draggedCup) {
    draggedCup.classList.remove("dragging");
  }
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

  






 


  






 



