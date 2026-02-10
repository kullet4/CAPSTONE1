// --- STATE ---
const currentUser = { role: 'student', name: 'Hero Explorer', gradeLevel: 1 };
let xp = 0, level = 1, currentQuestionIndex = 0, activeModule = [];

// --- SOUND EFFECTS ---
// I've added your requested lines for levelComplete and levelUp wav files
const sfx = {
    correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'),
    levelUp: new Audio('level_up.wav'), // Your local wav file
    levelComplete: new Audio('level_up_sfx.wav') // Your local wav file
};

// --- DATA BANK (GRADES 1-6) ---
const digitizedModules = {
    grade1: { title: "🌳 Mission: Living Things", questions: [{ question: "Which is a LIVING thing?", options: ["🧸 Toy", "🌳 Tree", "🚲 Bike"], correctIndex: 1 }] },
    grade2: { title: "☀️ Mission: Plant Life", questions: [{ question: "What do plants need to grow?", options: ["🍭 Candy", "☀️ Sunlight", "🕶️ Sunglasses"], correctIndex: 1 }] },
    grade3: { title: "🧊 Mission: States of Matter", questions: [{ question: "Which is a solid?", options: ["🧊 Ice", "🌊 Water", "💨 Steam"], correctIndex: 0 }] },
    grade4: { title: "🫁 Mission: Human Body", questions: [{ question: "Which organ helps you breathe?", options: ["❤️ Heart", "🧠 Brain", "🫁 Lungs"], correctIndex: 2 }] },
    grade5: { title: "🔋 Mission: Energy Sources", questions: [{ question: "Which is renewable?", options: ["⛽ Coal", "☀️ Solar", "🛢️ Oil"], correctIndex: 1 }] },
    grade6: { title: "🪐 Mission: The Cosmos", questions: [{ question: "Which is the largest planet?", options: ["Mars", "Jupiter", "Earth"], correctIndex: 1 }] }
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
    
    // Update Role Badge
    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = `Logged in as: ${currentUser.name} (${currentUser.role})`;

    // Load Grade Content
    const gradeData = digitizedModules[`grade${currentUser.gradeLevel}`];
    activeModule = shuffleArray([...gradeData.questions]);
    currentQuestionIndex = 0;

    // Update Mission Card Title
    const missionTitle = document.querySelector('.game-card h4');
    if (missionTitle) missionTitle.innerText = gradeData.title;

    // UI Role Logic
    if (currentUser.role === 'teacher') {
        body.classList.add('theme-teacher');
        document.getElementById('teacher-tools').classList.remove('d-none');
        document.getElementById('student-area').classList.add('d-none');
    } else if (currentUser.role === 'parent') {
        body.classList.add('theme-parent');
        document.getElementById('teacher-tools').classList.add('d-none');
        document.getElementById('student-area').classList.remove('d-none');
    } else {
        body.classList.add('theme-student');
        document.getElementById('student-area').classList.remove('d-none');
        document.getElementById('teacher-tools').classList.add('d-none');
    }
    updateUI();
}

// --- TEACHER ACTIONS ---
function setGrade(newLevel) {
    currentUser.gradeLevel = newLevel;
    initELMS(); // Instantly reloads questions and titles
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
    if (currentUser.role === 'student') { currentUser.role = 'teacher'; currentUser.name = 'Teacher Maria'; }
    else if (currentUser.role === 'teacher') { currentUser.role = 'parent'; currentUser.name = 'Parent/Guardian'; }
    else { currentUser.role = 'student'; currentUser.name = 'Hero Explorer'; }
    initELMS();
}

// --- GAME LOGIC ---
function loadQuestion() {
    let q = activeModule[currentQuestionIndex];
    document.getElementById('question-text').innerText = q.question;
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
        container.innerHTML += `<button onclick="checkAnswer(${idx})" class="btn btn-outline-secondary rounded-pill mb-2 w-100">${opt}</button>`;
    });
}

function checkAnswer(selectedIndex) {
    let q = activeModule[currentQuestionIndex];
    
    if (selectedIndex === q.correctIndex) {
        sfx.correct.play().catch(e => console.log("Sound error:", e));

        // Khan Academy Pop
        if (typeof confetti === 'function') {
            confetti({ particleCount: 40, spread: 55, origin: { x: 0, y: 0.7 }, angle: 60, ticks: 50, scalar: 0.8 });
            confetti({ particleCount: 40, spread: 55, origin: { x: 1, y: 0.7 }, angle: 120, ticks: 50, scalar: 0.8 });
        }

        Swal.fire({
            title: 'Great job! 🌟',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000
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
        Swal.fire({ title: 'Oops! ❌', text: 'Try again, Explorer!', icon: 'error' });
    }
}

function updateUI() {
    document.getElementById('xp-text').innerText = xp;
    document.getElementById('xp-bar').style.width = Math.min(xp, 100) + '%';
    document.getElementById('level').innerText = level;
    if (xp >= 100) { levelUp(); }
}

function levelUp() {
    level++;
    xp = 0;
    sfx.levelUp.play().catch(e => console.log("SFX error:", e)); // Plays your wav file
    updateUI();
    Swal.fire({
        title: '🎉 LEVEL UP!',
        text: `You are now Level ${level}`,
        icon: 'success',
        confirmButtonColor: '#0d6efd'
    });
}

function finishMission() {
    sfx.levelComplete.play().catch(e => console.log("SFX error:", e)); // Plays your wav file
    Swal.fire('🏁 Mission Complete!', 'You finished the module!', 'success').then(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('quizModal'));
        if (modal) modal.hide();
        initELMS(); 
    });
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Optional: Play a small "click" sound if you want!
    const isDark = body.classList.contains('dark-mode');
    
    Swal.fire({
        title: isDark ? 'Dark Mode On 🌙' : 'Light Mode On ☀️',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000,
        background: isDark ? '#1e293b' : '#fff',
        color: isDark ? '#fff' : '#000'
    });
}