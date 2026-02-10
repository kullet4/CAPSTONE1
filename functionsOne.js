// --- DATA BANK (4 Questions per Grade) ---
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

let currentGrade = 'grade1';
let questionIndex = 0;
let xp = 0;
let level = 1;
let correctAnswersCount = 0; // Track score for summary

function loadQuestion() {
    const module = digitizedModules[currentGrade];
    const q = module.questions[questionIndex];
    document.getElementById('question-text').innerText = q.question;
    const optionsDiv = document.getElementById('options-container');
    optionsDiv.innerHTML = '';
    
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-primary w-100 mb-2 p-3 text-start';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected) {
    const q = digitizedModules[currentGrade].questions[questionIndex];
    if (selected === q.correctIndex) {
        xp += 25;
        correctAnswersCount++;
        alert("Correct! 🎉 +25 XP");
    } else {
        alert("Oops! ❌ Try again on the next one.");
    }

    questionIndex++;
    if (questionIndex < digitizedModules[currentGrade].questions.length) {
        loadQuestion();
    } else {
        showSummary();
    }
    updateUI();
}

function showSummary() {
    const total = digitizedModules[currentGrade].questions.length;
    alert(`Mission Complete! 🎖️\nScore: ${correctAnswersCount} / ${total}\nKeep it up, Explorer!`);
    
    // Reset for next time
    questionIndex = 0;
    correctAnswersCount = 0;
    // Switch back to main view (pseudo-code, ensure your HTML IDs match)
    document.getElementById('quiz-section').classList.add('d-none');
    document.getElementById('dashboard-section').classList.remove('d-none');
}

function updateUI() {
    if (xp >= 100) {
        level++;
        xp = 0;
        alert("LEVEL UP! 🌟 You are now Level " + level);
    }
    document.getElementById('xp-bar').style.width = xp + "%";
    document.getElementById('level-display').innerText = "Level " + level;
}