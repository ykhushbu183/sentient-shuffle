document.addEventListener("DOMContentLoaded", () => {
  const TOTAL_IMAGES = 10;
  const PREVIEW_TIME_MS = 3000;
  const levelCards = [3, 5, 7];
  const levelAttempts = [1, 2, 3]; // different attempts per level

  // elements
  const menu = document.getElementById("menu");
  const startBtn = document.getElementById("start-btn");
  const overlay = document.getElementById("overlay");
  const countdownBox = document.getElementById("countdown");
  const countNum = document.getElementById("count-num");
  const previewBox = document.getElementById("preview");
  const previewImg = document.getElementById("preview-img");
  const game = document.getElementById("game");
  const cardsWrap = document.getElementById("cards");
  const attemptsDisplay = document.getElementById("attempts");
  const restartBtn = document.getElementById("restart-btn");
  const menuBtn = document.getElementById("menu-btn");
  const popup = document.getElementById("popup");
  const popupTitle = document.getElementById("popup-title");
  const popupDesc = document.getElementById("popup-desc");
  const popupImg = document.getElementById("popup-img");
  const popupNext = document.getElementById("popup-next");
  const popupClose = document.getElementById("popup-close");

  // ⬇️ Added: grab level display element (make sure HTML me id="level" ho)
  const levelDisplay = document.getElementById("level");

  // state
  let currentLevel = 0;
  let attemptsLeft = 0;
  let chosenSet = [];
  let targetImage = "";
  let shuffledPositions = [];
  let isWaiting = false;

  const imgPath = (i) => `images/img${i}.png`;
  const backPath = () => `images/logo.png`;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Start game
  function startGameAt(levelIndex) {
    currentLevel = levelIndex;
    attemptsLeft = levelAttempts[levelIndex];
    attemptsDisplay.textContent = `Attempts left: ${attemptsLeft}`;

    // ✅ Added: update level text each time level changes
    if (levelDisplay) {
      levelDisplay.textContent = `Level ${currentLevel + 1}`;
    }

    const count = levelCards[levelIndex];
    const indices = shuffle(Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1)).slice(0, count);
    chosenSet = indices.map(i => imgPath(i));
    targetImage = chosenSet[Math.floor(Math.random() * chosenSet.length)];

    // preview phase
    previewImg.src = targetImage;
    overlay.classList.remove("hidden");
    previewBox.classList.remove("hidden");
    countdownBox.classList.remove("hidden");

    let remaining = Math.ceil(PREVIEW_TIME_MS / 1000);
    countNum.textContent = remaining;
    const timer = setInterval(() => {
      remaining--;
      if (remaining > 0) countNum.textContent = remaining;
      else clearInterval(timer);
    }, 1000);

    setTimeout(() => {
      overlay.classList.add("fade-out");
      previewBox.classList.add("fade-out");
      setTimeout(() => {
        overlay.classList.add("hidden");
        previewBox.classList.add("hidden");
        overlay.classList.remove("fade-out");
        previewBox.classList.remove("fade-out");
        showShuffledCards();
        menu.classList.remove("active");
        game.classList.add("active");
      }, 300);
    }, PREVIEW_TIME_MS);
  }

  // card grid layout
  function showShuffledCards() {
    const count = levelCards[currentLevel];
    shuffledPositions = shuffle(chosenSet);
    cardsWrap.innerHTML = "";

    let rows = [];
    if (count === 3) rows = [2, 1];
    else if (count === 5) rows = [3, 2];
    else if (count === 7) rows = [4, 3];

    let index = 0;
    rows.forEach(rowCount => {
      const row = document.createElement("div");
      row.className = "card-row";
      row.style.display = "flex";
      row.style.justifyContent = "center";
      row.style.gap = "12px";
      for (let i = 0; i < rowCount && index < count; i++) {
        const card = document.createElement("div");
        card.className = "card";
        card.style.backgroundImage = `url('${backPath()}')`;
        card.style.backgroundSize = "cover";
        card.style.backgroundPosition = "center";
        card.dataset.index = index;
        card.dataset.image = shuffledPositions[index];
        card.addEventListener("click", onCardClick);
        row.appendChild(card);
        index++;
      }
      cardsWrap.appendChild(row);
    });

    restartBtn.classList.remove("hidden");
    menuBtn.classList.remove("hidden");
  }

  function onCardClick(e) {
    if (isWaiting) return;
    const card = e.currentTarget;
    const img = card.dataset.image;

    revealCard(card, img);

    if (img === targetImage) {
      isWaiting = true;
      setTimeout(() => showPopup(true), 400);
    } else {
      attemptsLeft--;
      attemptsDisplay.textContent = `Attempts left: ${attemptsLeft}`;
      card.style.transform = "scale(0.96)";
      setTimeout(() => (card.style.transform = ""), 200);
      if (attemptsLeft <= 0) {
        isWaiting = true;
        setTimeout(() => showPopup(false), 400);
      }
    }
  }

  function revealCard(cardEl, frontImage) {
    cardEl.classList.add("revealed");
    cardEl.style.backgroundImage = `url('${frontImage}')`;
    cardEl.style.backgroundSize = "cover";
    cardEl.style.backgroundPosition = "center";
  }

  function showPopup(isWin) {
    popup.classList.remove("hidden");
    if (isWin) {
      popupTitle.textContent = "🎉 Correct!";
      popupDesc.textContent = "You found the dog — next level!";
      popupImg.src = targetImage;
      popupNext.textContent = (currentLevel < levelCards.length - 1) ? "Next Level" : "Finish";
    } else {
      popupTitle.textContent = "😕 Oops!";
      popupDesc.textContent = "No attempts left. Restarting from Level 1.";
      popupImg.src = targetImage;
      popupNext.textContent = "Restart";
    }
  }

  popupNext.addEventListener("click", () => {
    popup.classList.add("hidden");
    isWaiting = false;
    if (attemptsLeft <= 0) {
      currentLevel = 0;
      startGameAt(0);
    } else if (currentLevel < levelCards.length - 1) {
      startGameAt(currentLevel + 1);
    } else {
      game.classList.remove("active");
      menu.classList.add("active");
      restartBtn.classList.add("hidden");
      menuBtn.classList.add("hidden");
    }
  });

  popupClose.addEventListener("click", () => {
    popup.classList.add("hidden");
    isWaiting = false;
  });

  startBtn.addEventListener("click", () => {
    startGameAt(0);
  });

  restartBtn.addEventListener("click", () => {
    currentLevel = 0;
    startGameAt(0);
  });

  menuBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    game.classList.remove("active");
    menu.classList.add("active");
    restartBtn.classList.add("hidden");
    menuBtn.classList.add("hidden");
  });
});
