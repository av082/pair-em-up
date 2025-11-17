// import { createUI } from "/ui.js";
const MAX_SCORE = 3;
const MAXCOL = 9;
const sourceArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];
let gameMode = ""
let gameScore = null;
let shuffleUse = 5;
let eraserUse = 5;
let addNumber = 10;
let hintUse = 5;
let movesTotal = 0;
const resultTime = {};

let mainMatrix = null;

let previousState = null;

let stopWatchInstance;

const uiSettings = {
  sound: true,
  night: false,
}

let currentGameResult = {};

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

// GENERATE UI ELEMENTS
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
        selectedMode.textContent = `Mode: ${gameMode[0].toUpperCase() + gameMode.slice(1)}`
        startScreen.style.display = "none";
        stopWatchInstance.start();
      }
    }

    if (!anyChecked) {
      startBtn.classList.add("shake");

      startBtn.addEventListener("animationend", () => {
        startBtn.classList.remove("shake");
      }, { once: true });
    }
  })

  const loadPreviousGameBtn = document.createElement("button");
  loadPreviousGameBtn.className = "load-prev-game-btn";
  loadPreviousGameBtn.id = "loadGameBtn";
  loadPreviousGameBtn.textContent = "Load Previous Game";
  modalContent.append(loadPreviousGameBtn);
  
  if (hasSavedGame()) loadPreviousGameBtn.style.display = "block";
  console.log(`Игра сохранена: ${hasSavedGame()}`);
  
  loadGameBtn.addEventListener("click", () => {
    loadGameState();
    console.log("Вызов из события...");
    startScreen.style.display = "none";
  })

  // ==================================================
  // GAME FIELD
  // ==================================================
  const scriptEl = document.querySelector("script");
  const gameContainer = document.createElement("div");
  gameContainer.className = "container";
  scriptEl.before(gameContainer);

  const headerWrapper = document.createElement("div");
  headerWrapper.className = "headerWrapper";
  gameContainer.append(headerWrapper);

  const titleWrapper = document.createElement("div");
  titleWrapper.className = "titleWrapper";
  headerWrapper.append(titleWrapper);

  const h1 = document.createElement("h1");
  h1.textContent = "Pair 'em Game";
  titleWrapper.prepend(h1);

  const selectedMode = document.createElement("p");
  selectedMode.id = "selectedMode";
  selectedMode.textContent = "";
  titleWrapper.append(selectedMode);

  const settingsWrapper = document.createElement("div");
  settingsWrapper.className = "settingsWrapper";
  headerWrapper.append(settingsWrapper);

  const toolsBlock = document.createElement("div");
  toolsBlock.className = "settingsBlock";
  settingsWrapper.append(toolsBlock);

  const statsIconWrapper = document.createElement("div");
  statsIconWrapper.className = "stats-icon-wrapper";
  toolsBlock.append(statsIconWrapper);
  statsIconWrapper.addEventListener("click", () => {
    envokeModalPopup("stat");
  })

  const soundIconWrapper = document.createElement("div")
  soundIconWrapper.className = "sound-icon-wrapper";
  toolsBlock.append(soundIconWrapper);
  
  const soundToggle = document.createElement("label");
  soundToggle.className = "sound-switch";
  const soundCheckbox = document.createElement("input");
  soundCheckbox.setAttribute("type", "checkbox");
  soundToggle.append(soundCheckbox);

  const soundSlider = document.createElement("span");
  soundSlider.className = "sound-slider";
  soundToggle.append(soundSlider);
  toolsBlock.append(soundToggle);
  
  const themeIconWrapper = document.createElement("div")
  themeIconWrapper.className = "theme-icon-wrapper";
  toolsBlock.append(themeIconWrapper);
  
  const themeToggle = document.createElement("label");
  themeToggle.className = "theme-switch";
  const themeCheckbox = document.createElement("input");
  themeCheckbox.setAttribute("type", "checkbox");
  themeToggle.append(themeCheckbox);
  const themeSlider = document.createElement("span");
  themeSlider.className = "theme-slider";
  themeToggle.append(themeSlider);
  toolsBlock.append(themeToggle);


  const btnsBlock = document.createElement("div");
  btnsBlock.className = "btnsBlock";
  settingsWrapper.append(btnsBlock);

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Contnue";
  continueBtn.dataset.type = "continue";
  continueBtn.id = "continueBtn";
  continueBtn.addEventListener("click", loadGameState);

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.dataset.type = "save";
  saveBtn.addEventListener("click", saveGameState);

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset";
  resetBtn.dataset.type = "reset";
  resetBtn.addEventListener("click", resetGame);

  btnsBlock.append(continueBtn, saveBtn, resetBtn);

  if (hasSavedGame()) continueBtn.style.display = "block";


  // MAIN SECTION
  const main = document.createElement("main");
  gameContainer.append(main);

  const grid = document.createElement("div");
  grid.className = "play-field";
  const controls = document.createElement("div");
  controls.className = "controls";
  main.append(controls, grid);


  // Add Numbers Button
  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.className = "buttonsWrapper";
  controls.append(buttonsWrapper);

  const appendBtn = document.createElement("button");
  // appendBtn.textContent = "Add nums";
  // appendBtn.append(document.createElement("br"));

  const addIcon = document.createElement("span");
  addIcon.classList = "add-icon";
  appendBtn.append(addIcon);

  const appendUses = document.createElement("span");
  appendUses.id = "addBtn";
  appendUses.textContent = `${addNumber}`;
  appendBtn.append(appendUses);
  buttonsWrapper.append(appendBtn);
  appendBtn.addEventListener("click", () => {
    if (addNumber > 0) {
      savePreviousState();
      appendNumbers();
      addNumber -= 1;
      appendUses.textContent = `${addNumber}`;
    }
  });

  // Shuffle Numbers Button
  const shuffleBtn = document.createElement("button");
  // shuffleBtn.textContent = "Shuffle";
  // shuffleBtn.append(document.createElement("br"));
  const shuffleIcon = document.createElement("span");
  shuffleIcon.classList = "shuffle-icon";
  shuffleBtn.append(shuffleIcon);

  const shuffleUses = document.createElement("span");
  shuffleUses.id = "shuffleBtn";
  shuffleUses.textContent = `${shuffleUse}`;
  shuffleBtn.append(shuffleUses);
  buttonsWrapper.append(shuffleBtn);
  shuffleBtn.addEventListener("click", () => {
    if (shuffleUse > 0) {
      savePreviousState();
      shuffleMatrix();
      renderGridItems();
      shuffleUse -= 1;
      shuffleUses.textContent = `${shuffleUse}`;
    }
  });
  
  // Eraser Button
  const eraserBtn = document.createElement("button");
  // eraserBtn.textContent = "Erase";
  // eraserBtn.append(document.createElement("br"));
  const eraseIcon = document.createElement("span");
  eraseIcon.classList = "erase-icon";
  eraserBtn.append(eraseIcon);

  const eraserUses = document.createElement("span");
  eraserUses.id = "eraserBtn";
  eraserUses.textContent = `${eraserUse}`;
  eraserBtn.append(eraserUses);
  buttonsWrapper.append(eraserBtn);
  eraserBtn.addEventListener("click", () => {
    if (eraserUse > 0) {
      savePreviousState();
      eraseNumber();
      renderGridItems();
      eraserUse -= 1;
      eraserUses.textContent = `${eraserUse}`;
    }
  });
  
  // Hint Button
  const hintBtn = document.createElement("button");
  // hintBtn.textContent = "Hints";
  // hintBtn.append(document.createElement("br"));
  const hintIcon = document.createElement("span");
  hintIcon.classList = "hint-icon";
  hintBtn.append(hintIcon);

  const hintsUses = document.createElement("span");
  hintsUses.id = "hintBtn";
  hintsUses.textContent = `${hintUse}`;
  hintBtn.append(hintsUses);
  buttonsWrapper.append(hintBtn);
  hintBtn.addEventListener("click", () => {
    if (hintUse > 0) {
      savePreviousState();
      let winingPairs = countWinningPairs();
      if (winingPairs > 5) winingPairs = "5+";
      hintUse -= 1;
      hintsUses.textContent = `${hintUse}`;
      envokeModalPopup("hint");
    }
  });
  
  // Revert Button
  const revertBtn = document.createElement("button");
  revertBtn.className = "revert-btn";
  revertBtn.id = "revertBtn";
  revertBtn.disabled = true;
  const revertIcon = document.createElement("span");
  revertIcon.className = "revert-icon";
  revertBtn.append(revertIcon);
  buttonsWrapper.append(revertBtn);
  revertBtn.addEventListener("click", restorePreviousState);


  // Timer, Score, Modes
  const scoreWrapper = document.createElement("div");
  scoreWrapper.className = "scoreWrapper";
  const timer = document.createElement("div");
  timer.textContent = "Timer";
  const score = document.createElement("div");
  score.className = "score";
  score.textContent = `Score: ${gameScore === null ? 0 : gameScore} of ${MAX_SCORE}`;
  const progressContainer = document.createElement("div");
  progressContainer.className = "progress-container";

  const progressWrapper = document.createElement("div");
  progressWrapper.className = "progressWrapper";
  progressWrapper.append(progressContainer);

  
  scoreWrapper.append(timer, score);
  controls.append(scoreWrapper, progressWrapper);

  let observer = new MutationObserver(el => {
    const parentWidth = progressContainer.offsetWidth;
    const barLength = Math.round(parentWidth / MAX_SCORE * gameScore);
    if (barLength <= parentWidth) {
      progressContainer.style.setProperty("--bar-width", `${barLength}px`);
    } else {
      progressContainer.style.setProperty("--bar-width", `${parentWidth}px`);
    }
  });
  observer.observe(score, {
    childList: true,
    characterData: true,
    subtree: true
  });


  window.onload = () => {
    const barWidth = progressWrapper.offsetWidth;
    const offsetTop = progressContainer.getBoundingClientRect().top + window.scrollY;
    
    window.addEventListener("scroll", () => {
      if (window.scrollY >= offsetTop) {
        progressContainer.style.width = barWidth + "px";
        progressContainer.classList.add("fixed");
      } else {
        progressContainer.style.width = "";
        progressContainer.classList.remove("fixed");
      }
    })
  }

  // MAIN GRID FIELD SECTION
  renderGridItems();

  grid.addEventListener("click", (e) => {
    const cell = e.target.closest(".play-item");
    if (!cell) return;

    handleSelection(cell); 
  });

  stopWatchInstance = stopWatch(timer);  
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
        savePreviousState();

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
  if (gameScore >= MAX_SCORE) {
    gameStats = 
    envokeModalPopup("win");
    return true;
  }
}

