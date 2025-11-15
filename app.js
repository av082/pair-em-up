// import { createUI } from "/ui.js";
const MAX_SCORE = 100;
const MAXCOL = 9;
const sourceArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];
let gameMode = ""
let gameScore = null;
let shuffleUse = 5;
let eraserUse = 5;
let addNumber = 10;
let hintUse = 5;

let mainMatrix = null;
generateMatrix()
function generateMatrix(arr = sourceArr, gMode) {
  gameMode = gMode;

  if (gMode === "classic") {
    mainMatrix = fillMatrix(sourceArr);
  }
  
  if (gMode === "random") {
    const newArr = shuffle(sourceArr);
    mainMatrix = fillMatrix(newArr);
  }
  
  if (gMode === "chaotic") {
    const newArr = [];
    for (let i = 1; i <= 27; i++) {
      const randomNum = Math.floor(Math.random() * 9) + 1
      newArr.push(randomNum);
    }
    mainMatrix = fillMatrix(newArr);
  }
}

function fillMatrix(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i += MAXCOL) {
    result.push(arr.slice(i, i + MAXCOL));
  }
  return result;

  // [
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9],
  //   [1, 1, 1, 2, 1, 3, 1, 4, 1],
  //   [5, 1, 6, 1, 7, 1, 8, 1, 9]
  // ]
}

function printMatrix() {
  const result = []
  for (let i = 0; i < mainMatrix.length; i++) {
    console.log(mainMatrix[i].join(" "));
  }
}

