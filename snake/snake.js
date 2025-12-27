const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const info = document.getElementById("info");
const backBtn = document.getElementById("backToMenu");

let box = 20;
let snake = [];
let direction = "RIGHT";
let foods = [];
let score = 0;
let gameLoop = null;
let foodSpawnLoop = null;
let speed = 150;
let evoStage = 1;
let color = "#00ff88";
const MAX_FOOD = 5; // 🍎 한 번에 존재할 수 있는 최대 먹이 수
const FOOD_INTERVAL = 2000; // 2초마다 새 먹이 등장

/* =============================
   메뉴로 돌아가기
============================= */
backBtn.addEventListener("click", () => {
  window.location.href = "../index.html";
});

function stopGame() {
  if (gameLoop) clearInterval(gameLoop);
  if (foodSpawnLoop) clearInterval(foodSpawnLoop);
  gameLoop = null;
  foodSpawnLoop = null;
}

/* =============================
   게임 시작
============================= */
startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  canvas.style.display = "block";
  initGame();
});

function initGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  score = 0;
  evoStage = 1;
  color = "#00ff88";
  speed = 150;
  foods = [];

  stopGame();

  // 🎯 일정 시간마다 먹이 자동 생성
  foodSpawnLoop = setInterval(spawnFood, FOOD_INTERVAL);

  gameLoop = setInterval(draw, speed);
}

/* =============================
   먹이 생성 (최대 개수 제한)
============================= */
function spawnFood() {
  if (foods.length >= MAX_FOOD) return;
  const newFood = {
    x: Math.floor(Math.random() * 29 + 1) * box,
    y: Math.floor(Math.random() * 29 + 1) * box
  };
  foods.push(newFood);
}

/* =============================
   방향키
============================= */
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "a" && direction !== "RIGHT") direction = "LEFT";
  else if (key === "d" && direction !== "LEFT") direction = "RIGHT";
  else if (key === "w" && direction !== "DOWN") direction = "UP";
  else if (key === "s" && direction !== "UP") direction = "DOWN";
});

/* =============================
   메인 루프
============================= */
function draw() {
  // 배경
  ctx.fillStyle = "#001122";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 🍎 모든 먹이 그리기
  for (const f of foods) {
    ctx.fillStyle = "red";
    ctx.fillRect(f.x, f.y, box, box);
  }

  // 🐍 뱀 그리기
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? color : "#00aa66";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // 머리 이동
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // 충돌
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(snakeX, snakeY, snake)
  ) {
    stopGame();
    alert(`💀 게임 오버! 점수: ${score}`);
    canvas.style.display = "none";
    startBtn.style.display = "inline-block";
    return;
  }

  // 🍎 먹이 먹기
  let ate = false;
  for (let i = 0; i < foods.length; i++) {
    if (snakeX === foods[i].x && snakeY === foods[i].y) {
      score++;
      foods.splice(i, 1);
      ate = true;
      if (score % 5 === 0) evolveSnake();
      break;
    }
  }

  if (!ate) snake.pop(); // 안 먹으면 꼬리 제거

  const newHead = { x: snakeX, y: snakeY };
  snake.unshift(newHead);

  info.textContent = `점수: ${score} | 진화 단계: ${evoStage}`;
}

/* =============================
   충돌 판정
============================= */
function collision(x, y, array) {
  for (let i = 0; i < array.length; i++) {
    if (x === array[i].x && y === array[i].y) {
      return true;
    }
  }
  return false;
}

/* =============================
   진화 시스템
============================= */
function evolveSnake() {
  evoStage++;
  if (speed > 60) {
    speed -= 15;
    stopGame();
    gameLoop = setInterval(draw, speed);
    foodSpawnLoop = setInterval(spawnFood, FOOD_INTERVAL);
  }
  const colors = ["#00ff88", "#00bfff", "#ffcc00", "#ff6600", "#ff00cc"];
  color = colors[(evoStage - 1) % colors.length];
}
