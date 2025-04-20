let savedMessages = [];
let questionQueue = [];
let currentQuestionIndex = 0;
let testMode = false;
let score = 0;
let wrongAnswers = [];

document.getElementById("modeIndicator").innerText = testMode ? "TEST MODE ACTIVE" : "";

function addMessage(role, message) {
  const responseDiv = document.getElementById("response");
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + role;
  msgDiv.innerHTML = `<strong>${role === "user" ? "You" : "AI"}:</strong> ${message}`;
  responseDiv.appendChild(msgDiv);
  responseDiv.scrollTop = responseDiv.scrollHeight;
}

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

function showCurrentQuestion() {
  const item = questionQueue[currentQuestionIndex];
  if (item) {
    const formatted = `📌 ${item.instructions}\n❓ ${item.question}`;
    addMessage("ai", formatted);
    savedMessages.push({ role: "ai", message: formatted });
  } else {
    addMessage("ai", "🎉 All questions completed!");
    addMessage("ai", `Your final score is: ${score} out of ${questionQueue.length}`);
    if (wrongAnswers.length > 0) {
      addMessage("ai", "Here are some resources to help you learn more about the topics you missed:");
      wrongAnswers.forEach(link => {
        addMessage("ai", `🔗 ${link}`);
      });
    }
  }
}

function SendandSave(message, currentQuestion) {
  console.log("Sending to question API:", message);
  return axios.post("https://hackathon-practice2025.onrender.com/api/check/", {
      question: currentQuestion,
      answer: message
    })
    .then(response => {
      const result = response.data.evaluation[0];
      return {
        c_or_i: result.correct_or_incorrect,
        link: result.link,
        answer: result.correct_answer
      };
    })
    .catch(error => {
      console.error("Error checking answer:", error);
      addMessage("ai", "⚠ Could not connect to the server.");
      return { c_or_i: "error", link: null, answer: null };
    });
}

function saveAndSend() {
  const inputEl = document.getElementById("input");
  const message = inputEl.value.trim();
  if (message === "") return;

  savedMessages.push({ role: "user", message });
  addMessage("user", message);

  if (questionQueue[currentQuestionIndex]) {
    const currentQuestion = questionQueue[currentQuestionIndex];

    SendandSave(message, currentQuestion).then(({ c_or_i, link }) => {
      if (c_or_i === "correct") {
        score++;
      } else if (link) {
        wrongAnswers.push(link);
      }

      currentQuestionIndex++;
      if (currentQuestionIndex < questionQueue.length) {
        showCurrentQuestion();
      } else {
        addMessage("ai", "🎉 All questions completed!");
        addMessage("ai", `Your final score is: ${score} out of ${questionQueue.length}`);
        if (wrongAnswers.length > 0) {
          addMessage("ai", "Here are some resources to help you learn more about the topics you missed:");
          wrongAnswers.forEach(link => {
            addMessage("ai", `🔗 ${link}`);
          });
        }
      }
    });
  } else {
    axios.post("https://hackathon-practice2025.onrender.com/api/question/", { question: message })
      .then(response => {
        const aiResponse = response.data.response;
        addMessage("ai", aiResponse);
        savedMessages.push({ role: "ai", message: aiResponse });
      })
      .catch(error => {
        console.error("Error sending message:", error);
        addMessage("ai", "⚠ Could not connect to the server.");
      });
  }

  inputEl.value = "";
}

document.getElementById("input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveAndSend();
  }
});

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

    get_question();
  }
});