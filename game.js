const levels = {
  easy: 3,
  medium: 5,
  hard: 7
};

const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan", "lime", "brown"];
let selectedLevel = null;
let originalOrder = [];
let shuffledOrder = [];
let winCount = 0;
let currentRound = 1;
let selectedSortAlgorithm = null;

// بدء اللعبة مع تحديد المستوى والخوارزمية
function startGame(level) {
  selectedLevel = level;
  winCount = 0;
  currentRound = 1;
  document.getElementById("level-selection").classList.add("hidden");
  document.getElementById("game-board").classList.remove("hidden");
  document.getElementById("instruction").textContent = "تذكر أماكن الكؤوس!";
  generateCups(levels[level]);
  setTimeout(() => {
    document.getElementById("instruction").textContent = "الكؤوس تختلط!";
    startMixing();
  }, 5000);
}

// إنشاء الكؤوس
function generateCups(count) {
  const container = document.getElementById("cups-container");
  container.innerHTML = "";
  originalOrder = [];
  let availableColors = [...colors];

  // إنشاء الأكواب
  for (let i = 0; i < count; i++) {
    let randomIndex = Math.floor(Math.random() * availableColors.length);
    let selectedColor = availableColors.splice(randomIndex, 1)[0];
    let cup = document.createElement("div");
    cup.classList.add("cup");
    cup.style.backgroundColor = selectedColor;
    cup.dataset.color = selectedColor;
    originalOrder.push(selectedColor);
    container.appendChild(cup);
  }
  
  // تطبيق الخوارزمية المختارة للفرز
  if (selectedSortAlgorithm) {
    if (selectedSortAlgorithm === "bubbleSort") {
      originalOrder = bubbleSort(originalOrder);
    } else if (selectedSortAlgorithm === "insertionSort") {
      originalOrder = insertionSort(originalOrder);
    } else if (selectedSortAlgorithm === "quickSort") {
      originalOrder = quickSort(originalOrder);
    }
  }
}

// خوارزمية Bubble Sort
function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// خوارزمية Insertion Sort
function insertionSort(arr) {
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

// خوارزمية Quick Sort
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  let pivot = arr[arr.length - 1];
  let left = [];
  let right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

// البدء في الخلط
function startMixing() {
  const cups = Array.from(document.querySelectorAll(".cup"));
  let cupColors = cups.map(cup => cup.dataset.color);

  let mixingInterval = setInterval(() => {
    // خلط الأكواب باستخدام عملية عشوائية
    let i = Math.floor(Math.random() * cupColors.length);
    let j = Math.floor(Math.random() * cupColors.length);
    [cupColors[i], cupColors[j]] = [cupColors[j], cupColors[i]];
    displayShuffledCups(cups, cupColors);
  }, 500);

  setTimeout(() => {
    clearInterval(mixingInterval);
    shuffledOrder = [...cupColors];
    enableUserInput();
    document.getElementById("instruction").textContent = "قم بترتيب الكؤوس!";
  }, 3000); // وقت الخلط 3 ثوانٍ
}

// عرض الأكواب المخلوطة
function displayShuffledCups(cups, shuffledColors) {
  cups.forEach((cup, index) => {
    cup.style.backgroundColor = shuffledColors[index];
    cup.dataset.color = shuffledColors[index];
  });
}

// تمكين تفاعل المستخدم مع الأكواب
function enableUserInput() {
  const cups = Array.from(document.querySelectorAll(".cup"));
  const container = document.getElementById("cups-container");

  cups.forEach(cup => {
    cup.draggable = true;
    cup.addEventListener("dragstart", handleDragStart);
    cup.addEventListener("dragover", handleDragOver);
    cup.addEventListener("drop", handleDrop);
  });

  const button = document.createElement("button");
  button.textContent = "تحقق من الترتيب";
  button.onclick = checkUserOrder;
  container.appendChild(button);
}

let draggedCup = null;

// التعامل مع بدء سحب الكأس
function handleDragStart(e) {
  draggedCup = e.target;
}

// السماح بالسحب فوق الكأس
function handleDragOver(e) {
  e.preventDefault();
}

// التعامل مع إسقاط الكأس
function handleDrop(e) {
  e.preventDefault();
  const targetCup = e.target;

  if (targetCup.classList.contains("cup")) {
    const draggedColor = draggedCup.dataset.color;
    const targetColor = targetCup.dataset.color;

    draggedCup.dataset.color = targetColor;
    targetCup.dataset.color = draggedColor;

    draggedCup.style.backgroundColor = targetColor;
    targetCup.style.backgroundColor = draggedColor;
  }
}

// التحقق من ترتيب الكؤوس
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
      startNewRound(); // استئناف الجولة بنفس المستوى
    }
  } else {
    alert("خطأ! حاول مرة أخرى.");
    startNewRound(); // استئناف الجولة بنفس المستوى
  }
}

// بدء جولة جديدة
function startNewRound() {
  document.getElementById("instruction").textContent = "تذكر أماكن الكؤوس!";
  generateCups(levels[selectedLevel]); // إعادة إنشاء الكؤوس
  setTimeout(() => {
    document.getElementById("instruction").textContent = "الكؤوس تختلط!";
    startMixing(); // خلط الكؤوس مجددًا
  }, 2000); // مهلة للتذكر قبل الخلط
}

// إعادة تعيين اللعبة
function resetGame() {
  document.getElementById("game-board").classList.add("hidden");
  document.getElementById("level-selection").classList.remove("hidden");
}


  
    
  
  