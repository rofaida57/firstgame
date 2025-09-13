document.addEventListener('DOMContentLoaded', () => {
    // ربط الأحداث
    document.getElementById('check-order-btn').addEventListener('click', checkUserOrder);
    document.getElementById('modal-primary-btn').addEventListener('click', handleModalAction);
    document.getElementById('modal-secondary-btn').addEventListener('click', () => {
        hideModal();
        startNewRound();
    });
});

// --- إعدادات اللعبة ---
const gameConfig = {
    levels: {
        easy: { cups: 3, memorizeTime: 4000, name: 'سهل' },
        medium: { cups: 5, memorizeTime: 6000, name: 'متوسط' },
        hard: { cups: 7, memorizeTime: 8000, name: 'صعب' }
    },
    colors: [
        "#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE",
        "#448AFF", "#40C4FF", "#18FFFF", "#64FFDA", "#69F0AE"
    ],
    state: {
        currentLevel: null,
        originalOrder: [],
        score: 0,
        roundsWon: 0,
        isInteractable: false
    }
};

// --- دوال التحكم الرئيسية ---
function startGame(levelKey) {
    const level = gameConfig.levels[levelKey];
    gameConfig.state.currentLevel = levelKey;
    gameConfig.state.score = 0;
    gameConfig.state.roundsWon = 0;

    updateUI();
    switchScreen('game-play');
    updateInstruction(`تذكر ترتيب الأكواب في المستوى ${level.name}!`);
    
    generateCups(level.cups);

    setTimeout(() => {
        updateInstruction("انتبه! الأكواب تختلط الآن...");
        animateMixing();
    }, level.memorizeTime);
}

function generateCups(count) {
    const container = document.getElementById("cups-container");
    container.innerHTML = '';
    gameConfig.state.originalOrder = [];

    const shuffledColors = [...gameConfig.colors].sort(() => Math.random() - 0.5);
    const selectedColors = shuffledColors.slice(0, count);

    selectedColors.forEach(color => {
        const cupElement = document.createElement("div");
        cupElement.className = "cup";
        cupElement.dataset.color = color;
        cupElement.draggable = true;
        cupElement.style.color = color; // لاستخدامه في التوهج

        const cupTop = document.createElement('div'); cupTop.className = 'cup-top';
        const cupBody = document.createElement('div'); cupBody.className = 'cup-body'; cupBody.style.backgroundColor = color;
        const cupBase = document.createElement('div'); cupBase.className = 'cup-base';

        cupElement.appendChild(cupTop);
        cupElement.appendChild(cupBody);
        cupElement.appendChild(cupBase);

        gameConfig.state.originalOrder.push(color);
        container.appendChild(cupElement);
    });
}

function animateMixing() {
    const cups = Array.from(document.querySelectorAll(".cup"));
    const container = document.getElementById("cups-container");
    container.classList.add('animate-mix'); // يمكن إضافة كلاس للتحكم في الحركة
    
    let mixCount = 0;
    const totalMixes = 20;

    const mixInterval = setInterval(() => {
        if (mixCount < totalMixes) {
            const i1 = Math.floor(Math.random() * cups.length);
            let i2 = Math.floor(Math.random() * cups.length);
            while(i2 === i1) i2 = Math.floor(Math.random() * cups.length);
            
            swapCups(cups[i1], cups[i2]);
            mixCount++;
        } else {
            clearInterval(mixInterval);
            container.classList.remove('animate-mix');
            enableUserInteraction();
            updateInstruction("أعد ترتيب الأكواب كما كانت!");
            document.getElementById('check-order-btn').classList.remove('hidden');
        }
    }, 150);
}

function enableUserInteraction() {
    gameConfig.state.isInteractable = true;
    const cups = document.querySelectorAll(".cup");
    cups.forEach(cup => {
        // إضافة مستمعي الأحداث
        cup.addEventListener('dragstart', handleDragStart);
        cup.addEventListener('dragover', handleDragOver);
        cup.addEventListener('drop', handleDrop);
        cup.addEventListener('dragend', handleDragEnd);

        cup.addEventListener('touchstart', handleTouchStart, { passive: false });
        cup.addEventListener('touchmove', handleTouchMove, { passive: false });
        cup.addEventListener('touchend', handleTouchEnd);
    });
}

function disableUserInteraction() {
    gameConfig.state.isInteractable = false;
    document.getElementById('check-order-btn').classList.add('hidden');
}

// --- معالجات أحداث السحب واللمس ---
let draggedCup = null;

function handleDragStart(e) {
    if (!gameConfig.state.isInteractable) return;
    draggedCup = e.target.closest('.cup');
    e.dataTransfer.effectAllowed = 'move';
    draggedCup.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    e.preventDefault();
    const targetCup = e.target.closest('.cup');
    if (draggedCup && targetCup && draggedCup !== targetCup) {
        swapCups(draggedCup, targetCup);
    }
    return false;
}

function handleDragEnd(e) {
    if(draggedCup) {
        draggedCup.classList.remove('dragging');
    }
    draggedCup = null;
}

let touchItem = null;

function handleTouchStart(e) {
    if (!gameConfig.state.isInteractable) return;
    touchItem = e.target.closest('.cup');
    if (touchItem) {
        touchItem.classList.add('dragging');
    }
}

