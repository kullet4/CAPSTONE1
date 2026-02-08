// --- E-LMS USER STATE ---
const currentUser = {
    role: 'student', 
    name: 'Hero Explorer',
    gradeLevel: 1
};

// --- GAME STATE ---
let xp = 0;
let level = 1;
let currentQuestionIndex = 0;
let activeModule = [];

// --- DIGITIZED INSTRUCTIONAL MATERIALS (GRADES 1-6) ---
// Lead Dev: Expanded bank to support randomization variety [cite: 1, 10]
const digitizedModules = {
    grade1: [
        {
            title: "Common Living Things",
            source: "Science Handout Q1-M1",
            questions: [
                { question: "Which of these is a LIVING thing?", options: ["🧸 Toy", "🌳 Tree", "🚲 Bike"], correctIndex: 1 },
                { question: "What do we use to SMELL flowers?", options: ["👂 Ear", "👀 Eye", "👃 Nose"], correctIndex: 2 },
                { question: "Which animal can fly?", options: ["🐶 Dog", "🐟 Fish", "🐦 Bird"], correctIndex: 2 },
                { question: "Which part of the body do we use to see?", options: ["👅 Tongue", "👀 Eyes", "👂 Ears"], correctIndex: 1 }
            ]
        }
    ],
    grade6: [
        {
            title: "The Solar System",
            source: "Science Handout Q4-M2",
            questions: [
                { question: "Which is the largest planet?", options: ["Mars", "Jupiter", "Earth"], correctIndex: 1 },
                { question: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Saturn"], correctIndex: 0 },
                { question: "What is the center of our Solar System?", options: ["The Moon", "Earth", "The Sun"], correctIndex: 2 }
            ]
        }
    ]
};

// --- CORE SYSTEM LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    initELMS();
});

// Lead Dev Note: This shuffles the questions to keep the experience novel
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- DEV TOGGLE FUNCTION ---
function toggleRole() {
    if (currentUser.role === 'student') {
        currentUser.role = 'teacher';
        currentUser.name = 'Teacher Maria';
    } else if (currentUser.role === 'teacher') {
        currentUser.role = 'parent';
        currentUser.name = 'Parent/Guardian';
    } else {
        currentUser.role = 'student';
        currentUser.name = 'Hero Explorer';
    }
    initELMS(); 
}

function initELMS() {
    const teacherTools = document.getElementById('teacher-tools');
    const studentArea = document.getElementById('student-area');
    const userDisplay = document.getElementById('user-display');
    const body = document.body;

    body.classList.remove('theme-student', 'theme-teacher', 'theme-parent');
    userDisplay.innerText = `Logged in as: ${currentUser.name} (${currentUser.role})`;
    
    // Set the Grade-specific module and SHUFFLE it for novelty
    const gradeKey = `grade${currentUser.gradeLevel}`;
    activeModule = shuffleArray([...digitizedModules[gradeKey][0].questions]);
    currentQuestionIndex = 0; 

    if (currentUser.role === 'teacher') {
        body.classList.add('theme-teacher');
        if(teacherTools) teacherTools.classList.remove('d-none');
        if(studentArea) studentArea.classList.add('d-none');
    } else if (currentUser.role === 'parent') {
        body.classList.add('theme-parent'); 
        if(teacherTools) teacherTools.classList.add('d-none');
        if(studentArea) studentArea.classList.remove('d-none');
        openParentPortal(); 
    } else {
        body.classList.add('theme-student');
        if(studentArea) studentArea.classList.remove('d-none');
        if(teacherTools) teacherTools.classList.add('d-none');
    }
    
    updateUI();
}

function loadQuestion() {
    let q = activeModule[currentQuestionIndex];
    const questionText = document.getElementById('question-text');
    if (questionText) {
        questionText.innerText = q.question; 
    }
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; 

    // Bonus Lead Dev Tip: You can also shuffle options here if you want extra difficulty!
    q.options.forEach((option, index) => {
        const isCorrect = (index === q.correctIndex);
        optionsContainer.innerHTML += `
            <button onclick="checkAnswer(${isCorrect})" class="btn btn-outline-secondary rounded-pill mb-2 w-100">
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
            currentQuestionIndex++;
            if (currentQuestionIndex < activeModule.length) {
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
    const xpText = document.getElementById('xp-text');
    const xpBar = document.getElementById('xp-bar');
    const levelDisplay = document.getElementById('level');
    
    if(xpText) xpText.innerText = xp;
    if(xpBar) xpBar.style.width = Math.min(xp, 100) + '%';
    if(levelDisplay) levelDisplay.innerText = level;

    if (xp >= 100) { levelUp(); }
}

function levelUp() {
    level++;
    xp = 0;
    updateUI();
    Swal.fire('🎉 LEVEL UP!', 'You are now Level ' + level, 'success');
}

function finishMission() {
    Swal.fire('🏁 Mission Complete!', 'You finished the digitized handout!', 'success').then(() => {
        const modalElement = document.getElementById('quizModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        }
        // Shuffle again for the next attempt!
        initELMS(); 
    });
}

// --- TEACHER & PARENT DASHBOARD ACTIONS --- [cite: 3, 4, 12]
function uploadHandout() {
    Swal.fire({
        title: 'Upload Module',
        text: 'Select a PDF Science Handout to digitize.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Select File'
    });
}

function viewXP() {
    Swal.fire({
        title: 'Student Progress Report',
        html: `<b>Hero Explorer:</b> Level ${level} (${xp} XP)<br><b>System Status:</b> Online `,
        icon: 'success'
    });
}

function openParentPortal() {
    Swal.fire({
        title: 'Parent Portal',
        html: `<p>Monitoring: <b>Hero Explorer</b> [cite: 12]</p>
               <p>Current Progress: ${xp}% of Level ${level}</p>
               <hr>
               <button class="btn btn-sm btn-outline-primary">Message Teacher [cite: 4]</button>`,
        icon: 'info'
    });
}