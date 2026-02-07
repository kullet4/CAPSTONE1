let xp = 0;
let level = 1;
let currentQuestionIndex = 0;

const quizQuestions = [
    {
        question: "Which of these is a LIVING thing?",
        options: ["🧸 Toy", "🌳 Tree", "🚲 Bike"],
        correctIndex: 1
    },
    {
        question: "What do we use to SMELL flowers?",
        options: ["👂 Ear", "👀 Eye", "👃 Nose"],
        correctIndex: 2
    }
];

function loadQuestion() {
    let q = quizQuestions[currentQuestionIndex];
    document.getElementById('question-text').innerText = q.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; 

    q.options.forEach((option, index) => {
        const isCorrect = (index === q.correctIndex);
        optionsContainer.innerHTML += `
            <button onclick="checkAnswer(${isCorrect})" class="btn btn-outline-secondary rounded-pill mb-2">
                ${option}
            </button>`;
    });
}

function checkAnswer(isCorrect) {
    if (isCorrect) {
        Swal.fire({
            title: 'TAMA! 🌟',
            text: 'You earned 50 XP!',
            icon: 'success',
            confirmButtonText: 'Next',
            confirmButtonColor: '#28a745'
        }).then(() => {
            xp += 50;
            updateUI();

            // MOVE TO NEXT QUESTION
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                loadQuestion();
            } else {
                finishMission();
            }
        });
    } else {
        Swal.fire({
            title: 'Oops! ❌',
            text: 'Try again, Explorer!',
            icon: 'error',
            confirmButtonText: 'Try Again'
        });
    }
}

function updateUI() {
    document.getElementById('xp-text').innerText = xp;
    document.getElementById('xp-bar').style.width = Math.min(xp, 100) + '%';
    if (xp >= 100) { levelUp(); }
}

function levelUp() {
    level++;
    xp = 0;
    document.getElementById('level').innerText = level;
    document.getElementById('xp-bar').style.width = '0%';
    document.getElementById('xp-text').innerText = '0';
    Swal.fire('🎉 LEVEL UP!', 'You are now Level ' + level, 'success');
}

function finishMission() {
    Swal.fire('🏁 Mission Complete!', 'You finished the handout!', 'success').then(() => {
        const modalElement = document.getElementById('quizModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        currentQuestionIndex = 0; 
    });
}