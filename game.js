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

function startGame(level) {
  selectedLevel = level;
  winCount = 0;
  currentRound = 1;
  document.getElementById("level-selection").classList.add("hidden");
  document.getElementById("game-board").classList.remove("hidden");
  generateCups(levels[level]);

  // تأخير 10 ثوانٍ بعد ظهور رسالة "تذكر أماكن الكؤوس!"
  document.getElementById("instruction").textContent = "تذكر أماكن الكؤوس!";
  setTimeout(() => {
    document.getElementById("instruction").textContent = "الكؤوس تختلط!";
    startMixing(); // ابدأ الخلط بعد 10 ثوانٍ
  }, 11000); // تأخير 10 ثوانٍ قبل بدء الخلط
}

function generateCups(count) {
  const container = document.getElementById("cups-container");
  container.innerHTML = "";
  originalOrder = [];
  let availableColors = [...colors];

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
}

function startMixing() {
  const cups = Array.from(document.querySelectorAll(".cup"));
  let cupColors = cups.map(cup => cup.dataset.color);

  let mixingInterval = setInterval(() => {
    // خلط بسيط باستخدام تبديل عشوائي
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

function displayShuffledCups(cups, shuffledColors) {
  cups.forEach((cup, index) => {
    cup.style.backgroundColor = shuffledColors[index];
    cup.dataset.color = shuffledColors[index];
  });
}

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

function handleDragStart(e) {
  draggedCup = e.target;
}

function handleDragOver(e) {
  e.preventDefault();
}

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

function startNewRound() {
  document.getElementById("instruction").textContent = "تذكر أماكن الكؤوس!";
  generateCups(levels[selectedLevel]); // إعادة إنشاء الكؤوس
  setTimeout(() => {
    document.getElementById("instruction").textContent = "الكؤوس تختلط!";
    startMixing(); // خلط الكؤوس مجددًا
  }, 10000); // مهلة للتذكر قبل الخلط
}

function resetGame() {
  document.getElementById("game-board").classList.add("hidden");
  document.getElementById("level-selection").classList.remove("hidden");
}