function handleTouchMove(e) {
    if (!touchItem) return;
    e.preventDefault();
    const touch = e.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetCup = elementBelow?.closest('.cup');
    if (targetCup && targetCup !== touchItem) {
        // تلميح بسيط
        targetCup.style.transform = 'scale(1.1)';
    }
}

function handleTouchEnd(e) {
    if (!touchItem) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetCup = elementBelow?.closest('.cup');

    // إعادة كل الأكواب لحجمها الطبيعي
    document.querySelectorAll('.cup').forEach(c => c.style.transform = '');

    if (targetCup && targetCup !== touchItem) {
        swapCups(touchItem, targetCup);
    }
    
    if(touchItem) {
        touchItem.classList.remove('dragging');
    }
    touchItem = null;
}

function swapCups(cup1, cup2) {
    if (cup1 === cup2) return;
    
    const tempColor = cup1.dataset.color;
    cup1.dataset.color = cup2.dataset.color;
    cup2.dataset.color = tempColor;

    const cup1Body = cup1.querySelector('.cup-body');
    const cup2Body = cup2.querySelector('.cup-body');
    
    cup1Body.style.backgroundColor = cup1.dataset.color;
    cup1.style.color = cup1.dataset.color;
    cup2Body.style.backgroundColor = cup2.dataset.color;
    cup2.style.color = cup2.dataset.color;
}

// --- التحقق من النتيجة ---
function checkUserOrder() {
    disableUserInteraction();
    const userOrder = Array.from(document.querySelectorAll(".cup")).map(cup => cup.dataset.color);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(gameConfig.state.originalOrder);

    if (isCorrect) {
        gameConfig.state.roundsWon++;
        gameConfig.state.score += 10 * (gameConfig.levels[gameConfig.state.currentLevel].cups);
        updateUI();
        
        document.getElementById('cups-container').classList.add('animate-success');
        showModal('success', `أحسنت! لقد نجحت في هذه الجولة. 🎉`, () => {
            document.getElementById('cups-container').classList.remove('animate-success');
            if (gameConfig.state.roundsWon >= 3) {
                levelComplete();
            } else {
                startNewRound();
            }
        });
    } else {
        document.getElementById('cups-container').classList.add('animate-error');
        showModal('error', `الترتيب خاطئ! حاول مرة أخرى. 😞`, () => {
            document.getElementById('cups-container').classList.remove('animate-error');
            startNewRound();
        }, true); // true تعني إظهار زر "إعادة المحاولة"
    }
}

function levelComplete() {
    const levelsKeys = Object.keys(gameConfig.levels);
    const nextLevelIndex = levelsKeys.indexOf(gameConfig.state.currentLevel) + 1;
    
    if (nextLevelIndex < levelsKeys.length) {
        showModal('success', `ممتاز! لقد أكملت المستوى ${gameConfig.levels[gameConfig.state.currentLevel].name} بنجاح. هل تريد الانتقال للمستوى التالي؟`, () => {
            startGame(levelsKeys[nextLevelIndex]);
        });
    } else {
        showModal('success', `مبروك! لقد أنهيت جميع المستويات بـ ${gameConfig.state.score} نقطة! أنت بطل. 🏆`, () => {
            resetGame();
        });
    }
}

function startNewRound() {
    updateInstruction("تذكر الأكواب للجولة القادمة!");
    generateCups(gameConfig.levels[gameConfig.state.currentLevel].cups);
    setTimeout(() => {
        updateInstruction("الأكواب تختلط مرة أخرى...");
        animateMixing();
    }, gameConfig.levels[gameConfig.state.currentLevel].memorizeTime);
}

function resetGame() {
    switchScreen('level-selection');
    gameConfig.state.currentLevel = null;
    gameConfig.state.score = 0;
    gameConfig.state.roundsWon = 0;
    updateUI();
}

// --- دوال الواجهة والمساعدة ---
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function updateUI() {
    document.getElementById('current-level').textContent = gameConfig.state.currentLevel ? gameConfig.levels[gameConfig.state.currentLevel].name : '-';
    document.getElementById('score').textContent = gameConfig.state.score;
}

function updateInstruction(text) {
    const instructionEl = document.getElementById("instruction");
    instructionEl.style.opacity = '0';
    setTimeout(() => {
        instructionEl.textContent = text;
        instructionEl.style.opacity = '1';
    }, 300);
}

function showModal(type, message, onPrimaryBtnClick, showSecondary = false) {
    const modal = document.getElementById('modal');
    const icon = document.getElementById('modal-icon');
    const msg = document.getElementById('modal-message');
    const primaryBtn = document.getElementById('modal-primary-btn');
    const secondaryBtn = document.getElementById('modal-secondary-btn');

    icon.innerHTML = type === 'success' ? '<i class="fas fa-check-circle" style="color: var(--success-color);"></i>' : '<i class="fas fa-times-circle" style="color: var(--error-color);"></i>';
    msg.textContent = message;
    
    primaryBtn.onclick = () => {
        hideModal();
        if (onPrimaryBtnClick) onPrimaryBtnClick();
    };

    if (showSecondary) {
        secondaryBtn.classList.remove('hidden');
    } else {
        secondaryBtn.classList.add('hidden');
    }
    
    modal.classList.add('show');
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
}

function handleModalAction() {
    // هذه الدالة مرتبطة بزر "موافق" الأساسي
    // المنطق الفعلي يتم تمريره عبر showModal
}