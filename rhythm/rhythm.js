const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const music = document.getElementById("music");
const judgementText = document.getElementById("judgement");
const judgeLine = document.getElementById("judge-line");
const difficultySelect = document.getElementById("difficulty");

let lanes = ["A", "S", "D"];
let notes = [];
let score = 0;
let combo = 0;
let gameRunning = false;
let fallSpeed = 10;
let nextNoteTimeout;

let currentDifficulty = "normal"; // 기본 난이도

startBtn.addEventListener("click", startGame);
difficultySelect.addEventListener("change", (e) => {
  currentDifficulty = e.target.value;
});

/* 🎮 난이도별 설정값 */
function getDifficultySettings() {
  switch (currentDifficulty) {
    case "easy":
      return { fallSpeed: 7, minDelay: 800, maxDelay: 1400, prob2: 0.15, prob3: 0.02 };
    case "hard":
      return { fallSpeed: 12, minDelay: 300, maxDelay: 700, prob2: 0.4, prob3: 0.15 };
    default: // normal
      return { fallSpeed: 10, minDelay: 400, maxDelay: 1000, prob2: 0.25, prob3: 0.05 };
  }
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  combo = 0;
  notes = [];
  updateScore();

  message.textContent = `🎵 ${currentDifficulty.toUpperCase()} 난이도 - 노트를 맞춰라!`;
  startBtn.style.display = "none";
  difficultySelect.style.display = "none";

  music.currentTime = 0;
  music.play();

  const settings = getDifficultySettings();
  fallSpeed = settings.fallSpeed;

  spawnNoteRandom();
  requestAnimationFrame(updateGame);
}

/* 🎵 랜덤 타이밍 + 다중 노트 생성 */
function spawnNoteRandom() {
  if (!gameRunning) return;

  const settings = getDifficultySettings();

  // 확률 기반 동시 노트 개수
  const rand = Math.random();
  let noteCount;
  if (rand < 1 - settings.prob2 - settings.prob3) noteCount = 1;
  else if (rand < 1 - settings.prob3) noteCount = 2;
  else noteCount = 3;

  const usedLanes = [];

  for (let i = 0; i < noteCount; i++) {
    const availableLanes = lanes.filter(l => !usedLanes.includes(l));
    if (availableLanes.length === 0) break;

    const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    usedLanes.push(lane);

    const laneEl = document.getElementById("lane" + lane);
    const note = document.createElement("div");
    note.classList.add("note");
    note.dataset.lane = lane;
    note.y = 0;

    laneEl.appendChild(note);
    notes.push(note);
  }

  // 랜덤 딜레이
  const nextDelay = Math.random() * (settings.maxDelay - settings.minDelay) + settings.minDelay;
  nextNoteTimeout = setTimeout(spawnNoteRandom, nextDelay);
}

/* 🎮 게임 루프 */
function updateGame() {
  if (!gameRunning) return;

  notes.forEach((note, i) => {
    note.y += fallSpeed;
    note.style.top = `${note.y}px`;

    if (note.y > 600) {
      note.remove();
      notes.splice(i, 1);
      combo = 0;
      score = Math.max(0, score - 100);
      showJudgement("MISS", "red");
      updateScore();
    }
  });

  requestAnimationFrame(updateGame);
}

/* 🎹 키 입력 */
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
    score += 100;
    combo++;
    showJudgement("PERFECT!", "lime");
    createExplosion(laneEl);
    flashJudgeLine();
    updateScore();
    removeNote(hitNote);
  } else {
    combo = 0;
    score = Math.max(0, score - 100);
    showJudgement("MISS", "red");
    updateScore();
  }
});

/* ⚙️ 헬퍼 함수들 */
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

function createExplosion(laneEl) {
  const explosion = document.createElement("div");
  explosion.classList.add("explosion");
  explosion.style.left = `${laneEl.offsetLeft + 40}px`;
  explosion.style.top = `520px`;
  gameArea.appendChild(explosion);
  setTimeout(() => explosion.remove(), 400);
}

function flashJudgeLine() {
  judgeLine.classList.add("glow");
  setTimeout(() => judgeLine.classList.remove("glow"), 150);
}

/* 🎵 음악 끝 */
music.addEventListener("ended", () => {
  clearTimeout(nextNoteTimeout);
  gameRunning = false;
  message.textContent = `🎵 게임 종료! 총 점수: ${score}`;
  startBtn.style.display = "inline-block";
  difficultySelect.style.display = "inline-block";
});
