const socket = io();

const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const roomIdInput = document.getElementById('roomIdInput');
const submitWordBtn = document.getElementById('submitWord');
const secretWordInput = document.getElementById('secretWord');
const guessSection = document.getElementById('guessSection');
const guessInput = document.getElementById('guessInput');
const submitGuessBtn = document.getElementById('submitGuess');
const gameStatus = document.getElementById('gameStatus');

let roomId = null;
let playerId = null;

createRoomBtn.addEventListener('click', () => {
  socket.emit('createRoom');
});

joinRoomBtn.addEventListener('click', () => {
  const id = roomIdInput.value.trim();
  if (id) {
    socket.emit('joinRoom', id);
  }
});

submitWordBtn.addEventListener('click', () => {
  const word = secretWordInput.value.trim();
  if (word.length === 5) {
    socket.emit('submitWord', { roomId, word });
    document.getElementById('wordSubmission').style.display = 'none';
    gameStatus.textContent = 'Waiting for opponent...';
  }
});

submitGuessBtn.addEventListener('click', () => {
  const guess = guessInput.value.trim();
  if (guess.length === 5) {
    socket.emit('makeGuess', { roomId, guess });
    guessInput.value = '';
  }
});

socket.on('roomCreated', (id) => {
  roomId = id;
  playerId = socket.id;
  lobby.style.display = 'none';
  game.style.display = 'block';
  gameStatus.textContent = `Room created. Share this ID with your opponent: ${roomId}`;
});

socket.on('roomJoined', (id) => {
  roomId = id;
  playerId = socket.id;
  lobby.style.display = 'none';
  game.style.display = 'block';
  gameStatus.textContent = 'Room joined. Submit your secret word.';
});

socket.on('startGame', () => {
  gameStatus.textContent = 'Game started! Make your guess.';
  guessSection.style.display = 'block';
});

socket.on('guessMade', ({ player, guess, result }) => {
  const resultStr = result.map((color, index) => `${guess[index]}: ${color}`).join(', ');
  gameStatus.textContent = `Player ${player === playerId ? 'You' : 'Opponent'} guessed: ${resultStr}`;
});

socket.on('nextTurn', (currentPlayer) => {
  if (currentPlayer === playerId) {
    gameStatus.textContent = 'Your turn to guess.';
  } else {
    gameStatus.textContent = 'Waiting for opponent\'s guess.';
  }
});

socket.on('gameOver', ({ winner, words }) => {
  const winnerText = winner === playerId ? 'You won!' : 'You lost.';
  gameStatus.textContent = `${winnerText} Your word: ${words[playerId]}, Opponent's word: ${words[Object.keys(words).find(id => id !== playerId)]}`;
  guessSection.style.display = 'none';
});

socket.on('playerDisconnected', () => {
  gameStatus.textContent = 'Opponent disconnected. Game over.';
  guessSection.style.display = 'none';
});