function hasLost() {
  const availableMoves = countWinningPairs();
  
  if (is50lines()) {
    envokeModalPopup("lose");
    return true;
  }

  if (
    availableMoves === 0 &&
    addNumber === 0 &&
    hintUse === 0 &&
    eraserUse === 0 &&
    shuffleUse === 0
  ) {
    envokeModalPopup("lose");
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

  if (gameScore > MAX_SCORE) gameScore = MAX_SCORE;

  movesTotal += 1;

  scoreEl.textContent = `Score: ${gameScore} of ${MAX_SCORE}`;
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
  "win.mp3",
  "lose.mp3",
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

const masterGain = audioCtx.createGain();
masterGain.gain.value = 1;
masterGain.connect(audioCtx.destination);

function playSound(key, volume = 1) {
  if (!soundBuffers[key]) return;

  const source = audioCtx.createBufferSource();
  source.buffer = soundBuffers[key];

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;

  source.connect(gainNode);
  gainNode.connect(masterGain);

  source.start();
}

function setMasterVolume(val) {
  const soundBtn = document.querySelector(".sound-switch input");
  const savedSetting = localStorage.getItem("soundSetting");

  if (val === undefined) {
    const isOn = savedSetting !== null ? savedSetting === "true" : true;
    soundBtn.checked = isOn;
    masterGain.gain.value = isOn ? 1 : 0;
  } else {
    masterGain.gain.value = val ? 1 : 0;
    localStorage.setItem("soundSetting", val);
  }
}
const soundCheckbox = document.querySelector(".sound-switch input");
setMasterVolume();

soundCheckbox.addEventListener("change", (e) => {
  setMasterVolume(e.target.checked);
});


function stopWatch(el) {
  let startTime = Date.now();
  let timerId;
  let elapsedBeforePause = 0;

  function update() {
    const elapsed = elapsedBeforePause + (Date.now() - startTime);
    const seconds = Math.floor(elapsed / 1000) % 60;
    const minutes = Math.floor(elapsed / 60000);

    el.textContent = `Timer: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    
    timerId = requestAnimationFrame(update);
  }

  return {
    start() {
      startTime = Date.now();
      cancelAnimationFrame(timerId);
      update();
    },
    stop() {
      elapsedBeforePause += Date.now() - startTime;
      cancelAnimationFrame(timerId);
      return elapsedBeforePause;
    },
    reset() {
      cancelAnimationFrame(timerId);
      startTime = Date.now();
      elapsedBeforePause = 0;
      el.textContent = "Timer: 00:00";
    },
    getElapsed() {
      return elapsedBeforePause + (Date.now() - startTime);
    },
    setElapsed(ms) {
      elapsedBeforePause = ms;
      startTime = Date.now();
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

function savePreviousState() {
  previousState = {
    mainMatrix: mainMatrix.map(row => [...row]),
    gameScore,
    addNumber,
    shuffleUse,
    eraserUse,
    hintUse
  };

  activateUndoButton();
}

function restorePreviousState() {
  if (!previousState) return;

  mainMatrix = previousState.mainMatrix.map(row => [...row]);
  gameScore = previousState.gameScore;
  addNumber = previousState.addNumber;
  shuffleUse = previousState.shuffleUse;
  eraserUse = previousState.eraserUse;
  hintUse = previousState.hintUse;

  previousState = null;

  deactivateUndoButton();
  renderGridItems();
  updateScoreUI();
  updateControlsUI();
}

function activateUndoButton() {
  const btn = document.getElementById("revertBtn");
  if (btn) btn.disabled = false;
}

function deactivateUndoButton() {
  const btn = document.getElementById("revertBtn");
  if (btn) btn.disabled = true;
}

function updateScoreUI() {
  const score = document.querySelector(".scoreWrapper .score");
  score.textContent = `Score: ${gameScore} of ${MAX_SCORE}`;
}

function updateControlsUI() {
  addBtn.textContent = `${addNumber}`;
  shuffleBtn.textContent = `${shuffleUse}`;
  eraserBtn.textContent = `${eraserUse}`;
  hintBtn.textContent = `${hintUse}`;
  revertBtn.disabled = true;
  selectedMode.textContent = `Mode: ${gameMode[0].toUpperCase() + gameMode.slice(1)}`;
}


function saveGameState() {
  const elapsed = stopWatchInstance.getElapsed();

  const state = {
    mainMatrix,
    gameScore,
    shuffleUse,
    eraserUse,
    addNumber,
    hintUse,
    gameMode,
    timer: elapsed,
    previousState,
  }

  localStorage.setItem("PairEmUpGameState", JSON.stringify(state));

  const saveBtn = document.querySelector("button[data-type='continue']");
  saveBtn.style.display = "block"
}

function hasSavedGame() {
  return localStorage.getItem("PairEmUpGameState") !== null;
}

function loadGameState() {
  const state = JSON.parse(localStorage.getItem("PairEmUpGameState"));
  if (!state) return;

  mainMatrix = state.mainMatrix.map(row => row.map(v => v === null ? undefined : v));
  gameScore = state.gameScore;

  shuffleUse = state.shuffleUse;
  eraserUse = state.eraserUse;
  addNumber = state.addNumber;
  hintUse = state.hintUse;

  gameMode = state.gameMode;

  if (state.previousState) {
    previousState = {
      mainMatrix: state.previousState.mainMatrix.map((row) =>
        row.map((v) => (v === null ? undefined : v))
      ),
      gameScore: state.previousState.gameScore,
      addNumber: state.previousState.addNumber,
      shuffleUse: state.previousState.shuffleUse,
      eraserUse: state.previousState.eraserUse,
      hintUse: state.previousState.hintUse,
    };
  } else {
    previousState = null;
  }

  stopWatchInstance.setElapsed(state.timer);
  stopWatchInstance.start();

  renderGridItems();
  updateControlsUI();
  updateScoreUI();
  const continueBtn = document.querySelector("button[data-type='continue']");
  continueBtn.style.display = "none";

  localStorage.removeItem("PairEmUpGameState");
}

function resetGame() {
  gameScore = 0;
  shuffleUse = 5;
  eraserUse = 5;
  addNumber = 10;
  hintUse = 5;
  previousState = null;

  generateMatrix(sourceArr, gameMode);
  renderGridItems();
  updateScoreUI();
  updateControlsUI();
  stopWatchInstance.reset();
  stopWatchInstance.start()
}


// MODAL POPUP
// ===========================================================
function envokeModalPopup(condition) {
  const background = document.createElement("div");
  background.id = "modalBackground";
  const modalContainer = document.createElement("div");
  modalContainer.id = "modalContainer";
  document.body.prepend(background);
  background.append(modalContainer);

  if (condition === "win") {
    setResultTime();
    saveGameResults("won");
    renderWinModal(modalContainer);
    playSound("win");
  }
  else if (condition === "lose") {
    setResultTime();
    saveGameResults("lost");
    renderLoseModal(modalContainer);
    playSound("lose");
  }
  else if (condition === "stat") {
    renderResultsModal(modalContainer);
  }
  else if (condition === "hint") {
    renderHintModal(modalContainer);
  }
}

function renderWinModal(modalContainer) {
  const h1 = document.createElement("h1");
  h1.textContent = "Congratulations! 🎉";
  modalContainer.append(h1);

  const h2 = document.createElement("h2");
  h2.textContent = "Your result"
  
  const p1 = document.createElement("p");
  const span1 = document.createElement("span");
  p1.textContent = "You scored: ";
  span1.textContent = `${gameScore === null ? 0 : gameScore} out of ${MAX_SCORE}.`;
  p1.append(span1);
  
  const p2 = document.createElement("p");
  const span2 = document.createElement("span");
  p2.textContent = "And spent ";
  span2.textContent = `${resultTime.time} minutes.`;
  p2.append(span2);

  modalContainer.append(h2, p1, p2);

  document.body.style.overflow = "hidden";

  const newGame = document.createElement("button");
  newGame.textContent = "New Game";
  newGame.className = "new-game-btn";

  const restartGame = document.createElement("button");
  restartGame.textContent = "Restart Game";
  restartGame.className = "restart-game-btn";

  const showStats = document.createElement("button");
  showStats.textContent = "Show Stats";
  showStats.className = "restart-game-btn";

  modalContainer.append(newGame, restartGame, showStats);

  restartGame.addEventListener("click", (e) => {
    resetGame();
    hideModalPopup(e);
  })

  newGame.addEventListener("click", () => {
    window.location.reload();
  });

  showStats.addEventListener("click", () => {
    envokeModalPopup("stat");
  });
}

function renderLoseModal(modalContainer) {
  const h1 = document.createElement("h1");
  h1.textContent = "You lost! 😢";
  modalContainer.append(h1);

  const h2 = document.createElement("h2");
  h2.textContent = "Your result"
  
  const p1 = document.createElement("p");
  const span1 = document.createElement("span");
  p1.textContent = "You scored: ";
  span1.textContent = `${gameScore === null ? 0 : gameScore} out of ${MAX_SCORE}.`;
  p1.append(span1);
  
  const p2 = document.createElement("p");
  const span2 = document.createElement("span");
  p2.textContent = "And spent ";
  
  span2.textContent = `${resultTime.time} minutes.`;
  p2.append(span2);

  modalContainer.append(h2, p1, p2);

  document.body.style.overflow = "hidden";

  const newGame = document.createElement("button");
  newGame.textContent = "New Game";
  newGame.className = "new-game-btn";

  const restartGame = document.createElement("button");
  restartGame.textContent = "Restart Game";
  restartGame.className = "restart-game-btn";

  const showStats = document.createElement("button");
  showStats.textContent = "Show Stats";
  showStats.className = "restart-game-btn";

  modalContainer.append(newGame, restartGame, showStats);

  restartGame.addEventListener("click", (e) => {
    resetGame();
    hideModalPopup(e);
  })

  newGame.addEventListener("click", () => {
    window.location.reload();
  });

  showStats.addEventListener("click", () => {
    envokeModalPopup("stat");
  })
}

function renderHintModal(modalContainer) {
  const movesCount = countWinningPairs();
  const availableMoves = movesCount > 5 ? "5+" : movesCount;

  const h1 = document.createElement("h1");
  h1.textContent = "⭐️ Hint ⭐️";
  modalContainer.append(h1);

  const h2 = document.createElement("h2");
  h2.className = "hint-h2";
  h2.textContent = `You have ${availableMoves} moves available.`
  modalContainer.append(h2);

  document.body.style.overflow = "hidden";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close ⛌";
  closeBtn.className = "restart-game-btn";

  modalContainer.append(closeBtn);

  closeBtn.addEventListener("click", (e) => {
    hideModalPopup(e);
  });
}

function renderResultsModal(modalContainer) {
  const h1 = document.createElement("h1");
  h1.textContent = "Game Statistics";
  modalContainer.append(h1);
  modalContainer.closest("#modalBackground").style.zIndex = "9200";

  if (Object.keys(currentGameResult).length > 0) {
    const h21 = document.createElement("h2");
    h21.className = "game-results-h2";
    h21.textContent = "Current Game Results"
    modalContainer.append(h21);

    const container = document.createElement("div");
    container.className = "grid-container";
    modalContainer.append(container);

    const columns = ["Mode", "Score", "Outcome", "Time", "Moves"];
    for (let col of columns) {
      const p = document.createElement("p");
      p.className = "stat-header";
      p.textContent = col;
      container.append(p);
    }

    for (const key in currentGameResult) {
      const p = document.createElement("p");

      if (
        typeof currentGameResult[key] === "object" &&
        currentGameResult[key] !== null &&
        "time" in currentGameResult
      ) {
        p.textContent = `${currentGameResult[key].time}`;
      } else {
        p.textContent = `${
          typeof currentGameResult[key] === "string"
            ? currentGameResult[key][0].toUpperCase() + currentGameResult[key].slice(1)
            : currentGameResult[key]
        }`;
      }

      container.append(p);
    }

    const h22 = document.createElement("h2");
    h22.className = "game-results-h2";
    h22.textContent = "Recent Games";
    modalContainer.append(h22);
  }

  const container = document.createElement("div");
  container.className = "grid-container";
  modalContainer.append(container);

  const columns = ["Mode", "Score", "Outcome", "Time", "Moves"];
  for (let col of columns) {
    const p = document.createElement("p");
    p.className = "stat-header";
    p.textContent = col;
    container.append(p);
  }

  const gameResults = getGameResults();
  gameResults.sort((a, b) => b.time.elapsed - a.time.elapsed);

  gameResults.forEach((object => {
    for (const key in object) {
      const p = document.createElement("p");

      if (
        typeof object[key] === "object" &&
        object[key] !== null &&
        "time" in object
      ) {
        p.textContent = `${object[key].time}`;
      } else {
        p.textContent = `${
          typeof object[key] === "string"
            ? object[key][0].toUpperCase().slice(0) + object[key].slice(1)
            : object[key]
        }`;
      }

      container.append(p);
    }
  }))

  document.body.style.overflow = "hidden";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close ⛌";
  closeBtn.className = "restart-game-btn";

  modalContainer.append(closeBtn);

  closeBtn.addEventListener("click", (e) => {
    hideModalPopup(e);
  });
}

function hideModalPopup(e) {
  const container = e.target.closest("#modalContainer");
  const background = e.target.closest("#modalBackground");

  if (container) {
    container.style.display = "none";
    container.remove();
  }

  if (background) {
    background.style.display = "none";
    background.remove();
  }

  document.body.style.overflow = "";

  // modalContainer.style.display = "none"
  // modalBackground.style.display = "none";
  // modalContainer.remove();
  // modalBackground.remove();
  // document.body.style.overflow = "";
}
// ===========================================================

function setResultTime() {
  const elapsed = stopWatchInstance.stop();
  const seconds = Math.floor(elapsed / 1000) % 60;
  const minutes = Math.floor(elapsed / 60000);
  
  resultTime.elapsed = elapsed;
  resultTime.time = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function saveGameResults(outcome) {
  const data = {
    selectedMode: gameMode,
    finalScore: gameScore,
    outcome: outcome,
    time: resultTime,
    movesTotal: movesTotal,
  }

  currentGameResult = structuredClone(data);

  const key = "PairEmGameStats";

  let resultsOld = JSON.parse(localStorage.getItem(key)) || [];

  resultsOld.unshift(data);
  resultsOld = resultsOld.slice(0, 5);

  localStorage.setItem(key, JSON.stringify(resultsOld));
}

function getGameResults() {
  return JSON.parse(localStorage.getItem("PairEmGameStats"));
}