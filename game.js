const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreValue = document.getElementById("scoreValue");
const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalScore = document.getElementById("finalScore");
const startGameBtn = document.getElementById("startGameBtn");
const restartGameBtn = document.getElementById("restartGameBtn");

const GROUND_Y = 300;
const PLAYER_SIZE = 38;
const PLAYER_X = 110;
const GRAVITY = 0.72;
const BASE_JUMP = -12.8;
const HOLD_FORCE = -0.22;
const MAX_HOLD_FRAMES = 13;
const INITIAL_SPEED = 6.2;
const SPEED_INCREASE = 0.0022;

let animationId = null;
let running = false;
let gameOver = false;

let score = 0;
let elapsedFrames = 0;
let gameSpeed = INITIAL_SPEED;
let spawnTimer = 0;
let jumpHeld = false;
let jumpHoldFrames = 0;

const player = {
  x: PLAYER_X,
  y: GROUND_Y - PLAYER_SIZE,
  size: PLAYER_SIZE,
  vy: 0,
  rotation: 0
};

let obstacles = [];

function resetGame() {
  running = false;
  gameOver = false;
  score = 0;
  elapsedFrames = 0;
  gameSpeed = INITIAL_SPEED;
  spawnTimer = randomBetween(70, 120);
  jumpHeld = false;
  jumpHoldFrames = 0;

  player.y = GROUND_Y - PLAYER_SIZE;
  player.vy = 0;
  player.rotation = 0;

  obstacles = [];
  updateScore();
}

function startGame() {
  resetGame();
  running = true;
  startOverlay.classList.remove("show");
  gameOverOverlay.classList.remove("show");
}

function endGame() {
  running = false;
  gameOver = true;
  finalScore.textContent = score;
  gameOverOverlay.classList.add("show");
}

function updateScore() {
  scoreValue.textContent = score;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnObstacle() {
  const size = randomBetween(34, 52);

  obstacles.push({
    x: canvas.width + 40,
    y: GROUND_Y,
    size,
    counted: false
  });
}

function isGrounded() {
  return player.y >= GROUND_Y - player.size - 0.1;
}

function beginJump() {
  jumpHeld = true;

  if (!running || gameOver) return;

  if (isGrounded()) {
    player.vy = BASE_JUMP;
    jumpHoldFrames = 0;
  }
}

function endJump() {
  jumpHeld = false;
}

function updatePlayer() {
  if (jumpHeld && player.vy < 0 && jumpHoldFrames < MAX_HOLD_FRAMES) {
    player.vy += HOLD_FORCE;
    jumpHoldFrames++;
  }

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y >= GROUND_Y - player.size) {
    player.y = GROUND_Y - player.size;
    player.vy = 0;
    player.rotation = 0;
  } else {
    player.rotation += 0.08;
  }
}

function updateObstacles() {
  spawnTimer--;

  if (spawnTimer <= 0) {
    spawnObstacle();
    const minGap = Math.max(55, 95 - gameSpeed * 2);
    const maxGap = Math.max(95, 155 - gameSpeed * 2);
    spawnTimer = randomBetween(minGap, maxGap);
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.x -= gameSpeed;

    if (!obstacle.counted && obstacle.x + obstacle.size < PLAYER_X) {
      obstacle.counted = true;
      score++;
      updateScore();
    }

    if (obstacle.x + obstacle.size < -80) {
      obstacles.splice(i, 1);
    }
  }
}

function checkCollision() {
  const playerLeft = player.x + 4;
  const playerRight = player.x + player.size - 4;
  const playerTop = player.y + 4;
  const playerBottom = player.y + player.size - 2;

  for (const obstacle of obstacles) {
    const obsLeft = obstacle.x + 7;
    const obsRight = obstacle.x + obstacle.size - 7;
    const obsTop = obstacle.y - obstacle.size + 7;
    const obsBottom = obstacle.y - 7;

    const hit =
      playerRight > obsLeft &&
      playerLeft < obsRight &&
      playerBottom > obsTop &&
      playerTop < obsBottom;

    if (hit) {
      endGame();
      return;
    }
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#080c12");
  gradient.addColorStop(1, "#070b11");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.lineTo(canvas.width, 90);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 190);
  ctx.lineTo(canvas.width, 190);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 0.5);
  ctx.lineTo(canvas.width, GROUND_Y + 0.5);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.stroke();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
  ctx.rotate(player.rotation);
  ctx.fillStyle = "#f6f7fb";
  ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
  ctx.restore();
}

function drawObstacle(obstacle) {
  const cx = obstacle.x + obstacle.size / 2;
  const cy = obstacle.y - obstacle.size / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);

  // camada externa escura/transparente
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(-obstacle.size / 2, -obstacle.size / 2, obstacle.size, obstacle.size);

  // camada interna branca
  const inner = obstacle.size * 0.34;
  ctx.fillStyle = "#f5f7fb";
  ctx.fillRect(-inner / 2, -inner / 2, inner, inner);

  ctx.restore();
}

function drawObstacles() {
  for (const obstacle of obstacles) {
    drawObstacle(obstacle);
  }
}

function gameLoop() {
  drawBackground();

  if (running) {
    elapsedFrames++;
    gameSpeed = INITIAL_SPEED + elapsedFrames * SPEED_INCREASE;

    updatePlayer();
    updateObstacles();
    checkCollision();
  }

  drawPlayer();
  drawObstacles();

  animationId = requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    beginJump();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    endJump();
  }
});

canvas.addEventListener("mousedown", beginJump);
canvas.addEventListener("mouseup", endJump);
canvas.addEventListener("mouseleave", endJump);

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  beginJump();
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  endJump();
}, { passive: false });

startGameBtn.addEventListener("click", startGame);
restartGameBtn.addEventListener("click", startGame);

resetGame();
gameLoop();
