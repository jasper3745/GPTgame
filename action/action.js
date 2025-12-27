const player = document.getElementById("player");
const game = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const scoreDisplay = document.getElementById("score");
const backBtn = document.getElementById("backToMenu");

let x = 380, y = 230;
let speed = 10;
let keys = { w: false, a: false, s: false, d: false };
let lastKeyTime = {};
let enemies = [];
let score = 0;
let gameRunning = false;
let isDashing = false;
let dashCooldown = 0;

/* ============================
   게임 시작
============================ */
startBtn.addEventListener("click", startGame);

function startGame() {
  startBtn.style.display = "none";
  game.style.display = "block";
  gameRunning = true;
  score = 0;
  scoreDisplay.textContent = "점수: 0";
  enemies.forEach(e => e.remove());
  enemies = [];
  spawnEnemy();
  setInterval(spawnEnemy, 1500);
  gameLoop();
}

/* ============================
   이동 + 대쉬
============================ */
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (!["w", "a", "s", "d"].includes(key)) return;
  if (!keys[key]) {
    const now = Date.now();
    if (lastKeyTime[key] && now - lastKeyTime[key] < 200) triggerDash();
    lastKeyTime[key] = now;
  }
  keys[key] = true;
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (!["w", "a", "s", "d"].includes(key)) return;
  keys[key] = false;
});

function triggerDash() {
  const now = Date.now();
  if (isDashing || now < dashCooldown) return;
  isDashing = true;
  dashCooldown = now + 600;
  const originalSpeed = speed;
  speed = 30;
  setTimeout(() => {
    speed = 5;
    setTimeout(() => { speed = originalSpeed; isDashing = false; }, 400);
  }, 200);
}

/* ============================
   공격 (클릭 방향 휘두르기)
============================ */
// document.addEventListener("mousedown", (e) => {
//   if (!gameRunning) return;

//   const rect = game.getBoundingClientRect();
//   const clickX = e.clientX - rect.left;
//   const clickY = e.clientY - rect.top;

//   const playerCenterX = x + player.offsetWidth / 2;
//   const playerCenterY = y + player.offsetHeight / 2;

//   // 클릭 방향 각도 계산
//   const dx = clickX - playerCenterX;
//   const dy = clickY - playerCenterY;
//   const angle = Math.atan2(dy, dx);

//   // ✅ 플레이어 중심 기준으로 정확히 회전하는 슬래시 생성
//   const slash = document.createElement("div");
//   slash.classList.add("slash");
//   slash.style.left = `${playerCenterX}px`;
//   slash.style.top = `${playerCenterY}px`;
//   slash.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
//   game.appendChild(slash);

//   setTimeout(() => slash.remove(), 250);

//   // 공격 판정
//   const slashLength = 180;
//   enemies.forEach((enemy, i) => {
//     const ex = parseFloat(enemy.style.left) + 20;
//     const ey = parseFloat(enemy.style.top) + 20;
//     const vx = ex - playerCenterX;
//     const vy = ey - playerCenterY;
//     const proj = (vx * Math.cos(angle)) + (vy * Math.sin(angle));
//     const perp = Math.abs(-vx * Math.sin(angle) + vy * Math.cos(angle));
//     if (proj > -slashLength / 2 && proj < slashLength / 2 && perp < 25) {
//       enemy.remove();
//       enemies.splice(i, 1);
//       score += 100;
//       scoreDisplay.textContent = `점수: ${score}`;
//     }
//   });
// });
document.addEventListener("mousedown", (e) => {
  if (!gameRunning) return;

  const rect = game.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const playerWidth = player.offsetWidth;
  const playerHeight = player.offsetHeight;
  const playerCenterX = x + playerWidth / 2;
  const playerCenterY = y + playerHeight / 2;

  // 방향 계산
  const dx = clickX - playerCenterX;
  const dy = clickY - playerCenterY;
  const angle = Math.atan2(dy, dx);

  // 레이저(slash) 생성 및 배치
  const slash = document.createElement("div");
  slash.classList.add("slash");
  
  // 시작점을 플레이어의 정중앙으로 설정
  slash.style.left = `${playerCenterX}px`;
  slash.style.top = `${playerCenterY}px`;
  
  // transform-origin이 'left center'이므로 플레이어 중심에서 마우스 방향으로 회전함
  slash.style.transform = `rotate(${angle}rad)`;
  game.appendChild(slash);

  // 잠깐 보여주고 제거 (애니메이션 효과)
  setTimeout(() => {
    slash.style.opacity = "0";
    setTimeout(() => slash.remove(), 100);
  }, 150);

  /* ============================
     레이저 공격 판정
  ============================ */
  const laserLength = 300; // CSS의 width와 일치시킴
  const laserWidth = 20;   // 판정 두께

  // 배열 역순 순회 (제거 시 인덱스 꼬임 방지)
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const ex = parseFloat(enemy.style.left) + 20; // 적 중심 x
    const ey = parseFloat(enemy.style.top) + 20;  // 적 중심 y

    const vx = ex - playerCenterX;
    const vy = ey - playerCenterY;

    // 플레이어-적 사이의 거리를 레이저 방향으로 투영(Dot Product)
    const distOnBeam = (vx * Math.cos(angle)) + (vy * Math.sin(angle));
    // 레이저 중심선과의 수직 거리
    const distFromBeam = Math.abs(-vx * Math.sin(angle) + vy * Math.cos(angle));

    // 판정 범위: 레이저 길이 내에 있고, 두께(laserWidth) 안에 들어왔는가?
    if (distOnBeam > 0 && distOnBeam < laserLength && distFromBeam < laserWidth) {
      enemy.remove();
      enemies.splice(i, 1);
      score += 100;
      scoreDisplay.textContent = `점수: ${score}`;
    }
  }
});

/* ============================
   적 스폰 + 이동 + 루프
============================ */
function spawnEnemy() {
  if (!gameRunning) return;
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = `${Math.random() * 760}px`;
  enemy.style.top = `${Math.random() * 460}px`;
  game.appendChild(enemy);
  enemies.push(enemy);
}

function moveEnemies() {
  enemies.forEach((enemy) => {
    const ex = parseFloat(enemy.style.left);
    const ey = parseFloat(enemy.style.top);
    const dx = x - ex;
    const dy = y - ey;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveX = (dx / dist) * 1.2;
    const moveY = (dy / dist) * 1.2;
    enemy.style.left = `${ex + moveX}px`;
    enemy.style.top = `${ey + moveY}px`;

    // 충돌 시 게임오버
    if (x < ex + 40 && x + 40 > ex && y < ey + 40 && y + 40 > ey) {
      gameOver();
    }
  });
}

function gameOver() {
  gameRunning = false;
  alert(`💀 게임 오버! 점수: ${score}`);
  startBtn.style.display = "inline-block";
  game.style.display = "none";
}

function gameLoop() {
  if (!gameRunning) return;
  if (keys.w) y -= speed;
  if (keys.s) y += speed;
  if (keys.a) x -= speed;
  if (keys.d) x += speed;

  x = Math.max(0, Math.min(game.clientWidth - 40, x));
  y = Math.max(0, Math.min(game.clientHeight - 40, y));

  player.style.left = `${x}px`;
  player.style.top = `${y}px`;

  moveEnemies();
  requestAnimationFrame(gameLoop);
}

backBtn.addEventListener("click", () => {
  window.location.href = "../index.html";
});