generateUI();
function generateUI() {
  const startScreen = document.createElement("div");
  startScreen.id = "start-screen";
  startScreen.className = "modal";
  document.body.prepend(startScreen);

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  startScreen.append(modalContent);

  const modalTitle = document.createElement("h1");
  modalTitle.className = "game-title";
  modalTitle.textContent = "Pair 'em Up Game";
  modalContent.append(modalTitle);

  const authorLink = document.createElement("a");
  authorLink.className = "author-link";
  authorLink.href = "https://github.com/av082";
  authorLink.textContent = "Author's Git (av082)";
  authorLink.target = "_blank";
  modalContent.append(authorLink);

  const modeH2 = document.createElement("h2");
  modeH2.textContent = "Choose game mode:";
  modalContent.append(modeH2);

  const modeButtons = document.createElement("fieldset");
  modeButtons.className = "mode-buttons";
  modalContent.append(modeButtons);

  const modesTypes = [
    { mode: "classic", label: "Classic" },
    { mode: "random", label: "Random" },
    { mode: "chaotic", label: "Chaotic" }
  ];

  modesTypes.forEach(item => {
    const label = document.createElement("label");
    const btn = document.createElement("input");
    const span = document.createElement("span");

    btn.dataset.mode = item.mode;
    btn.type = "radio";
    btn.value = item.mode;
    btn.name = "gameMode";
    span.className = "wrapper";
    span.textContent = item.label;

    label.prepend(btn);
    btn.after(span);

    modeButtons.append(label);
  });

  const startBtn = document.createElement("button");
  startBtn.className = "startBtn";
  startBtn.textContent = "Start New Game";
  modalContent.append(startBtn);


  startBtn.addEventListener("click", () => {
    let anyChecked = false;
    for (const input of modeButtons.elements) {
      if (input.checked) {
        anyChecked = input.value;
        generateMatrix(sourceArr, anyChecked);
        gameScore = 0;
        renderGridItems();
        startScreen.style.display = "none";
      }
    }

    if (!anyChecked) {
      startBtn.classList.add("shake");

      startBtn.addEventListener("animationend", () => {
        startBtn.classList.remove("shake");
      }, { once: true });
    }
  })


  // GAME FIELD
  const scriptEl = document.querySelector("script");
  const gameContainer = document.createElement("div");
  gameContainer.className = "container";
  scriptEl.before(gameContainer);

  const h1 = document.createElement("h1");
  h1.textContent = "Pair them Game";
  gameContainer.prepend(h1);

  const main = document.createElement("main");
  gameContainer.append(main);

  const grid = document.createElement("div");
  grid.className = "play-field";
  const controls = document.createElement("div");
  controls.className = "controls";
  main.append(grid, controls);

  // Timer, Score, Modes
  const timer = document.createElement("div");
  timer.textContent = "Timer";
  const score = document.createElement("div");
  score.className = "score";
  score.textContent = `Score: ${gameScore === null ? 0 : gameScore} of 100`;
  const modes = document.createElement("div");
  modes.className = "mode";
  const modesTitle = document.createElement("p");
  modesTitle.textContent = "Mode:";
  const classicBtn = document.createElement("button");
  classicBtn.textContent = "Classic";
  classicBtn.addEventListener("click", () => {
    generateMatrix(sourceArr, "classic");
    gameScore = 0;
    renderGridItems();
  });
  const randomBtn = document.createElement("button");
  randomBtn.textContent = "Random";
  randomBtn.addEventListener("click", () => {
    generateMatrix(sourceArr, "random");
    gameScore = 0;
    renderGridItems();
  });
  const chaoticBtn = document.createElement("button");
  chaoticBtn.textContent = "Chaotic";
  chaoticBtn.addEventListener("click", () => {
    generateMatrix(sourceArr, "chaotic");
    gameScore = 0;
    renderGridItems();
  })
  modes.append(modesTitle, classicBtn, randomBtn, chaoticBtn);
  controls.append(timer, score, modes);

  // Add Numbers Button
  const appendBtnWrapper = document.createElement("div");
  appendBtnWrapper.className = "appendBtn-wrapper";
  const appendBtn = document.createElement("button");
  appendBtn.textContent = "Add Numbers (10 left)";
  appendBtn.addEventListener("click", () => {
    if (addNumber > 0) {
      appendNumbers();
      addNumber -= 1;
      appendBtn.textContent = `Add Numbers (${addNumber} left)`;
    }
  });
  appendBtnWrapper.append(appendBtn);
  controls.append(appendBtnWrapper);

  // Shuffle Numbers Button
  const shuffleBtnWrapper = document.createElement("div");
  shuffleBtnWrapper.className = "shuffleBtn-wrapper";
  const shuffleBtn = document.createElement("button");
  shuffleBtn.textContent = "Shuffle (5 left)";
  shuffleBtn.addEventListener("click", () => {
    if (shuffleUse > 0) {
      shuffleMatrix();
      renderGridItems();
      shuffleUse -= 1;
      shuffleBtn.textContent = `Shuffle (${shuffleUse} left)`;
    }
  });
  shuffleBtnWrapper.append(shuffleBtn);
  controls.append(shuffleBtnWrapper);
  
  // Eraser Button
  const eraserBtnWrapper = document.createElement("div");
  eraserBtnWrapper.className = "eraserBtn-wrapper";
  const eraserBtn = document.createElement("button");
  eraserBtn.textContent = "Erase (5 left)";
  eraserBtn.addEventListener("click", () => {
    if (eraserUse > 0) {
      eraseNumber();
      renderGridItems();
      eraserUse -= 1;
      eraserBtn.textContent = `Eraser (${eraserUse} left)`;
    }
  });
  eraserBtnWrapper.append(eraserBtn);
  controls.append(eraserBtnWrapper);
  
  // Hint Button
  const hintBtnWrapper = document.createElement("div");
  hintBtnWrapper.className = "hintBtn-wrapper";
  const hintBtn = document.createElement("button");
  hintBtn.textContent = "hint (5 left)";
  hintBtn.addEventListener("click", () => {
    if (hintUse > 0) {
      let winingPairs = countWinningPairs();
      if (winingPairs > 5) winingPairs = "5+";
      hintUse -= 1;
      hintBtn.textContent = `Hint (${hintUse} left)`;
      alert(`Current number of winning pairs is ${winingPairs}`);
    }
  });
  hintBtnWrapper.append(hintBtn);
  controls.append(hintBtnWrapper);



  // add grid elements
  renderGridItems();

  grid.addEventListener("click", (e) => {
    const cell = e.target.closest(".play-item");
    if (!cell) return;

    handleSelection(cell); 
  });

  stopWatch(timer).start();
}

