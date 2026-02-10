// --- STATE ---
const currentUser = { role: 'student', name: 'Hero Explorer', gradeLevel: 1 };
let xp = 0, level = 1, currentQuestionIndex = 0, activeModule = [];
let correctCount = 0; // Tracks session score

// --- SOUND EFFECTS ---
const sfx = {
    correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'),
    levelUp: new Audio('level_up.wav'),
    levelComplete: new Audio('level_up_sfx.wav')
};

// --- DATA BANK (GRADES 1-6) ---
const digitizedModules = {
    grade1: { 
        title: "🌳 Mission: Living Things", 
        questions: [
            { question: "Which is a LIVING thing?", options: ["🧸 Toy", "🌳 Tree", "🚲 Bike"], correctIndex: 1 },
            { question: "What do humans need to breathe?", options: ["🍔 Food", "💧 Water", "🌬️ Air"], correctIndex: 2 },
            { question: "Which animal can fly?", options: ["🐘 Elephant", "🐦 Bird", "🐕 Dog"], correctIndex: 1 },
            { question: "Which part of the body is for seeing?", options: ["👃 Nose", "👂 Ear", "👀 Eyes"], correctIndex: 2 }
        ] 
    },
    grade2: { 
        title: "☀️ Mission: Plant Life", 
        questions: [
            { question: "What do plants need to grow?", options: ["🍭 Candy", "☀️ Sunlight", "🕶️ Sunglasses"], correctIndex: 1 },
            { question: "Which part of the plant is underground?", options: ["🍎 Fruit", "🌿 Leaf", "🥕 Roots"], correctIndex: 2 },
            { question: "Where do seeds come from?", options: ["☁️ Clouds", "🌸 Flowers", "🚜 Rocks"], correctIndex: 1 },
            { question: "What color is Chlorophyll?", options: ["🔴 Red", "🔵 Blue", "🟢 Green"], correctIndex: 2 }
        ] 
    },
    grade3: { 
        title: "🧊 Mission: States of Matter", 
        questions: [
            { question: "Which is a solid?", options: ["🧊 Ice", "🌊 Water", "💨 Steam"], correctIndex: 0 },
            { question: "What happens to ice when it melts?", options: ["🔥 It burns", "💧 It turns to liquid", "🌫️ It disappears"], correctIndex: 1 },
            { question: "Which state of matter is the air we breathe?", options: ["💎 Solid", "🧪 Liquid", "☁️ Gas"], correctIndex: 2 },
            { question: "What is the process of water turning into steam?", options: ["❄️ Freezing", "♨️ Evaporation", "🍯 Melting"], correctIndex: 1 }
        ] 
    },
    grade4: { 
        title: "🫁 Mission: Human Body", 
        questions: [
            { question: "Which organ helps you breathe?", options: ["❤️ Heart", "🧠 Brain", "🫁 Lungs"], correctIndex: 2 },
            { question: "Which organ pumps blood?", options: ["❤️ Heart", "🍔 Stomach", "🦴 Bones"], correctIndex: 0 },
            { question: "How many bones are in an adult human body?", options: ["100", "206", "500"], correctIndex: 1 },
            { question: "Which organ is used for thinking?", options: ["🧠 Brain", "🦶 Foot", "🦷 Teeth"], correctIndex: 0 }
        ] 
    },
    grade5: { 
        title: "🔋 Mission: Energy Sources", 
        questions: [
            { question: "Which is a renewable energy source?", options: ["⛽ Coal", "☀️ Solar", "🛢️ Oil"], correctIndex: 1 },
            { question: "What energy comes from the wind?", options: ["🌊 Hydro", "🌬️ Wind Energy", "☢️ Nuclear"], correctIndex: 1 },
            { question: "Which device converts sunlight into electricity?", options: ["📟 Calculator", "🔋 Solar Panel", "💡 Flashlight"], correctIndex: 1 },
            { question: "What is the primary source of energy for Earth?", options: ["🌙 Moon", "☀️ Sun", "🌋 Volcano"], correctIndex: 1 }
        ] 
    },
    grade6: { 
        title: "🪐 Mission: The Cosmos", 
        questions: [
            { question: "Which is the largest planet?", options: ["Mars", "Jupiter", "Earth"], correctIndex: 1 },
            { question: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Saturn"], correctIndex: 0 },
            { question: "What is at the center of our Solar System?", options: ["🌍 Earth", "☀️ Sun", "🕳️ Black Hole"], correctIndex: 1 },
            { question: "Which planet has the most visible rings?", options: ["Neptune", "Saturn", "Uranus"], correctIndex: 1 }
        ] 
    }
};

// --- INITIALIZE SYSTEM ---
document.addEventListener('DOMContentLoaded', () => initELMS());

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initELMS() {
    const body = document.body;
    body.classList.remove('theme-student', 'theme-teacher', 'theme-parent');
    
    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = `Logged in as: ${currentUser.name} (${currentUser.role})`;

    const gradeData = digitizedModules[`grade${currentUser.gradeLevel}`];
    activeModule = [...gradeData.questions]; 
    currentQuestionIndex = 0;
    correctCount = 0;

    // Use getElementById for the specific mission title
    const missionTitle = document.getElementById('mission-title');
    if (missionTitle) missionTitle.innerText = gradeData.title;

    const teacherTools = document.getElementById('teacher-tools');
    const studentArea = document.getElementById('student-area');

    if (currentUser.role === 'teacher') {
        body.classList.add('theme-teacher');
        if(teacherTools) teacherTools.classList.remove('d-none');
        if(studentArea) studentArea.classList.add('d-none');
    } else if (currentUser.role === 'parent') {
        body.classList.add('theme-parent');
        if(studentArea) studentArea.classList.remove('d-none');
        if(teacherTools) teacherTools.classList.add('d-none');
    } else {
        body.classList.add('theme-student');
        if(studentArea) studentArea.classList.remove('d-none');
        if(teacherTools) teacherTools.classList.add('d-none');
    }
    updateUI();
}

// --- TEACHER ACTIONS ---
function setGrade(newLevel) {
    currentUser.gradeLevel = newLevel;
    initELMS();
    Swal.fire({
        title: `Grade ${newLevel} Content Loaded`,
        icon: 'info',
        toast: true,
        position: 'top-end',
        timer: 1500,
        showConfirmButton: false
    });
}

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

// --- GAME LOGIC ---
function loadQuestion() {
    let q = activeModule[currentQuestionIndex];
    const qText = document.getElementById('question-text');
    const container = document.getElementById('options-container');

    if (!qText || !container) return;

    qText.innerText = q.question;
    container.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
        container.innerHTML += `<button onclick="checkAnswer(${idx})" class="btn btn-outline-secondary rounded-pill mb-2 w-100 p-3">${opt}</button>`;
    });
}

