// Game Logic
let currentQuestionIndex = 0;
let score = 0;
let level = 1;
let timeLeft = 1800; // 30 minutes in seconds
let interval;
let questions = [];
let progressBarWidth = 0;

async function fetchQuestions() {
    const response = await fetch('https://opentdb.com/api.php?amount=50&type=multiple');
    const data = await response.json();
    return data.results.map(q => ({
        question: q.question,
        answers: {
            A: q.correct_answer,
            B: q.incorrect_answers[0],
            C: q.incorrect_answers[1] || 'N/A',
            D: q.incorrect_answers[2] || 'N/A'
        },
        correctAnswer: 'A'
    }));
}

async function loadQuestion() {
    const questionContainer = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const answerButtons = document.querySelectorAll('.btn');

    if (questions.length <= currentQuestionIndex) {
        questions = await fetchQuestions();
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerHTML = currentQuestion.question;
    answerButtons.forEach((button, index) => {
        const answerKey = Object.keys(currentQuestion.answers)[index];
        button.innerHTML = currentQuestion.answers[answerKey];
        button.onclick = () => checkAnswer(answerKey);
    });

    enableButtons();
}

function checkAnswer(answer) {
    const currentQuestion = questions[currentQuestionIndex];
    const resultElement = document.getElementById('result');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    const answerButtons = document.querySelectorAll('.btn');
    answerButtons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
        button.disabled = true;
    });

    if (answer === currentQuestion.correctAnswer) {
        resultElement.innerHTML = "Correct!";
        resultElement.style.color = "green";
        score += 10;
        document.getElementById('correct-sound').play();
        document.getElementById(`btn-${answer}`).classList.add('correct');
    } else {
        resultElement.innerHTML = `Wrong! The correct answer is ${currentQuestion.answers[currentQuestion.correctAnswer]}.`;
        resultElement.style.color = "red";
        document.getElementById('wrong-sound').play();
        document.getElementById(`btn-${answer}`).classList.add('incorrect');
        document.getElementById(`btn-${currentQuestion.correctAnswer}`).classList.add('correct');
    }

    document.getElementById('next-question').style.display = "block";
    updateScore();
    updateProgressBar();
    disableButtons();
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        level++;
        currentQuestionIndex = 0;
    }
    loadQuestion();
    document.getElementById('result').innerHTML = "";
    document.getElementById('next-question').style.display = "none";
    updateLevel();
}

function updateScore() {
    // Update score logic here (could be local storage or database)
    document.getElementById('score').innerHTML = `Score: ${score}`;
}

function updateLevel() {
    document.getElementById('level').innerHTML = `Level: ${level}`;
}

function updateProgressBar() {
    progressBarWidth += 100 / (questions.length + 1); // Adjust progress per question
    document.getElementById('progress').style.width = `${progressBarWidth}%`;
}

function startTimer() {
    interval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(interval);
            endGame();
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').innerHTML = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function endGame() {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('result').innerHTML = `Game Over! Your final score is ${score}.`;
    document.getElementById('next-question').style.display = 'none';
}

function disableButtons() {
    document.querySelectorAll('.btn').forEach(button => button.disabled = true);
}

function enableButtons() {
    document.querySelectorAll('.btn').forEach(button => button.disabled = false);
}

window.onload = () => {
    loadQuestion();
    startTimer();
};