function renderGridItems(arr = mainMatrix) {
  const grid = document.querySelector(".play-field");
  grid.innerHTML = "";

  if (!arr) {
    for (let i = 0; i < MAXCOL; i++) {
      const item = document.createElement("div");
      item.className = "play-item";
      grid.append(item);
    }
    return
  }
  
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      const item = document.createElement("div");
      item.className = "play-item";
      item.dataset.row = `${i}`;
      item.dataset.col = `${j}`;
      
      const itemContent = arr[i][j];
      if (itemContent !== undefined) {
        item.textContent = `${arr[i][j]}`;
      } else {
        item.textContent = "";
      }
      grid.append(item);
    }
  }
}

let firstEl = null;
function handleSelection(cell) {
  const elRow = +cell.dataset.row;
  const elCol = +cell.dataset.col;

  // если ячейка пустая — пропускаем
  if (mainMatrix[elRow][elCol] === undefined) return;

  // выбор первой ячейки
  if (!firstEl) {
    firstEl = { row: elRow, col: elCol, el: cell };
    cell.classList.add("selected");
    playSound("select", 0.7);
    return;
  }

  // выбор первой ячейки (если есть первая)
  if (firstEl) {
    const el1 = firstEl.el;
    const el2 = cell
    const value1 = mainMatrix[firstEl.row][firstEl.col];
    const value2 = mainMatrix[elRow][elCol];

    if (cell === firstEl.el) {
      firstEl.el.classList.remove("selected");
      playSound("deselect", 0.7);
      firstEl = null;
      return;
    }

    if (canSelect(firstEl.row, firstEl.col, elRow, elCol)) {
      
      el2.classList.add("selected");
      
      if (isMatch(value1, value2)) {

        updateScore(value1, value2);

        mainMatrix[firstEl.row][firstEl.col] = undefined;
        mainMatrix[elRow][elCol] = undefined;
        
        el1.textContent = "";
        el2.textContent = "";

        el1.classList.add("correct");
        el2.classList.add("correct");

        playSound("valid");
        
        setTimeout(() => {
          removeStyles(el1, el2);
        }, 300);
      } else {
        el1.classList.add("error");
        el2.classList.add("error");
        playSound("invalid");
        setTimeout(() => removeStyles(el1, el2), 300);
      }

    } else {
      el1.classList.add("error");
      el2.classList.add("selected", "error");
      playSound("invalid");
      setTimeout(() => removeStyles(el1, el2), 300);
    }

    firstEl = null; // сброс выбора
  }

  function removeStyles(el1, el2) {
    el1.classList.remove("error", "correct", "selected");
    el2.classList.remove("error", "correct", "selected");
  }

  hasLost();
  hasWon();
}

