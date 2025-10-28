const images = [
  'images/img1.png','images/img2.png','images/img3.png','images/img4.png','images/img5.png',
  'images/img6.png','images/img7.png','images/img8.png','images/img9.png','images/img10.png'
]

let currentLevel = 1
let correctCard = null
let attempts = 0

const cardsContainer = document.getElementById('cards')
const optionsContainer = document.getElementById('options')
const message = document.getElementById('message')
const popup = document.getElementById('popup')
const popupText = document.getElementById('popup-text')
const nextBtn = document.getElementById('next-btn')
const levelDisplay = document.getElementById('level-display')

const levelSettings = {
  1: 3,
  2: 5,
  3: 7
}

function startLevel() {
  message.textContent = ''
  optionsContainer.innerHTML = ''
  cardsContainer.innerHTML = ''
  levelDisplay.textContent = `Level ${currentLevel}`

  const totalCards = levelSettings[currentLevel]
  const randomImages = shuffle(images).slice(0, totalCards)

  correctCard = randomImages[Math.floor(Math.random() * totalCards)]
  renderCards(randomImages)

  setTimeout(() => hideCards(randomImages), 3000)
}

function renderCards(imgs) {
  cardsContainer.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(imgs.length))}, 1fr)`
  imgs.forEach(img => {
    const card = document.createElement('div')
    card.className = 'tile'
    card.style.backgroundImage = `url(${img})`
    cardsContainer.appendChild(card)
  })
}

function hideCards(imgs) {
  const tiles = document.querySelectorAll('.tile')
  tiles.forEach(t => {
    t.style.backgroundImage = 'url(images/back.png)'
  })

  showOptions(imgs)
}

function showOptions(imgs) {
  const options = shuffle(imgs).slice(0, 3)
  if (!options.includes(correctCard)) options[Math.floor(Math.random() * 3)] = correctCard

  options.forEach(opt => {
    const btn = document.createElement('button')
    btn.className = 'btn'
    btn.innerText = 'Select'
    btn.onclick = () => checkAnswer(opt)
    optionsContainer.appendChild(btn)
  })
}

function checkAnswer(selected) {
  if (selected === correctCard) {
    popupText.textContent = 'Correct!'
    popup.classList.remove('hidden')
  } else {
    attempts++
    if (attempts >= 3) {
      message.textContent = 'Oops! Try again'
      attempts = 0
      startLevel()
    } else {
      message.textContent = `Wrong choice (${3 - attempts} left)`
    }
  }
}

nextBtn.onclick = () => {
  popup.classList.add('hidden')
  if (currentLevel < 3) {
    currentLevel++
    startLevel()
  } else {
    popupText.textContent = 'You finished all levels!'
    nextBtn.style.display = 'none'
  }
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5)
}

startLevel()
