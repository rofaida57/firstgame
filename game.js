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
    
    // إظهار اللعبة فقط
    document.getElementById("game-board").classList.remove("hidden");
  
    generateCups(levels[level]);
  
    // تأخير 10 ثوانٍ لظهور رسالة "تذكر أماكن الكؤوس!"
    document.getElementById("instruction").textContent = "تذكر أماكن الكؤوس!";
    setTimeout(() => {
      document.getElementById("instruction").textContent = "الكؤوس تختلط!";
      startMixing();
    }, 9000);
  }
  function setAlgorithm(algorithm) {
    selectedAlgorithm = algorithm; // تخزين الخوارزمية المختارة
    document.getElementById("algorithm-selection").classList.add("hidden"); // إخفاء قسم اختيار الخوارزمية
    document.getElementById("game-board").classList.remove("hidden"); // عرض لوحة اللعبة
    generateCups(levels[selectedLevel]); // توليد الأكواب بناءً على المستوى المختار
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
    draggedCup.style.position = "absolute";
    draggedCup.style.left = `${touch.clientX - 25}px`;
    draggedCup.style.top = `${touch.clientY - 25}px`;
  }
  
  function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const targetCup = document.elementFromPoint(touch.clientX, touch.clientY);
  
    if (targetCup && targetCup.classList.contains("cup")) {
      swapCups(targetCup);
    }
  
    // إعادة ضبط موقع الكأس
    draggedCup.style.position = "static";
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
    generateCups(levels[selectedLevel]);
    setTimeout(() => {
      document.getElementById("instruction").textContent = "الكؤوس تختلط!";
      startMixing();
    }, 6000);
  }
  
  function resetGame() {
    document.getElementById("game-board").classList.add("hidden");
    document.getElementById("level-selection").classList.remove("hidden");
    document.getElementById("algorithm-selection").classList.remove("hidden");
  }
  






 


