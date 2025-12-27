const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");
const difficultySelect = document.getElementById("difficulty");
const resetButton = document.getElementById("reset");
const gunSound = document.getElementById("gunSound");

let score = 0;
let spawnSpeed = 1000;
let targetLifetime = 1000;

// 🔹 저장된 난이도 불러오기 (기본: normal)
const savedDifficulty = localStorage.getItem("difficulty") || "normal";
difficultySelect.value = savedDifficulty;

// 🔹 난이도별 속도 설정
if (savedDifficulty === "easy") {
  spawnSpeed = 2500;
  targetLifetime = 2500;
} else if (savedDifficulty === "normal") {
  spawnSpeed = 1000;
  targetLifetime = 1000;
} else if (savedDifficulty === "hard") {
  spawnSpeed = 300;
  targetLifetime = 300;
}

// 🔹 난이도별 최고점수 로드
let bestScore = localStorage.getItem(`bestScore_${savedDifficulty}`) || 0;

updateScoreText();

// 난이도 변경 이벤트
difficultySelect.addEventListener("change", () => {
  const diff = difficultySelect.value;

  // 난이도별 설정값
  if (diff === "easy") {
    spawnSpeed = 2500;
    targetLifetime = 2500;
  } else if (diff === "normal") {
    spawnSpeed = 1000;
    targetLifetime = 1000;
  } else if (diff === "hard") {
    spawnSpeed = 300;
    targetLifetime = 300;
  }

  message.textContent = `난이도: ${
    diff === "easy" ? "쉬움" : diff === "normal" ? "보통" : "어려움"
  }`;

  // 🔸 선택한 난이도 저장
  localStorage.setItem("difficulty", diff);

  // 🔁 새로고침
  setTimeout(() => {
    location.reload();
  }, 300);
});

// 최고점수 리셋
resetButton.addEventListener("click", () => {
  localStorage.removeItem(`bestScore_${savedDifficulty}`);
  bestScore = 0;
  updateScoreText();
  message.textContent = `🏁 ${savedDifficulty.toUpperCase()} 최고점수 초기화 완료!`;
});

// 타깃 생성
function spawnTarget() {
  const target = document.createElement("div");
  target.classList.add("target");

  const x = Math.random() * (window.innerWidth - 80);
  const y = Math.random() * (window.innerHeight * 0.7 - 80);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.addEventListener("click", () => {
    gunSound.currentTime = 0;
    gunSound.play();

    score++;
    message.textContent = "🎯 명중!";
    target.remove();
    checkBestScore();
    updateScoreText();
  });

  setTimeout(() => {
    if (document.body.contains(target)) {
      target.remove();
      message.textContent = "❌ 놓쳤다!";
    }
  }, targetLifetime);

  gameArea.appendChild(target);
}

// 점수 갱신
function updateScoreText() {
  scoreDisplay.textContent = `난이도: ${savedDifficulty.toUpperCase()} | 점수: ${score} | 최고점수: ${bestScore}`;
}

// 최고점수 저장
function checkBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(`bestScore_${savedDifficulty}`, bestScore);
    message.textContent = "🏆 최고점수 갱신!";
  }
}

// 일정 간격으로 적 생성
setInterval(() => {
  spawnTarget();
}, spawnSpeed);
