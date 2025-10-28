document.addEventListener("DOMContentLoaded", () => {
  // config
  const TOTAL_IMAGES = 10; // expects images/img1.png ... img10.png
  const PREVIEW_TIME_MS = 5000; // 5 seconds preview
  const MAX_ATTEMPTS = 3;

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
  const levelDisplay = document.getElementById("level-display");
  const attemptsDisplay = document.getElementById("attempts");
  const restartBtn = document.getElementById("restart-btn");
  const menuBtn = document.getElementById("menu-btn");
  const popup = document.getElementById("popup");
  const popupTitle = document.getElementById("popup-title");
  const popupDesc = document.getElementById("popup-desc");
  const popupImg = document.getElementById("popup-img");
  const popupNext = document.getElementById("popup-next");
  const popupClose = document.getElementById("popup-close");

  // game state
  const levelCards = [3, 5, 7];
  let currentLevel = 0; // index into levelCards (0,1,2)
  let attemptsLeft = MAX_ATTEMPTS;
  let chosenSet = []; // array of image paths used this level
  let targetImage = ""; // path string
  let shuffledPositions = []; // array of image paths by position
  let isWaiting = false;

  // helper to build image path
  const imgPath = (i) => `images/img${i}.png`;
  const backPath = () => `images/logo`;

  // simple shuffle
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // start the chosen level flow
  function startGameAt(levelIndex) {
    currentLevel = levelIndex;
    attemptsLeft = MAX_ATTEMPTS;
    levelDisplay.textContent = `Level ${levelIndex + 1}`;
    attemptsDisplay.textContent = `Attempts left: ${attemptsLeft}`;

    // pick random images for this level
    const count = levelCards[levelIndex];
    // pick unique random indices from 1..TOTAL_IMAGES
    const indices = shuffle(Array.from({length: TOTAL_IMAGES}, (_,i)=>i+1)).slice(0, count);
    chosenSet = indices.map(i => imgPath(i));
    // pick target from chosenSet
    targetImage = chosenSet[Math.floor(Math.random() * chosenSet.length)];

    // show preview overlay
    previewImg.src = targetImage;
    overlay.classList.remove("hidden");
    countdownBox.classList.remove("hidden");
    previewBox.classList.remove("hidden");
    countNum.textContent = Math.ceil(PREVIEW_TIME_MS / 1000);

    // countdown
    let remaining = Math.ceil(PREVIEW_TIME_MS / 1000);
    const t = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        countNum.textContent = remaining;
      } else {
        clearInterval(t);
      }
    }, 1000);

    // after preview time -> flip to backside and shuffle display
    setTimeout(() => {
      countdownBox.classList.add("hidden");
      // brief fade
      previewBox.classList.add("fade-out");
      overlay.classList.add("fade-out");
      setTimeout(() => {
        overlay.classList.add("hidden");
        previewBox.classList.add("hidden");
        previewBox.classList.remove("fade-out");
        overlay.classList.remove("fade-out");
        // render backside cards and shuffle positions
        showShuffledCards();
        menu.classList.remove("active");
        game.classList.add("active");
      }, 250);
    }, PREVIEW_TIME_MS);
  }

  // render shuffled cards (backside visible)
  function showShuffledCards() {
    const count = levelCards[currentLevel];
    // shuffle chosenSet to get positions
    shuffledPositions = shuffle(chosenSet);
    // clear cardsWrap and set grid class
    cardsWrap.innerHTML = "";
    cardsWrap.classList.remove("cols-3", "cols-5", "cols-7");
    const colClass = currentLevel === 0 ? "cols-3" : currentLevel === 1 ? "cols-5" : "cols-7";
    cardsWrap.classList.add(colClass);

    // create cards
    for (let i = 0; i < count; i++) {
      const card = document.createElement("div");
      card.className = "card";
      // set backside background (fallback gradient if back.png missing)
      card.style.backgroundImage = `url('${backPath()}'), linear-gradient(135deg, rgba(2,16,20,0.5), rgba(0,10,12,0.8))`;
      card.dataset.index = i;
      card.dataset.image = shuffledPositions[i]; // hidden front
      card.addEventListener("click", onCardClick);
      cardsWrap.appendChild(card);
    }
  }

  // reveal logic when user clicks a card
  function onCardClick(e) {
    if (isWaiting) return;
    const card = e.currentTarget;
    const img = card.dataset.image;

    // reveal visually
    revealCard(card, img);

    // check correctness
    if (img === targetImage) {
      // correct
      isWaiting = true;
      setTimeout(() => {
        showPopup(true);
      }, 350);
    } else {
      // wrong
      attemptsLeft--;
      attemptsDisplay.textContent = `Attempts left: ${attemptsLeft}`;
      // show small visual feedback
      card.style.transform = "scale(0.98)";
      setTimeout(() => { card.style.transform = ""; }, 200);

      if (attemptsLeft <= 0) {
        isWaiting = true;
        setTimeout(() => {
          showPopup(false);
        }, 350);
      }
    }
  }

  // reveal a card's front image (keeps it revealed)
  function revealCard(cardEl, frontImage) {
    cardEl.classList.add("revealed");
    cardEl.style.backgroundImage = `url('${frontImage}')`;
  }

  // show popup (correct or failed)
  function showPopup(isWin) {
    popup.classList.remove("hidden");
    if (isWin) {
      popupTitle.textContent = "🎉 Correct!";
      popupDesc.textContent = `You found the dog — moving to next level.`;
      popupImg.src = targetImage;
      popupNext.textContent = (currentLevel < levelCards.length - 1) ? "Next Level" : "Finish";
    } else {
      popupTitle.textContent = "😕 Oops!";
      popupDesc.textContent = "You used all attempts. Restarting from Level 1.";
      popupImg.src = targetImage;
      popupNext.textContent = "Restart";
    }
  }

  // popup buttons
  popupNext.addEventListener("click", () => {
    popup.classList.add("hidden");
    isWaiting = false;
    if (attemptsLeft <= 0) {
      // reset to level 0
      currentLevel = 0;
      startGameAt(currentLevel);
    } else {
      // move next level or finish
      if (currentLevel < levelCards.length - 1) {
        currentLevel++;
        startGameAt(currentLevel);
      } else {
        // finished all levels -> show menu
        game.classList.remove("active");
        menu.classList.add("active");
      }
    }
  });

  popupClose.addEventListener("click", () => {
    popup.classList.add("hidden");
    isWaiting = false;
  });

  // UI buttons
  startBtn.addEventListener("click", () => {
    startGameAt(0);
  });

  restartBtn.addEventListener("click", () => {
    attemptsLeft = MAX_ATTEMPTS;
    attemptsDisplay.textContent = `Attempts left: ${attemptsLeft}`;
    startGameAt(0);
  });

  menuBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    game.classList.remove("active");
    menu.classList.add("active");
  });

  // initial UI state
  attemptsDisplay.textContent = `Attempts left: ${attemptsLeft}`;
});