function canSelect(r1, c1, r2, c2) {
  // проверяем, что это не та же самая ячейка
  if (r1 === r2 && c1 === c2) return false;

  // проеряем что выбрана соседняя ячейка
  const rowDiff = Math.abs(r1 - r2);
  const colDiff = Math.abs(c1 - c2);

  if ((rowDiff === 0 && colDiff === 1) || (colDiff === 0 && rowDiff === 1)) {
    return true;
  }

  // проверяем выбор по вертикали
  if (c1 === c2) {
    const col = c1;
    const upperCell = Math.min(r1, r2);
    const lowerCell = Math.max(r1, r2);

    // если соседние — можно сразу
    if (lowerCell - upperCell === 1) return true;

    // проверяем, что между только нули
    for (let r = upperCell + 1; r < lowerCell; r++) {
      if (mainMatrix[r][col] !== undefined) return false;
    }
    return true;
  }

  // горизонталь с переносом
  // если обе ячейки в одной строке
  if (r1 === r2) {
    const startCell = Math.min(c1, c2);
    const endCell = Math.max(c1, c2);

    for (let c = startCell + 1; c < endCell; c++) {
      if (mainMatrix[r1][c] !== undefined) return false;
    }
    return true;
  }

  // если движение вниз
  if (r1 < r2) {
    // проверяем от текущей позиции до конца строки
    for (let c = c1 + 1; c < mainMatrix[r1].length; c++) {
      if (mainMatrix[r1][c] !== undefined) {

        return false;
      }
    }

    // промежуточные строки
    for (let r = r1 + 1; r < r2; r++) {
      for (let c = 0; c < mainMatrix[r].length; c++) {
        if (mainMatrix[r][c] !== undefined) return false;
      }
    }

    // последняя строка — проверяем от начала до c2
    for (let c = 0; c < c2; c++) {
      if (mainMatrix[r2][c] !== undefined) return false;
    }
  }

  // если движение вверх
    else {
    // проверяем от текущей позиции влево до начала строки
    for (let c = c1 - 1; c >= 0; c--) {
      if (mainMatrix[r1][c] !== undefined) return false;
    }

    // промежуточные строки между верхней и нижней
    for (let r = r1 - 1; r > r2; r--) {
      for (let c = 0; c < mainMatrix[r].length; c++) {
        if (mainMatrix[r][c] !== undefined) return false;
      }
    }

    // последняя строка — проверяем от конца до целевой колонки
    for (let c = mainMatrix[r2].length - 1; c > c2; c--) {
      if (mainMatrix[r2][c] !== undefined) return false;
    }
  }

  return true;
}

function hasWon() {
  if (gameScore >=100) {
    alert("You won! :)");
    return true;
  }
}

function hasLost() {
  const availableMoves = countWinningPairs();
  
  if (is50lines()) {
    alert("You lost :(");
    return true;
  }

  if (
    availableMoves === 0 &&
    addNumber === 0 &&
    hintUse === 0 &&
    eraserUse === 0 &&
    shuffleUse === 0
  ) {
    alert("You lost :(");
    return true;
  }
}

function isMatch(value1, value2) {  
  if (value1 === value2 || value1 + value2 === 10) {
    return true;
  }

  return false;
}

function updateScore(value1, value2) {
  const scoreEl = document.querySelector("div.score");

  if (value1 === 5 && value2 === 5) {
    gameScore += 3;
  } else if (value1 + value2 === 10) {
    gameScore += 2; 
  } else if (value1 === value2) {
    gameScore += 1;
  }

  scoreEl.textContent = `Score: ${gameScore} of 100`;
}

function shuffle(array){
  let i = array.length, j, temp;

  while (--i > 0) {
    // create a random number and store it in a variable
    j = Math.floor(Math.random () * (i+1));
    // create a temporary position from the item of the random number    
    temp = array[j];
    // swap the temp with the position of the last item in the array    
    array[j] = array[i];
    // swap the last item with the position of the random number 
    array[i] = temp;
  }

  return array;
}


function shuffleMatrix(matrix = mainMatrix) {
  let arr = matrix.flat(Infinity);
  arr = shuffle(arr);
  mainMatrix = fillMatrix(arr);
}


function eraseNumber(matrix = mainMatrix) {
  const elements = [];

  if (!elements) return;

  matrix.forEach((row, i) => {
    row.forEach((el, j) => {
      if (el !== undefined) elements.push({row: i, col: j, el});
    })
  })
  
  const randomIndex = Math.floor(Math.random() * elements.length);
  const randomEl = elements[randomIndex];

  const domEl = document.querySelector(`.play-item[data-row="${randomEl.row}"][data-col="${randomEl.col}"]`);
  domEl.textContent = "";
  mainMatrix[randomEl.row][randomEl.col] = undefined;
}


