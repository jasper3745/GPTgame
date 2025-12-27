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
let activeHolds = {}; // 현재 누르고 있는 롱노트 추적

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
  note.y = 0;

//   // 🔹 일정 확률로 롱노트 생성
//   if (Math.random() < 0.2) {
//     note.dataset.type = "hold";
//     note.dataset.length = Math.floor(100 + Math.random() * 200); // 길이 랜덤
//     note.style.height = `${note.dataset.length}px`;
//     note.style.background = "linear-gradient(#00bfff, #00ffaa)";
//   } else {
//     note.dataset.type = "tap";
//     note.dataset.length = 20;
//   }

//   laneEl.appendChild(note);
//   notes.push(note);
// }

function updateGame() {
  if (!gameRunning) return;

  notes.forEach((note, i) => {
    note.y += fallSpeed;
    note.style.top = `${note.y}px`;

    if (note.y > 600 + parseInt(note.dataset.length)) {
      note.remove();
      notes.splice(i, 1);
      combo = 0;
      showJudgement("MISS", "red");
      score -= 100;
      updateScore();
    }
  });

  requestAnimationFrame(updateGame);
}

document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  const key = e.key.toUpperCase();
  if (!lanes.includes(key)) return;

  const laneEl = document.getElementById("lane" + key);
  laneEl.classList.add("flash");
  setTimeout(() => laneEl.classList.remove("flash"), 100);

  // 현재 눌린 키 라인에 노트가 있는지 확인
  const hitNote = notes.find(
    (note) =>
      note.dataset.lane === key &&
      note.y > 450 &&
      note.y < 530
  );

  if (hitNote) {
    hitNote.classList.add("hit");

    if (hitNote.dataset.type === "tap") {
      // 🎯 짧은 노트 성공
      score += 100;
      combo++;
      showJudgement("PERFECT!", "lime");
      createExplosion(laneEl);
      flashJudgeLine();
      updateScore();
      removeNote(hitNote);
     } //else {
    //   // 🎯 롱노트 시작
    //   activeHolds[key] = hitNote;
    //   showJudgement("HOLD!", "#00ffff");
    //   createExplosion(laneEl);
    //   flashJudgeLine();
    // }

  } else {
    // ❌ 현재 라인에 노트가 없으면 MISS + 점수 감소
    combo = 0;
    score = Math.max(0, score - 100);
    showJudgement("MISS", "red");
    updateScore();
  }
});


/* 🎹 키에서 손 뗄 때 */
document.addEventListener("keyup", (e) => {
  const key = e.key.toUpperCase();
  if (!activeHolds[key]) return;

  const holdNote = activeHolds[key];
  const laneEl = document.getElementById("lane" + key);

  // // 🔹 롱노트 끝 (놓을 때 판정)
  // const noteBottom = holdNote.y + parseInt(holdNote.dataset.length);
  // if (noteBottom > 450 && noteBottom < 550) {
  //   score += 200;
  //   combo++;
  //   showJudgement("PERFECT END!", "aqua");
  //   createExplosion(laneEl);
  //   flashJudgeLine();
  // } else {
  //   combo = 0;
  //   showJudgement("MISS", "red");
  // }

  updateScore();
  removeNote(holdNote);
  delete activeHolds[key];
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
