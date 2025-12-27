const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const music = document.getElementById("music");
const judgementText = document.getElementById("judgement");
const judgeLine = document.getElementById("judge-line");

let lanes = ["A", "S", "D"];
let notes = [];
let score = 0;
let combo = 0;
let gameRunning = false;
let fallSpeed = 10;
let spawnInterval;

startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  combo = 0;
  updateScore();
  message.textContent = "🎵 위에서 내려오는 노트를 맞춰!";
  startBtn.style.display = "none";

  music.currentTime = 0;
  music.play();

  spawnInterval = setInterval(spawnNote, 900);
  requestAnimationFrame(updateGame);
}

function spawnNote() {
  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  const laneEl = document.getElementById("lane" + lane);

  const note = document.createElement("div");
  note.classList.add("note");
  note.dataset.lane = lane;
  note.dataset.type = "tap";
  note.dataset.length = 20;
  note.y = 0;

  laneEl.appendChild(note);
  notes.push(note);
}

function updateGame() {
  if (!gameRunning) return;

  notes.forEach((note, i) => {
    note.y += fallSpeed;
    note.style.top = `${note.y}px`;

    if (note.y > 600) {
      note.remove();
      notes.splice(i, 1);
      combo = 0;
      showJudgement("MISS", "red");
      score = Math.max(0, score - 100);
      updateScore();
    }
  });

  requestAnimationFrame(updateGame);
}

/* 🎹 키 누를 때 */
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  const key = e.key.toUpperCase();
  if (!lanes.includes(key)) return;

  const laneEl = document.getElementById("lane" + key);
  laneEl.classList.add("flash");
  setTimeout(() => laneEl.classList.remove("flash"), 100);

  const hitNote = notes.find(
    (note) =>
      note.dataset.lane === key &&
      note.y > 450 &&
      note.y < 530
  );

  if (hitNote) {
    // 🎯 짧은 노트 성공
    score += 100;
    combo++;
    showJudgement("PERFECT!", "lime");
    createExplosion(laneEl);
    flashJudgeLine();
    updateScore();
    removeNote(hitNote);
  } else {
    // ❌ 잘못된 타이밍
    combo = 0;
    score = Math.max(0, score - 100);
    showJudgement("MISS", "red");
    updateScore();
  }
});

function removeNote(note) {
  note.remove();
  notes = notes.filter((n) => n !== note);
}

function updateScore() {
  scoreDisplay.textContent = `점수: ${score} | 콤보: ${combo}`;
}

function showJudgement(text, color) {
  judgementText.textContent = text;
  judgementText.style.color = color;
  judgementText.classList.add("show");
  setTimeout(() => judgementText.classList.remove("show"), 300);
}

/* 💥 폭발 이펙트 */
function createExplosion(laneEl) {
  const explosion = document.createElement("div");
  explosion.classList.add("explosion");
  explosion.style.left = `${laneEl.offsetLeft + 40}px`;
  explosion.style.top = `520px`;
  gameArea.appendChild(explosion);
  setTimeout(() => explosion.remove(), 400);
}

/* ⚡ 판정선 빛 효과 */
function flashJudgeLine() {
  judgeLine.classList.add("glow");
  setTimeout(() => judgeLine.classList.remove("glow"), 150);
}

music.addEventListener("ended", () => {
  clearInterval(spawnInterval);
  gameRunning = false;
  message.textContent = `🎵 게임 종료! 총 점수: ${score}`;
  startBtn.style.display = "inline-block";
});