function checkAnswer(selectedIndex) {
    let q = activeModule[currentQuestionIndex];
    
    if (selectedIndex === q.correctIndex) {
        sfx.correct.play().catch(e => console.log("Sound error:", e));
        correctCount++;
        
        // Correct XP logic: Only add if answer is right
        xp += 25; 
        updateUI();

        if (typeof confetti === 'function') {
            confetti({ particleCount: 40, spread: 55, origin: { x: 0.5, y: 0.5 } });
        }

        Swal.fire({
            title: 'Great job! 🌟',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000
        }).then(() => processNext());
    } else {
        Swal.fire({ 
            title: 'Oops! ❌', 
            text: 'Try again, Explorer!', 
            icon: 'error',
            timer: 1500,
            showConfirmButton: false
        }).then(() => processNext());
    }
}

function processNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeModule.length) {
        loadQuestion();
    } else {
        finishMission();
    }
}

function updateUI() {
    const xpBar = document.getElementById('xp-bar');
    const xpText = document.getElementById('xp-text');
    const levelText = document.getElementById('level');

    if(xpBar) xpBar.style.width = Math.min(xp, 100) + '%';
    if(xpText) xpText.innerText = xp;
    if(levelText) levelText.innerText = level;

    if (xp >= 100) { levelUp(); }
}

function levelUp() {
    level++;
    xp = 0;
    sfx.levelUp.play().catch(e => console.log("SFX error:", e));
    updateUI();
    Swal.fire({
        title: '🎉 LEVEL UP!',
        text: `You are now Level ${level}`,
        icon: 'success'
    });
}

function finishMission() {
    sfx.levelComplete.play().catch(e => console.log("SFX error:", e));
    Swal.fire({
        title: '🏁 Mission Complete!',
        html: `You finished the module!<br><h3>Score: ${correctCount} / 4</h3>`,
        icon: 'success'
    }).then(() => {
        const modalEl = document.getElementById('quizModal');
        if(modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
        initELMS(); 
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}