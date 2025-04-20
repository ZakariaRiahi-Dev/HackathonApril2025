let savedMessages = [];
let questionQueue = [];
let currentQuestionIndex = 0;
let testMode = false;  // <-- Toggle this to true for test mode!
let score = 0;  // Initialize score variable
let wrongAnswers = [];  // Array to store links of wrong answers

document.getElementById("modeIndicator").innerText = testMode ? "TEST MODE ACTIVE" : "";

// Add a message to the chat display
function addMessage(role, message) {
  const responseDiv = document.getElementById("response");
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + role;
  msgDiv.innerHTML = `<strong>${role === "user" ? "You" : "AI"}:</strong> ${message}`;
  responseDiv.appendChild(msgDiv);
  responseDiv.scrollTop = responseDiv.scrollHeight;
}

// Fetch questions from the server
function get_question() {
  if (testMode) {
    addMessage("ai", "Test Mode: Question fetching is disabled.");
    return;
  }

  const grade = document.getElementById("grade").value.trim();
  const location = document.getElementById("location").value.trim();
  const subject = document.getElementById("subject").value.trim();

  axios.post("https://hackathon-practice2025.onrender.com/api/generate/", { grade, location, subject })
    .then(response => {
      questionQueue = response.data.evaluation || [];
      currentQuestionIndex = 0;

      if (questionQueue.length > 0) {
        showCurrentQuestion();
      } else {
        addMessage("ai", "⚠ No questions received.");
      }
    })
    .catch(error => {
      console.error("Error fetching question:", error);
      addMessage("ai", "⚠ Could not connect to the server.");
    });
}

// Display the current question one at a time
function showCurrentQuestion() {
  const item = questionQueue[currentQuestionIndex];
  if (item) {
    const formatted = `📌 ${item.instructions}\n❓ ${item.question}`;
    addMessage("ai", formatted);
    savedMessages.push({ role: "ai", message: formatted });
  } else {
    addMessage("ai", "🎉 All questions completed!");
    addMessage("ai", `Your final score is: ${score} out of ${questionQueue.length}`);
    
    // Show the links for the questions that were wrong
    if (wrongAnswers.length > 0) {
      addMessage("ai", "Here are some resources to help you learn more about the topics you missed:");
      wrongAnswers.forEach(link => {
        addMessage("ai", `🔗 ${link}`);
      });
    }
  }
}

// Handle user input and send answer
function saveAndSend() {
  const inputEl = document.getElementById("input");
  const message = inputEl.value.trim();
  if (message === "") return;

  savedMessages.push({ role: "user", message });
  addMessage("user", message);

  // If answering a queued question
  if (questionQueue[currentQuestionIndex]) {
    const currentQuestion = questionQueue[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;  // Assuming the question object contains the correct answer
    const questionLink = currentQuestion.link;    // Assuming the question object contains a link to a learning resource

    // Check if the answer is correct
    if (message.toLowerCase() === correctAnswer.toLowerCase()) {
      score++;  // Increase the score if the answer is correct
    } else {
      // Track the wrong answer and store the link to the question
      wrongAnswers.push(questionLink);
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questionQueue.length) {
      showCurrentQuestion();
    } else {
      addMessage("ai", "🎉 All questions completed!");
      addMessage("ai", `Your final score is: ${score} out of ${questionQueue.length}`);
      
      // Show the links for the questions that were wrong
      if (wrongAnswers.length > 0) {
        addMessage("ai", "Here are some resources to help you learn more about the topics you missed:");
        wrongAnswers.forEach(link => {
          addMessage("ai", `🔗 ${link}`);
        });
      }
    }
  } else {
    // Fallback normal chat behavior
    axios.post("https://hackathon-practice2025.onrender.com/api/question/", { question: message })
      .then(response => {
        const aiResponse = response.data.answer;
        addMessage("ai", aiResponse);
        savedMessages.push({ role: "ai", message: aiResponse });
      })
      .catch(error => {
        console.error("Error sending message:", error);
        addMessage("ai", "⚠️ Could not connect to the server.");
      });
  }

  inputEl.value = "";
}

// Handle ENTER key for chat input
document.getElementById("input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveAndSend();
  }
});

// Handle popup form submission
document.getElementById("infoForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const grade = document.getElementById("grade").value.trim();
  const location = document.getElementById("location").value.trim();
  const subject = document.getElementById("subject").value.trim();

  if (grade && location && subject) {
    document.getElementById("popup").style.display = "none";
    document.getElementById("chatInputContainer").style.display = "flex";

    savedMessages.push({
      role: "system",
      message: `User Info - Grade: ${grade}, Location: ${location}, Subject: ${subject}`
    });

    get_question();  // Auto start question cycle
  }
});



// ----------------- Pomodoro Timer -----------------
let minutes = 25;
let seconds = 0;
let timerInterval;
let isRunning = false;
let onBreak = false;  // true when in break mode

function updateDisplay() {
  const display = document.getElementById("timer");
  display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  timerInterval = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timerInterval);
        isRunning = false;

        if (!onBreak) {
          // Switch to break
          onBreak = true;
          minutes = 5;
          seconds = 0;
          alert("Pomodoro complete! Take a 5-minute break.");
          updateDisplay();
          startTimer(); // Auto-start break
        } else {
          // Switch back to Pomodoro
          onBreak = false;
          minutes = 25;
          seconds = 0;
          alert("Break over! Time to focus again.");
          updateDisplay();
          startTimer(); // Auto-start Pomodoro
        }
        return;
      }
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }
    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  onBreak = false;
  minutes = 25;
  seconds = 0;
  updateDisplay();
}

updateDisplay();  // Show initial 25:00 on load