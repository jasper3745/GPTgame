const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");
const startBtn = document.getElementById("startBtn");
const scoreText = document.getElementById("score");
const backBtn = document.getElementById("backToMenu");

let platforms = [];
let gravity = 0.4;
let velocity = 0;
let jumpPower = 10;
let isJumping = false;
let score = 0;
let gameRunning = false;

let playerX = 180;
let playerY = 100; // bottom 기준
let platformSpeed = 2;

// ✅ 이동 관련 플래그
let movingLeft = false;
let movingRight = false;
const moveSpeed = 4;

backBtn.addEventListener("click", () => {
  window.location.href = "../index.html";
});

startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  velocity = 0;
  playerY = 180;
  playerX = 180;

  platforms.forEach(p => p.remove());
  platforms = [];

  // 첫 발판 (안전 지대)
  createPlatform(160, 160);
  for (let i = 1; i < 6; i++) {
    createPlatform(Math.random() * 320, i * 100 + 100);
  }

  requestAnimationFrame(gameLoop);
}

function createPlatform(x, y) {
  const plat = document.createElement("div");
  plat.classList.add("platform");
  plat.style.left = `${x}px`;
  plat.style.bottom = `${y}px`;
  gameArea.appendChild(plat);
  platforms.push(plat);
}

// 🎮 키 입력
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  const key = e.key.toLowerCase();

  if (key === "a") movingLeft = true;
  if (key === "d") movingRight = true;
  if (key === "w" && !isJumping) {
    velocity = jumpPower;
    isJumping = true;
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();

  if (key === "a") movingLeft = false;
  if (key === "d") movingRight = false;
});

function gameLoop() {
  if (!gameRunning) return;

  // 이동 유지
  if (movingLeft) playerX -= moveSpeed;
  if (movingRight) playerX += moveSpeed;

  // 중력 적용
  velocity -= gravity * 1.1;
  playerY += velocity;

  // 캐릭터 이동
  player.style.left = `${playerX}px`;
  player.style.bottom = `${playerY}px`;

  // 발판 충돌 체크
  platforms.forEach((plat) => {
    const pX = parseFloat(plat.style.left);
    const pY = parseFloat(plat.style.bottom);

    if (
      playerX + 40 > pX &&
      playerX < pX + 80 &&
      playerY <= pY + 20 &&
      playerY >= pY &&
      velocity < 0
    ) {
      velocity = jumpPower;
      isJumping = false;
      score += 10;
      scoreText.textContent = `점수: ${score}`;
    }

    // 발판 이동
    plat.style.bottom = `${pY - platformSpeed}px`;

    if (pY < -10) {
      plat.remove();
      platforms.splice(platforms.indexOf(plat), 1);
      createPlatform(Math.random() * 320, 600);
    }
  });

  // 게임 오버
  if (playerY < 0) {
    gameRunning = false;
    alert(`💀 게임오버! 점수: ${score}`);
    return;
  }

  requestAnimationFrame(gameLoop);
}
