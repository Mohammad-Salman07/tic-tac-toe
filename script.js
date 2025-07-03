let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#resetbtn");
let newGameBtn = document.querySelector("#newbtn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let turnIndicator = document.getElementById("turnIndicator");
let timerDisplay = document.getElementById("time");
let aiBtn = document.getElementById("aiBtn");
let friendBtn = document.getElementById("friendBtn");
let nameModal = document.querySelector(".name-modal");
let playerXInput = document.getElementById("playerX");
let playerOInput = document.getElementById("playerO");
let startGameBtn = document.getElementById("startGameBtn");

let chart, mode = "ai", count = 0;
let timeLeft = 10, timer;
let xWins = 0, oWins = 0, draws = 0;
let playerX = "X", playerO = "O";

const xScoreDisplay = document.getElementById("xScore");
const oScoreDisplay = document.getElementById("oScore");
const drawDisplay = document.getElementById("draws");

const clickSound = new Audio("https://www.fesliyanstudios.com/play-mp3/387");
const winSound = new Audio("https://www.fesliyanstudios.com/play-mp3/6676");
const drawSound = new Audio("https://www.fesliyanstudios.com/play-mp3/7018");

const winPatterns = [
  [0,1,2], [0,3,6], [0,4,8],
  [1,4,7], [2,5,8], [2,4,6],
  [3,4,5], [6,7,8]
];

startGameBtn.addEventListener("click", () => {
  if (playerXInput.value.trim() !== "") playerX = playerXInput.value;
  if (playerOInput.value.trim() !== "") playerO = playerOInput.value;
  nameModal.style.display = "none";
  resetGame();
});

function startTimer() {
  clearInterval(timer);
  timeLeft = 10;
  timerDisplay.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      if (mode === "ai") {
        disableBoxes();
        aiMove();
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function disableBoxes() {
  boxes.forEach(box => box.disabled = true);
}
function enableBoxes() {
  boxes.forEach(box => {
    if (box.innerText === "") box.disabled = false;
  });
}

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (box.innerText !== "" || msgContainer.classList.contains("show")) return;

    stopTimer();
    clickSound.play();

    if (mode === "friend") {
      const currentPlayer = count % 2 === 0 ? "X" : "O";
      box.innerText = currentPlayer;
      box.style.color = currentPlayer === "X" ? "#ff4757" : "#2ed573";
      box.disabled = true;
      count++;
      turnIndicator.textContent = `${count % 2 === 0 ? playerX : playerO}'s Turn (${count % 2 === 0 ? "X" : "O"})`;
      checkWinner();
    } else if (mode === "ai" && turnIndicator.innerText.includes("Your")) {
      box.innerText = "X";
      box.style.color = "#ff4757";
      box.disabled = true;
      count++;
      checkWinner();

      if (count < 9 && !msgContainer.classList.contains("show")) {
        turnIndicator.textContent = `AI's Turn (O)`;
        setTimeout(() => aiMove(), 500);
      }
    }
  });
});

function aiMove() {
  let available = Array.from(boxes).filter(box => box.innerText === "");
  if (available.length === 0) return;

  let box = available[Math.floor(Math.random() * available.length)];
  clickSound.play();
  box.innerText = "O";
  box.style.color = "#2ed573";
  box.disabled = true;
  count++;
  checkWinner();

  if (count < 9 && mode === "ai" && !msgContainer.classList.contains("show")) {
    turnIndicator.textContent = "Your Turn (X)";
    startTimer();
  }
}

function checkWinner() {
  for (let pattern of winPatterns) {
    let [a, b, c] = pattern;
    if (
      boxes[a].innerText &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[b].innerText === boxes[c].innerText
    ) {
      showWinner(boxes[a].innerText, pattern);
      return;
    }
  }

  if (count === 9) showWinner("Draw");
}

function showWinner(winner, pattern) {
  stopTimer();
  msg.innerText = winner === "Draw" ? "It's a Draw!" : `🎉 ${winner === "X" ? playerX : playerO} Wins!`;
  msgContainer.classList.add("show");

  if (winner === "X") {
    xWins++;
    xScoreDisplay.textContent = xWins;
    winSound.play();
  } else if (winner === "O") {
    oWins++;
    oScoreDisplay.textContent = oWins;
    winSound.play();
  } else {
    draws++;
    drawDisplay.textContent = draws;
    drawSound.play();
  }

  if (pattern && winner !== "Draw") {
    pattern.forEach(i => boxes[i].classList.add("win"));
  }

  disableBoxes();
  updateChart();
}

function resetGame() {
  count = 0;
  boxes.forEach(box => {
    box.innerText = "";
    box.disabled = false;
    box.classList.remove("win");
  });
  msgContainer.classList.remove("show");

  if (mode === "ai") {
    turnIndicator.textContent = "Your Turn (X)";
    startTimer();
  } else {
    turnIndicator.textContent = `${playerX}'s Turn (X)`;
    stopTimer();
  }
}

newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);

aiBtn.addEventListener("click", () => {
  mode = "ai";
  nameModal.style.display = "none";
  resetGame();
});

friendBtn.addEventListener("click", () => {
  mode = "friend";
  nameModal.style.display = "flex";
});

function updateChart() {
  const data = {
    labels: ['X Wins', 'O Wins', 'Draws'],
    datasets: [{
      label: 'Game Stats',
      data: [xWins, oWins, draws],
      backgroundColor: ['#ff4757', '#1e90ff', '#ffa502'],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  const config = {
    type: 'pie',
    data,
    options: {
      plugins: {
        legend: {
          labels: {
            color: document.body.classList.contains("dark") ? "#fff" : "#333"
          }
        }
      }
    }
  };

  if (chart) {
    chart.data = data;
    chart.options.plugins.legend.labels.color = document.body.classList.contains("dark") ? "#fff" : "#333";
    chart.update();
  } else {
    const ctx = document.getElementById('resultChart').getContext('2d');
    chart = new Chart(ctx, config);
  }
}

document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  updateChart();
});

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add("dark");
}

startTimer();
updateChart();
