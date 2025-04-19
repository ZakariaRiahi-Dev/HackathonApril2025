let savedMessages = [];

// Add a message to the chat
function addMessage(role, message) {
  const responseDiv = document.getElementById("response");
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + role;
  msgDiv.innerHTML = `<strong>${role === "user" ? "You" : "AI"}:</strong> ${message}`;
  responseDiv.appendChild(msgDiv);
  responseDiv.scrollTop = responseDiv.scrollHeight;
}

// Fetch question from the server
function get_question() {
    const grade = document.getElementById("grade").value.trim();
    const location = document.getElementById("location").value.trim();
    const subject = document.getElementById("subject").value.trim();
  
    axios.post("https://hackathon-practice2025.onrender.com/api/generate/", {
      grade,
      location,
      subject
    })
      .then(response => {
        const questions = response.data.evaluation;
  
        if (Array.isArray(questions)) {
          const formatted = questions.map(item => {
            return `${item.instructions}\n${item.question}`;
          }).join("\n\n");
  
          addMessage("ai", formatted);
          savedMessages.push({ role: "ai", message: formatted });
        } else {
          addMessage("ai", "⚠ Unexpected response format.");
        }
      })
      .catch(error => {
        console.error("Error fetching question:", error);
        addMessage("ai", "⚠ Could not connect to the server.");
      });
  }

// Handle user input and send question
function saveAndSend() {
  const inputEl = document.getElementById("input");
  const message = inputEl.value.trim();
  if (message === "") return;

  savedMessages.push({ role: "user", message });
  addMessage("user", message);

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

  inputEl.value = "";
}

// Handle enter key for sending
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

    get_question(); // Optional: auto-get question after form
  }
});


// ----------------- Pomodoro Timer -----------------
let minutes = 25;
let seconds = 0;
let timerInterval;
let isRunning = false;

function updateDisplay() {
  const display = document.getElementById("timer");
  display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
  if (isRunning) return; // Prevent multiple intervals
  isRunning = true;
  timerInterval = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timerInterval);
        isRunning = false;
        alert("Pomodoro finished! Take a break.");
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
  minutes = 25;
  seconds = 0;
  updateDisplay();
}

updateDisplay(); // Initial call