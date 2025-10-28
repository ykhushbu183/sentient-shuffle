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
  const randomI
