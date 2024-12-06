let levels = {
  easy: 3,
  medium: 5,
  hard: 7
};

let colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan", "lime", "brown"];
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

  // التحقق إذا كان عدد الأكواب المطلوب أكبر من عدد الألوان المتاحة
  if (count > colors.length) {
    console.error("عدد الأكواب المطلوب أكبر من عدد الألوان المتاحة!");
    return;
  }

  // خلط قائمة الألوان مسبقًا واختيار أول `count` لون
  let shuffledColors = [...colors].sort(() => Math.random() - 0.5);
  let selectedColors = shuffledColors.slice(0, count);

  // إنشاء الأكواب بألوان فريدة
  selectedColors.forEach(color => {
    let cup = document.createElement("div");
    cup.classList.add("cup");
    cup.style.backgroundColor = color;
    cup.dataset.color = color;
    originalOrder.push(color);
    container.appendChild(cup);
  });
}



function startMixing() {
  const cups = Array.from(document.querySelectorAll(".cup"));

  // تحويل الألوان العشوائية إلى حروف لترتيبها
  let cupColors = cups.map(cup => cup.dataset.color);
  let sortedColors;

  switch (selectedAlgorithm) {
    case "bubbleSort":
      sortedColors = bubbleSort(cupColors);
      break;
    case "insertionSort":
      sortedColors = insertionSort(cupColors);
      break;
    case "quickSort":
      sortedColors = quickSort(cupColors);
      break;
    default:
      sortedColors = cupColors;
  }

  let i = 0;
  const mixingInterval = setInterval(() => {
    if (i < sortedColors.length - 1) {
      displayShuffledCups(cups, sortedColors.slice(0, i + 1).concat(cupColors.slice(i + 1)));
      i++;
    } else {
      clearInterval(mixingInterval);
      shuffledOrder = [...sortedColors];
      enableUserInput();
      document.getElementById("instruction").textContent = "قم بترتيب الكؤوس!";
    }
  }, 500);
}
function bubbleSort(array) {
  let arr = [...array];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

function insertionSort(array) {
  let arr = [...array];
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

function quickSort(array) {
  if (array.length <= 1) return array;
  const pivot = array[array.length - 1];
  const left = array.filter(el => el < pivot);
  const right = array.filter(el => el > pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}


function displayShuffledCups(cups, shuffledColors) {
  cups.forEach((cup, index) => {
    cup.style.backgroundColor = shuffledColors[index];
    cup.dataset.color = shuffledColors[index];
  });

  // التحقق أثناء العرض
  console.log("Colors While Mixing:", shuffledColors);
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

    draggedCup.dataset.color = targetColor;
    targetCup.dataset.color = draggedColor;

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
  






 


