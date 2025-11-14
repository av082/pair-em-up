
function createUI() {
  const gameContainer = document.createElement("div");
  gameContainer.className = "container";
  document.body.prepend(gameContainer);

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

  const timer = document.createElement("div");
  timer.textContent = "Timer";
  const score = document.createElement("div");
  score.textContent = "Score";
  const modes = document.createElement("div");
  modes.className = "mode";
  const modesTitle = document.createElement("p");
  modesTitle.textContent = "Mode:";
  const classicBtn = document.createElement("button");
  classicBtn.textContent = "Classic";
  const shuffleBtn = document.createElement("button");
  shuffleBtn.textContent = "Shuffle";
  const customBtn = document.createElement("button");
  customBtn.textContent = "Custom";
  modes.append(modesTitle, classicBtn, shuffleBtn, customBtn);
  controls.append(timer, score, modes);

  // add grid elements
  renderGridItems(mainMatrix);
  function renderGridItems(arr) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        const item = document.createElement("div");
        item.className = "play-item";
        item.dataset.row = `${i}`;
        item.dataset.col = `${j}`;
        item.textContent = `${arr[i][j]}`;
        grid.append(item);
      }
    }
  }

  grid.addEventListener("click", (e) => {
    const cell = e.target.closest(".play-item");
    if (!cell) return;

    handleSelection(cell);
    
  })
}

export { createUI };