function is50lines() {
  return mainMatrix.length === 50;
}


function appendNumbers() {
  if (is50lines()) return;

  const result = [];
  
  for (let i = 0; i < mainMatrix.length; i++) {
    for (let j = 0; j < mainMatrix[i].length; j++) {
      const item = mainMatrix[i][j];
      if (item !== undefined) {
        result.push(item);
      }
    }
  }

  let numbersToAdd;
  if (gameMode === "classic") {
    numbersToAdd = result;
  } else if (gameMode === "random") {
    numbersToAdd = shuffle(result);
  } else if (gameMode === "chaotic") {
    numbersToAdd = result.map(() => Math.floor(Math.random() * 9) + 1);
  }

  function addToMatrix(arr) {
    const rowLength = mainMatrix[0].length;

    let lastRow = mainMatrix.length - 1;
    let lastCol = -1;

    for (let i = mainMatrix.length - 1; i >= 0; i--) {
      for (let j = rowLength - 1; j >= 0; j--) {
        if (mainMatrix[i][j] !== undefined) {
          lastRow = i;
          lastCol = j;
          break;
        }
      }
      if (lastCol !== -1) break;
    }

    let i = lastRow;
    let j = lastCol + 1;
    for (let m = 0; m < arr.length; m++) {

      if (j >= rowLength) {
        j = 0;
        i++;
        
        if (!mainMatrix[i]) {
          if (hasLost()) break;
          mainMatrix.push(new Array(rowLength).fill(undefined));
        }
      }

      mainMatrix[i][j] = arr[m];
      j++;
    }
  }
  addToMatrix(numbersToAdd);
  renderGridItems();
}


// AUDIO
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundBuffers = {};

const soundFiles = [
  "invalid.wav",
  "valid.mp3",
  "select.mp3",
  "deselect.mp3",
];

async function preloadSounds() {
  for (const file of soundFiles) {
    const response = await fetch(`sounds/${file}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const key = file.split(".")[0];
    soundBuffers[key] = audioBuffer;
  }
}
preloadSounds();

function playSound(key, volume = 1) {
  if (!soundBuffers[key]) return;

  const source = audioCtx.createBufferSource();
  source.buffer = soundBuffers[key];

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;

  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  source.start();
}


function stopWatch(el) {
  let startTime = Date.now();
  let timerId;

  function update() {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000) % 60;
    const minutes = Math.floor(elapsed / 60000);
    el.textContent = `Timer: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    
    timerId = requestAnimationFrame(update);
  }

  // Методы для управления секундомером
  return {
    start() {
      startTime = Date.now();
      cancelAnimationFrame(timerId);
      update();
    },
    stop() {
      cancelAnimationFrame(timerId);
    },
    reset() {
      cancelAnimationFrame(timerId);
      startTime = Date.now();
      el.textContent = "Timer: 00:00";
    }
  };
}


function countWinningPairs(matrix = mainMatrix) {
  let count = 0;

  if (!matrix) return;

  for (let r1 = 0; r1 < matrix.length; r1++) {
    for (let c1 = 0; c1 < matrix[r1].length; c1++) {
      const value1 = matrix[r1][c1];
      if (value1 === undefined) continue;

      for (let r2 = r1; r2 < matrix.length; r2++) {
        for (let c2 = (r2 === r1 ? c1 + 1 : 0); c2 < matrix[r2].length; c2++) {
          const value2 = matrix[r2][c2];
          if (value2 === undefined) continue;

          if (isMatch(value1, value2) && canSelect(r1, c1, r2, c2)) {
            count++;
          }
        }
      }
    }
  }

  return count;
}

// Использование
console.log("Количество выигрышных пар:", countWinningPairs());