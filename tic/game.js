const cells = document.querySelectorAll('.cell');
const statusEl = document.querySelector('#status');
const resetBtn = document.querySelector('#reset');
const modeToggleBtn = document.querySelector('#modeToggle');
const scoreXEl = document.querySelector('#scoreX');
const scoreOEl = document.querySelector('#scoreO');
const scoreDrawsEl = document.querySelector('#scoreDraws');


let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let mode = 'simple'; // 'simple' = 2-player, 'ai' = minimax AI
let scoreX = 0;
let scoreO = 0;
let scoreDraws = 0;

const HUMAN = 'X';
const AI = 'O';

const WIN_CONDITIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinningCombo(boardState, player) {
  return WIN_CONDITIONS.find(combo =>
    combo.every(index => boardState[index] === player)
  ) || null;
}

function checkWin(boardState, player) {
  return getWinningCombo(boardState, player) !== null;
}

function checkDraw(boardState) {
  return boardState.every(cell => cell !== '');
}

function updateScoreboard() {
  scoreXEl.textContent = scoreX;
  scoreOEl.textContent = scoreO;
  scoreDrawsEl.textContent = scoreDraws;
}

function updateStatus() {
  if (!gameActive) return;

  if (mode === 'simple') {
    showNormalStatus(`Player ${currentPlayer}'s turn`);
  } else {
    if (currentPlayer === HUMAN) {
      showNormalStatus('Your turn (X)');
    } else {
      showThinkingStatus();
    }
  }
}

function showThinkingStatus() {
  statusEl.classList.add('thinking');
  statusEl.innerHTML = `Thinking<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>`;
}

function showNormalStatus(text) {
  statusEl.classList.remove('thinking');
  statusEl.textContent = text;
}

function placeMark(index, player) {
  board[index] = player;
  const cell = document.querySelector(`.cell[data-index="${index}"]`);
  clearPreview(cell);
  cell.textContent = player;
  cell.classList.add(player.toLowerCase(), 'taken');
}

function showPreview(cell, index) {
    if (!gameActive || board[index] !=='')return;

    if (mode === 'simple') {
        cell.dataset.preview = currentPlayer;
        cell.classList.add(currentPlayer === 'X' ? 'preview-x' : 'preview-o');
    } else {
        if (currentPlayer !== HUMAN)return;
    cell.dataset.preview = HUMAN;
    cell.classList.add('preview-x');
  }
}

function clearPreview(cell) {
  cell.classList.remove('preview-x', 'preview-o');
  cell.removeAttribute('data-preview');
}

function highlightWinningCells(combo) {
  combo.forEach(index => {
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.classList.add('winning-cell');
  });
}

function endIfFinished(playerJustMoved) {
  const winningCombo = getWinningCombo(board, playerJustMoved);

if (winningCombo) {
  highlightWinningCells(winningCombo);

  if (playerJustMoved === 'X') {
    scoreX++;
  } else {
    scoreO++;
  }
  updateScoreboard();

  if (mode === 'simple') {
    statusEl.textContent = `Player ${playerJustMoved} wins!`;
  } else {
    statusEl.textContent = playerJustMoved === HUMAN ? 'You win!' : 'AI wins!';
  }

  gameActive = false;
  return true;
}

if (checkDraw(board)) {
  scoreDraws++;
  updateScoreboard();

  statusEl.textContent = "It's a draw!";
  gameActive = false;
  return true;
}

  return false;
}

function minimax(boardState, isMaximizing) {
  if (checkWin(boardState, AI)) return 10;
  if (checkWin(boardState, HUMAN)) return -10;
  if (checkDraw(boardState)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (boardState[i] === '') {
        boardState[i] = AI;
        const score = minimax(boardState, false);
        boardState[i] = '';
        bestScore = Math.max(bestScore, score);
      }
    }

    return bestScore;
  } else {
    let bestScore = Infinity;

    for (let i = 0; i < 9; i++) {
      if (boardState[i] === '') {
        boardState[i] = HUMAN;
        const score = minimax(boardState, true);
        boardState[i] = '';
        bestScore = Math.min(bestScore, score);
      }
    }

    return bestScore;
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestIndex = null;

  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = AI;
      const score = minimax(board, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
  }

  return bestIndex;
}

function handleSimpleMove(index) {
  if (!gameActive || board[index] !== '') return;

  placeMark(index, currentPlayer);

  if (endIfFinished(currentPlayer)) return;

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
}

function handleAiMove(index) {
  if (!gameActive || board[index] !== '') return;
  if (currentPlayer !== HUMAN) return;

  placeMark(index, HUMAN);

if (endIfFinished(HUMAN)) return;

  currentPlayer = AI;
  updateStatus();

  setTimeout(() => {
    if (!gameActive) return;

    const aiIndex = getBestMove();
    if (aiIndex === null) return;

    placeMark(aiIndex, AI);

    if (endIfFinished(AI)) return;

    currentPlayer = HUMAN;
    updateStatus();
  }, 500);
}

function handleCellClick(event) {
  const index = Number(event.target.dataset.index);

  if (mode === 'simple') {
    handleSimpleMove(index);
  } else {
    handleAiMove(index);
  }
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';

  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'taken', 'winning-cell');
    cell.classList.remove('preview-x', 'preview-o');
    cell.removeAttribute('data-preview');
  });

  modeToggleBtn.textContent=mode=== 'simple' ? 'Mode: 2 Player' : 'Mode: Vs AI';
  updateStatus();
}

function toggleMode() {
  mode = mode === 'simple' ? 'ai' : 'simple';
  modeToggleBtn.textContent = mode === 'simple' ? 'Mode: 2 Player' : 'Mode: Vs AI';
  resetGame();
}

cells.forEach(cell => {
  cell.addEventListener('click', handleCellClick);

  cell.addEventListener('mouseenter', () => {
    const index = Number(cell.dataset.index);
    showPreview(cell, index);
  });

  cell.addEventListener('mouseleave', () => {
    clearPreview(cell);
  });
});

resetBtn.addEventListener('click', resetGame);
modeToggleBtn.addEventListener('click', toggleMode);

updateScoreboard();
updateStatus();

// ================================
// BACK TO MINIGAMES BUTTON
// ================================

const backBtn = document.getElementById("backToGames");

if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "../minigames.html";
  });
}