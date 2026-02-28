/**
 * TEEN PARENT LIFE SIMULATOR PH
 * A vanilla JS implementation using Canvas API
 */

// --- CONFIGURATION ---
const TILE_SIZE = 32;
const COLS = 30;
const ROWS = 22;
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 704;

// --- GAME STATE ---
const state = {
    month: 1,
    day: 1,
    timeBlock: 0, // 0: Morning, 1: Afternoon, 2: Evening, 3: Night
    energy: 100,
    stress: 0,
    money: 800,
    schoolProgress: 100, // As requested, may be unbalanced
    babyHealth: 100,
    isGameOver: false,
    isPaused: false,
    isActionLoading: false, // New state for loading mechanic
    babyCrying: false,
    lastVaccineMonth: 0,
    burnout: false,
    floatingTexts: [], // For visual feedback
    lastSecondDecayTime: 0,
    lastTimeBlockChangeTime: 0, // Track last time block change
    actionLoadStartTime: 0,
    actionLocation: { x: 0, y: 0 },
    actionInitialStats: {},
    actionTotalChanges: {},
    babyHealthEmergencyShown: false, // Track if baby health emergency modal has been shown
    stressEmergencyShown: false, // Track if stress emergency modal has been shown
    gameOverShown: false, // Track if any game over modal has been shown
    babyWithPlayer: false, // Track if baby is currently with the player
    currentActionType: null, // Track what action is currently being performed
    selectedCharacter: 'male' // 'male' or 'female', default male
};

const timeBlocks = ["Morning", "Afternoon", "Evening", "Night"];

// --- MAP DEFINITIONS ---
// 0: Floor, 1: Wall, 2: Crib, 3: Bed, 4: Study Desk, 5: Kitchen
// 6: School Desk, 7: Clinic Desk, 8: Work Station, 9: Door/Transition
// 10: Window, 11: Bookshelf, 12: Plant, 13: Chair, 14: Counter, 15: TV, 16: Sofa, 17: Computer
const mapLayout = [
    [1,1,1,1,10,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,10,1,1,1,1,1],
    [1,3,0,0,16,16,0,15,0,9,1, 0,0,0,0,0,0,0,0, 1,6,13,6,13,0,11,0,0,6,1],
    [1,0,0,0,0,0,0,0,0,1,1, 0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,1],
    [1,2,0,0,1,1,1,1,4,13,1, 0,0,0,0,0,0,0,0, 1,6,13,6,13,0,11,0,0,6,1],
    [1,0,0,0,1,5,14,14,0,0,1, 0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,1],
    [1,12,0,0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,0, 1,4,13,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,9,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,9,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,9,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,9,1,1,1,1,1],
    [1,7,14,14,14,0,13,0,13,0,1, 0,0,0,0,0,0,0,0, 1,8,17,0,8,0,0,8,17,0,1],
    [1,0,0,0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,1],
    [1,13,0,13,0,13,0,0,0,0,1, 0,0,0,0,0,0,0,0, 1,8,17,0,8,17,0,8,17,0,1],
    [1,0,0,0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,14,14,14,14,14,14,14,14,14,1],
    [1,10,1,0,0,0,1,10,1,0,1, 0,0,0,0,0,0,0,0, 1,5,0,12,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0]
];

// --- NEW MECHANICS CONFIG ---
const ACTION_DURATION = 10000; // 10 seconds for focus actions
const BABY_PICKUP_DURATION = 500; // 0.5 seconds for baby pickup animation

// --- ENTITIES ---
const player = {
    x: 15 * TILE_SIZE, // Start in middle street
    y: 9 * TILE_SIZE,
    width: 28,
    height: 28,
    color: '#e74c3c', // Red shirt
    speed: 4,
    direction: 'down'
};

// --- ENGINE SETUP ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const keys = {};

// --- INPUT HANDLING ---
window.addEventListener('keydown', (e) => {
    if (state.isActionLoading) return; // Disable input during action lock
    keys[e.code] = true;
    if (e.code === 'Space' && !state.isPaused) {
        checkInteraction();
    }
});
window.addEventListener('keyup', (e) => {
    if (state.isActionLoading) return; // Disable input during action lock
    keys[e.code] = false;
});

// --- CORE SYSTEMS ---

function init() {
    loadGame();

    // ensure not paused/action locked (save file might have left them set)
    state.isPaused = false;
    state.isActionLoading = false;

    // if character was chosen on selection screen it will be in localStorage
    const picked = localStorage.getItem('selectedCharacter');
    if (picked) {
        state.selectedCharacter = picked;
    }

    updatePlayerAppearance();

    state.lastSecondDecayTime = Date.now(); // Initialize decay timer
    state.lastTimeBlockChangeTime = Date.now(); // Initialize time block timer
    updateUI();
    gameLoop();
    // Auto-save every 30 seconds
    setInterval(saveGame, 30000);

    // Navigation Buttons
    document.getElementById('btn-back').addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        if(confirm("Are you sure you want to reset the game? All progress will be lost.")) {
            localStorage.removeItem('teenParentSimSave');
            location.reload();
        }
    });
}

function gameLoop() {
    const now = Date.now();

    if (state.isActionLoading) {
        // Determine action duration based on action type
        const actionDuration = (state.currentActionType === "Crib" || state.currentActionType === "PickUp") ? BABY_PICKUP_DURATION : ACTION_DURATION;
        const elapsed = now - state.actionLoadStartTime;
        const progress = Math.min(elapsed / actionDuration, 1);

        // Apply incremental changes based on progress
        for (const key in state.actionTotalChanges) {
            if (state.actionInitialStats.hasOwnProperty(key)) {
                const initialValue = state.actionInitialStats[key];
                const totalChange = state.actionTotalChanges[key];
                state[key] = initialValue + (totalChange * progress);
            }
        }
        
        if (progress >= 1) {
            // Action finished
            // Special handling for baby pickup
            if (state.currentActionType === "Crib" || state.currentActionType === "PickUp") {
                state.babyWithPlayer = true;
                addFloatingText(player.x, player.y, "Baby Picked Up!", "#2ecc71");
            }
            state.isActionLoading = false;
            state.currentActionType = null;
            if (!state.isGameOver) {
                state.isPaused = false;
            }
            document.getElementById('action-lock-overlay').classList.add('hidden');
        }
    }

    if (!state.isGameOver) {
        // This runs even if paused.  normally stats decay every second,
        // but only pause that decay during a resting action (bed).
        if (!(state.isActionLoading && state.currentActionType === "Bed")) {
            if (now - (state.lastSecondDecayTime || now) > 1000) {
                state.babyHealth -= 1;
                state.lastSecondDecayTime = now;
                state.schoolProgress -= 1;
            }
        }

        // Time block changes every 60 seconds (1 minute)
        if (now - (state.lastTimeBlockChangeTime || now) > 30000) {
            advanceTime();
            state.lastTimeBlockChangeTime = now;
        }
    }

    if (!state.isPaused && !state.isGameOver) { // Handles player movement
        update();
    }

    // These should run every frame to keep UI updated and check for game over
    clampStats();
    updateUI();
    checkEmergency();

    draw(); // Always draw the game, even if paused, to prevent black screen
    requestAnimationFrame(gameLoop);
}

function update() {
    // Movement Logic
    let dx = 0;
    let dy = 0;
    
    // Burnout effect: slower movement
    const currentSpeed = state.burnout ? player.speed / 2 : player.speed;

    if (keys['ArrowUp'] || keys['KeyW']) dy -= currentSpeed;
    if (keys['ArrowDown'] || keys['KeyS']) dy += currentSpeed;
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= currentSpeed;
    if (keys['ArrowRight'] || keys['KeyD']) dx += currentSpeed;

    // Normalize diagonal speed
    if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
    }

    // Update direction
    if (dx < 0) player.direction = 'left';
    else if (dx > 0) player.direction = 'right';
    else if (dy < 0) player.direction = 'up';
    else if (dy > 0) player.direction = 'down';

    // Collision Detection
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (!checkCollision(newX, player.y)) player.x = newX;
    if (!checkCollision(player.x, newY)) player.y = newY;

    // Boundary checks
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));

    // Update Floating Texts
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y -= 0.5; // Float up
        ft.life--;
        if (ft.life <= 0) state.floatingTexts.splice(i, 1);
    }
}

function checkCollision(x, y) {
    // Check all 4 corners of player
    const points = [
        {x: x, y: y},
        {x: x + player.width, y: y},
        {x: x, y: y + player.height},
        {x: x + player.width, y: y + player.height}
    ];

    for (let p of points) {
        const col = Math.floor(p.x / TILE_SIZE);
        const row = Math.floor(p.y / TILE_SIZE);
        
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            const tile = mapLayout[row][col];
            if (tile === 1) return true; // Wall
            // Objects act as walls too for movement, but are interactable
            if ([2,3,4,5,6,7,8,10,11,12,14,15,16,17].includes(tile)) return true; 
        }
    }
    return false;
}

function getFacingTile() {
    // Simple center point check + offset based on last movement or just proximity
    const cx = player.x + player.width/2;
    const cy = player.y + player.height/2;
    
    // Check surrounding tiles
    const col = Math.floor(cx / TILE_SIZE);
    const row = Math.floor(cy / TILE_SIZE);

    // Check neighbors (Up, Down, Left, Right)
    const neighbors = [
        {r: row-1, c: col}, {r: row+1, c: col},
        {r: row, c: col-1}, {r: row, c: col+1}
    ];

    for (let n of neighbors) {
        if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS) {
            const tile = mapLayout[n.r][n.c];
            if (tile > 1 && tile !== 9) {
                return {
                    id: tile,
                    x: n.c * TILE_SIZE + TILE_SIZE / 2,
                    y: n.r * TILE_SIZE + TILE_SIZE / 2
                };
            }
        }
    }
    return null;
}

function checkInteraction() {
    const tile = getFacingTile();
    
    if (!tile) return;

    if (tile.id === 2) handleAction("Crib", tile);
    else if (tile.id === 3) handleAction("Bed", tile);
    else if (tile.id === 4) handleAction("Study", tile);
    else if (tile.id === 5) handleAction("Kitchen", tile);
    else if (tile.id === 6) handleAction("School", tile);
    else if (tile.id === 7) handleAction("Clinic", tile);
    else if (tile.id === 8) handleAction("Work", tile);
}

// --- GAME LOGIC & ACTIONS ---

function handleAction(type, location) {
    if (state.isActionLoading) return; // Prevent new actions while one is loading

    let message = "";
    let uiText = "";
    let isFocusAction = false;
    let totalChanges = {};

    switch(type) {
        case "Study":
        case "School":
            if (type === "School" && (state.timeBlock !== 0 && state.timeBlock !== 1)) {
                 showModal("School Closed", "School is only open in Morning and Afternoon.");
                 return;
            }
            message = "Focus on school? This will take time...";
            uiText = "Studying...";
            totalChanges = { energy: -20, stress: 20, schoolProgress: 20, babyHealth: -20 };
            isFocusAction = true;
            // Baby must be left behind
            state.babyWithPlayer = false;
            break;
        case "Crib":
            if (!state.babyWithPlayer) {
                // Baby is in crib - show interaction options
                state.isPaused = true;
                const modal = document.getElementById('modal-overlay');
                const mTitle = document.getElementById('modal-title');
                const mText = document.getElementById('modal-text');
                const mEdu = document.getElementById('modal-edu');
                const mActions = document.getElementById('modal-actions');

                mTitle.innerText = "Baby in Crib";
                mText.innerText = "What would you like to do?";
                mEdu.classList.add('hidden');

                mActions.innerHTML = '';
                
                const btnFeed = document.createElement('button');
                btnFeed.innerText = "Feed Baby";
                btnFeed.onclick = () => {
                    closeModal();
                    handleAction("Feed", location);
                };

                const btnPlay = document.createElement('button');
                btnPlay.innerText = "Play with Baby";
                btnPlay.onclick = () => {
                    closeModal();
                    handleAction("Play", location);
                };

                const btnPickUp = document.createElement('button');
                btnPickUp.innerText = "Pick Up Baby";
                btnPickUp.classList.add('success');
                btnPickUp.onclick = () => {
                    closeModal();
                    handleAction("PickUp", location);
                };

                mActions.appendChild(btnFeed);
                mActions.appendChild(btnPlay);
                mActions.appendChild(btnPickUp);
                modal.classList.remove('hidden');
                return;
            } else {
                // Baby is with player - show options to care or drop off
                state.isPaused = true;
                const modal = document.getElementById('modal-overlay');
                const mTitle = document.getElementById('modal-title');
                const mText = document.getElementById('modal-text');
                const mEdu = document.getElementById('modal-edu');
                const mActions = document.getElementById('modal-actions');

                mTitle.innerText = "Baby Options";
                mText.innerText = "What would you like to do with the baby?";
                mEdu.classList.add('hidden');

                mActions.innerHTML = '';
                
                const btnCare = document.createElement('button');
                btnCare.innerText = "Care for Baby";
                btnCare.onclick = () => {
                    closeModal();
                    // Trigger care action
                    handleAction("CribCare", location);
                };

                const btnDrop = document.createElement('button');
                btnDrop.innerText = "Drop Off Baby";
                btnDrop.classList.add('success');
                btnDrop.onclick = () => {
                    closeModal();
                    state.babyWithPlayer = false;
                    addFloatingText(player.x, player.y, "Baby Put Down", "#3498db");
                };

                mActions.appendChild(btnCare);
                mActions.appendChild(btnDrop);
                modal.classList.remove('hidden');
                return;
            }
            break;
        case "Feed":
            message = "Feed the baby?";
            uiText = "Feeding baby...";
            totalChanges = { babyHealth: 15, stress: -10, energy: -5 };
            isFocusAction = true;
            break;
        case "Play":
            message = "Play with the baby?";
            uiText = "Playing with baby...";
            totalChanges = { babyHealth: 10, stress: -15, energy: -10 };
            isFocusAction = true;
            break;
        case "PickUp":
            message = "Pick up the baby?";
            uiText = "Picking up baby...";
            totalChanges = { };
            isFocusAction = true;
            break;
            message = "Focus on the baby? This will take time...";
            uiText = "Caring for baby...";
            totalChanges = { babyHealth: 20, stress: -20, schoolProgress: -20 };
            isFocusAction = true;
            break;
        case "Bed":
            message = "Sleep until morning? (Restores Energy)";
            uiText = "Resting...";
            totalChanges = {
                energy: 100 - state.energy, // Fills up
                stress: -state.stress, // Resets to 0
                // note: no schoolProgress change so the bar stays still during rest
            };
            isFocusAction = true;
            break;
        case "Work":
            message = "Work a shift? This will take time...";
            uiText = "Working...";
            totalChanges = { money: 500, energy: -20, stress: 20, babyHealth: -20, schoolProgress: -20 };
            isFocusAction = true;
            // Baby must be left behind
            state.babyWithPlayer = false;
            break;
        case "Clinic":
            if (!state.babyWithPlayer) {
                // Show modal telling player where the baby is
                showModal("Need to Pick Up Baby", "You need to bring your baby to the clinic! Go pick up the baby at the CRIB first.");
                return;
            }
            if (state.money < 800) return alert("Not enough money (Need ₱800).");
            message = "Go to the clinic? This will take time...";
            uiText = "At the Clinic...";
            totalChanges = {
                money: -800,
                energy: 100 - state.energy, // Fills up
                babyHealth: 100 - state.babyHealth, // Fills up
                stress: -state.stress, // Resets to 0
                schoolProgress: -20
            };
            isFocusAction = true;
            // After clinic, baby is still with player but full health
            break;
        case "Kitchen":
             if (state.money < 100) return alert("Not enough money.");
            message = "Eat a meal?";
            // This is an instant action, not a focus action
            break;
    }

    if (isFocusAction) {
        showConfirm(type, message, () => {
            state.isActionLoading = true;
            state.isPaused = true; // Stop player movement
            state.currentActionType = type; // Track the action type
            Object.keys(keys).forEach(key => keys[key] = false); // Clear all key inputs
            state.actionLoadStartTime = Date.now();
            state.actionLocation = { x: location.x, y: location.y };
            state.actionTotalChanges = totalChanges;
            state.actionInitialStats = {
                energy: state.energy,
                stress: state.stress,
                babyHealth: state.babyHealth,
                schoolProgress: state.schoolProgress,
                money: state.money
            };
            document.getElementById('action-lock-text').innerText = uiText;
            document.getElementById('action-lock-overlay').classList.remove('hidden');
        });
    } else if (type === "Kitchen") { // Handle instant actions
        showConfirm(type, message, () => {
            state.money -= 100;
            state.energy = Math.min(100, state.energy + 20);
            addFloatingText(player.x, player.y, "Yummy!", "#f1c40f");
        });
    }
}

function advanceTime() {
    // --- Natural Decay System (per in-game hour/time block) ---

    // --- Pressure Mechanics (per hour) ---
    if (state.babyHealth < 40) {
        state.stress += 5;
    }

    // --- Time Progression ---
    state.timeBlock++;
    if (state.timeBlock > 3) {
        state.timeBlock = 0;
        state.day++;

        // --- Random Event System (every 2 days) ---
        if (state.day % 2 === 0) {
            triggerRandomEvent();
        }
        
        // Month Cycle
        if (state.day > 30) {
            state.day = 1;
            state.month++;
            monthlyEvaluation();
        }
    }

}

function checkEvents() {
    const rng = Math.random();

    // Baby Cry Event (Higher chance at night)
    if (state.timeBlock === 3 && rng < 0.4) {
        state.babyCrying = true;
        showModal("Baby Crying!", "The baby woke up crying. Go to the crib immediately!", null);
    }

    // Random Expense
    if (rng < 0.05) {
        state.money -= 200;
        showModal("Unexpected Expense", "Prices of milk formula went up due to inflation. You spent an extra ₱200.");
    }

}

function checkEmergency() {
    // Burnout
    if (state.stress > 85) {
        if (!state.burnout) {
            state.burnout = true;
            showModal("BURNOUT WARNING", "Your stress is critical! You are moving slower and losing energy faster. Sleep or relax immediately.", 
            "WHO: Chronic stress in adolescents can lead to long-term mental health issues.");
        }
    } else {
        state.burnout = false;
    }

    // Baby Health Critical
    if (state.babyHealth < 40) {
        if (!state.babyHealthEmergencyShown) {
            state.babyHealthEmergencyShown = true;
            showModal("MEDICAL EMERGENCY", "Baby health is critical! Go to the clinic immediately or risk severe consequences.");
        }
    } else {
        state.babyHealthEmergencyShown = false;
    }

    if (state.stress >= 100) {
        if (!state.stressEmergencyShown) {
            state.stressEmergencyShown = true;
            state.gameOverShown = true;
            endGame("Mental Breakdown", "The overwhelming stress became too much to handle. You need to prioritize your mental health.");
        }
    }

    if (state.energy <= 0) {
        if (!state.gameOverShown) {
            state.gameOverShown = true;
            endGame("You Lose: Exhausted", "You ran out of energy and collapsed. You must rest to continue.");
        }
    }

    if (state.schoolProgress <= 0) {
        if (!state.gameOverShown) {
            state.gameOverShown = true;
            endGame("You Lose: Dropped Out", "Your school progress fell to zero. You've been forced to drop out.");
        }
    }

    // Game Over Conditions
    if (state.babyHealth <= 0) {
        if (!state.gameOverShown) {
            state.gameOverShown = true;
            endGame("Tragedy", "The baby fell severely ill due to neglect. The Department of Social Welfare and Development intervened.");
        }
    }
    
    if (state.month > 12) {
        evaluateEnding();
    }
}

function monthlyEvaluation() {
    let summary = `Month ${state.month - 1} Report:\n`;
    summary += `Savings: ₱${state.money}\n`;
    summary += `School Progress: ${state.schoolProgress}%\n`;
    summary += `Baby Health: ${state.babyHealth}%`;
    
    showModal("Monthly Evaluation", summary);

    // Failure Condition
    if (state.month > 3 && state.schoolProgress < 10) {
        endGame("Dropped Out", "You fell too far behind in your studies and had to drop out of school.");
    }
}

function evaluateEnding() {
    state.isGameOver = true;
    let title = "";
    let desc = "";

    if (state.schoolProgress >= 90 && state.babyHealth > 80) {
        title = "Success: Super Parent!";
        desc = "You graduated with honors and raised a healthy baby. It was incredibly hard, but you made it.";
    } else if (state.schoolProgress >= 75 && state.money > 0) {
        title = "Graduated";
        desc = "You managed to finish school. Finances are tight, but the future looks okay.";
    } else if (state.schoolProgress < 50) {
        title = "Dropped Out";
        desc = "Balancing work and baby was too much. You had to stop school to work full-time.";
    } else {
        title = "Uncertain Future";
        desc = "You survived the year, but health and finances are in a critical state.";
    }

    showModal(title, desc, "Game Over. Refresh to play again.");
}

function clampStats() {
    state.babyHealth = Math.max(0, Math.min(100, state.babyHealth));
    state.stress = Math.max(0, Math.min(100, state.stress));
    state.schoolProgress = Math.max(0, Math.min(100, state.schoolProgress));
    state.energy = Math.max(0, Math.min(100, state.energy));
    state.money = Math.round(state.money); // Ensure money is always a whole number
}

function triggerRandomEvent() {
    const rng = Math.random();
    if (rng < 0.33) { // Baby nagkasakit
        state.babyHealth -= 25;
        state.stress += 20;
        showModal("Event: Baby is Sick", "Your baby has a high fever. Baby health and your stress took a major hit.");
    } else if (rng < 0.66) { // Surprise school exam
        state.stress += 15;
        state.schoolProgress -= 15;
        showModal("Event: Surprise Exam", "A surprise long exam was announced! Your unpreparedness hurt your grades and raised your stress.");
    } else { // Emergency expense
        state.money -= 1000;
        showModal("Event: Emergency Expense", "An unexpected bill arrived. Your savings took a ₱1000 hit.");
    }
}

// --- RENDERING ---

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Map
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = mapLayout[r][c];
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            // --- REALISTIC FLOOR TEXTURES ---
            if (r <= 6 && c <= 10) { 
                // House: Wood Floor
                ctx.fillStyle = "#d35400"; 
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#e67e22"; // Wood grain
                ctx.fillRect(x + 2, y, 4, TILE_SIZE);
                ctx.fillRect(x + 16, y, 4, TILE_SIZE);
            }
            else if (r <= 6 && c >= 19) {
                // School: Tiled Floor
                ctx.fillStyle = "#f1c40f"; 
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#f39c12";
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            }
            else if (r >= 13 && c <= 10) {
                // Clinic: Clean White/Green Tile
                ctx.fillStyle = "#ecf0f1"; 
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#2ecc71";
                ctx.fillRect(x + 10, y + 10, 12, 12); // Pattern
            }
            else if (r >= 13 && c >= 19) {
                // Work: Concrete
                ctx.fillStyle = "#95a5a6"; 
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // Noise
                if ((r+c)%3===0) {
                    ctx.fillStyle = "#7f8c8d";
                    ctx.fillRect(x+5, y+5, 5, 5);
                }
            } else {
                // Street: Asphalt
                ctx.fillStyle = "#34495e";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // Road markings
                if (c === 7 && r % 2 === 0) {
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(x + 12, y + 4, 8, 24);
                }
            }

            // Objects
            if (tile === 1) {
                ctx.fillStyle = "#2c3e50"; // Wall
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // Wall Highlight (3D effect)
                ctx.fillStyle = "#34495e";
                ctx.fillRect(x, y, TILE_SIZE, 4);
            } else if (tile === 2) {
                ctx.fillStyle = "#e84393"; // Crib
                ctx.fillRect(x+4, y+4, 24, 24);
                ctx.fillStyle = "#fff"; // Pillow
                ctx.fillRect(x+8, y+6, 16, 8);
                // Draw baby in crib if not picked up
                if (!state.babyWithPlayer) {
                    drawBabyInCrib(x, y);
                }
                // Show indicator if baby is crying or baby health is low (<= 20)
                if (state.babyCrying || state.babyHealth <= 20) {
                    // Use red for crying, yellow for low health
                    ctx.fillStyle = state.babyCrying ? "red" : "#f1c40f";
                    ctx.font = "20px Arial";
                    // Center the exclamation above the crib
                    ctx.fillText("!", x + TILE_SIZE / 2 - 4, y - 6);
                }
            } else if (tile === 3) {
                ctx.fillStyle = "#8e44ad"; // Bed
                ctx.fillRect(x+2, y+8, 28, 16);
                ctx.fillStyle = "#fff"; // Pillow
                ctx.fillRect(x+4, y+10, 8, 12);
            } else if (tile === 4) {
                ctx.fillStyle = "#d35400"; // Desk
                ctx.fillRect(x+4, y+4, 24, 24);
            } else if (tile === 6) {
                ctx.fillStyle = "#2980b9"; // School Desk
                ctx.fillRect(x+4, y+4, 24, 24);
            } else if (tile === 7) {
                ctx.fillStyle = "#fff"; // Clinic
                ctx.fillRect(x+4, y+4, 24, 24);
                ctx.fillStyle = "red";
                ctx.fillRect(x+12, y+8, 8, 16);
                ctx.fillRect(x+8, y+12, 16, 8);
            } else if (tile === 8) {
                ctx.fillStyle = "#34495e"; // Work
                ctx.fillRect(x+4, y+4, 24, 24);
            } else if (tile === 10) { // Window
                ctx.fillStyle = "#34495e"; // Wall color
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#7df9ff"; // Light blue for glass
                ctx.fillRect(x + 4, y + 4, 24, 24);
            } else if (tile === 11) { // Bookshelf
                ctx.fillStyle = "#a0522d"; // Sienna
                ctx.fillRect(x + 2, y, 28, TILE_SIZE);
                ctx.fillStyle = "#000"; // Lines for books
                ctx.fillRect(x + 2, y + 10, 28, 2);
                ctx.fillRect(x + 2, y + 22, 28, 2);
            } else if (tile === 12) { // Plant
                ctx.fillStyle = "#8B4513"; // SaddleBrown pot
                ctx.fillRect(x + 8, y + 20, 16, 12);
                ctx.fillStyle = "#228B22"; // ForestGreen leaves
                ctx.beginPath();
                ctx.arc(x + 16, y + 14, 10, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 13) { // Chair
                ctx.fillStyle = "#964B00"; // Brown
                ctx.fillRect(x + 8, y + 8, 16, 16); // Seat
                ctx.fillRect(x + 8, y + 4, 16, 4); // Back
            } else if (tile === 14) { // Counter
                ctx.fillStyle = "#bdc3c7"; // Silver
                ctx.fillRect(x, y + 4, TILE_SIZE, 24);
                ctx.fillStyle = "#7f8c8d"; // Darker top
                ctx.fillRect(x, y + 4, TILE_SIZE, 4);
            } else if (tile === 15) { // TV
                ctx.fillStyle = "#34495e"; // Stand
                ctx.fillRect(x + 4, y + 24, 24, 8);
                ctx.fillStyle = "#000"; // Screen
                ctx.fillRect(x + 2, y + 2, 28, 22);
                ctx.fillStyle = "#1e90ff"; // Blueish reflection
                ctx.fillRect(x + 4, y + 4, 10, 4);
            } else if (tile === 16) { // Sofa
                ctx.fillStyle = "#7f8c8d"; // Gray
                ctx.fillRect(x, y + 6, TILE_SIZE, 20); // Main body
            } else if (tile === 17) { // Computer
                ctx.fillStyle = "#000"; // Monitor
                ctx.fillRect(x + 6, y + 4, 20, 16);
                ctx.fillStyle = "#fff"; // Keyboard
                ctx.fillRect(x + 4, y + 22, 24, 6);
            }
        }
    }

    drawPlayer();
    drawFloatingTexts();
    drawActionLoader();

    // Night Overlay
    if (state.timeBlock === 3) {
        ctx.fillStyle = "rgba(0, 0, 20, 0.5)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;
    
    const isMoving = keys['ArrowUp'] || keys['KeyW'] || keys['ArrowDown'] || keys['KeyS'] || keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD'];
    const time = Date.now();
    const bob = isMoving ? Math.sin(time / 150) * 1.5 : 0;
    const walk = isMoving ? Math.sin(time / 80) : 0; 

    ctx.save();
    ctx.translate(x + player.width / 2, y + player.height / 2);
    ctx.scale(1.4, 1.4); 
    ctx.translate(-12, -14); 

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(12, 26, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinColor = "#ffdbac"; 
    const hairColor = "#1a1a1a"; 
    const isFemale = state.selectedCharacter === 'female'; // determine hair style

    // female palette / accessories
    const topColor = "#d7bde2"; // lavender
    const skirtColor = "#fadbd8"; // light pink
    const accessoryColor = "#f39c12"; // small hair clip/ ribbon

    const shirtColor = isFemale ? topColor : player.color; 
    const pantsColor = isFemale ? skirtColor : "#34495e";
    const shoeColor = "#222";
    const backpackColor = "#27ae60"; 

    // body adjustments
    const femaleYOffset = isFemale ? -1 : 0;
    const shoulderShrink = isFemale ? 2 : 0; // reduce shoulder width
    const waistShrink = isFemale ? 2 : 0; // reduce torso width

    switch (player.direction) {
        case 'up':
            // if female, draw long hair behind before backpack
            if (isFemale) {
                ctx.fillStyle = hairColor;
                ctx.fillRect(8, 7 + bob, 9, 8);
            }
            // legs / skirt
            if (isFemale) {
                ctx.fillStyle = skirtColor;
                ctx.fillRect(8, 14 + bob + femaleYOffset, 9, 8);
            } else {
                ctx.fillStyle = pantsColor;
                ctx.fillRect(9, 16 + bob + femaleYOffset, 3, 8);
                ctx.fillRect(13, 16 + bob + femaleYOffset, 3, 8);
            }
            ctx.fillStyle = shoeColor;
            ctx.fillRect(9, 24 + bob + femaleYOffset, 3, 2);
            ctx.fillRect(13, 24 + bob + femaleYOffset, 3, 2);
            // shirt / top with adjusted shoulders
            ctx.fillStyle = shirtColor;
            const shirtX = 7 + shoulderShrink/2;
            const shirtW = 11 - shoulderShrink;
            ctx.fillRect(shirtX, 8 + bob + femaleYOffset, shirtW, 9);
            if (isFemale) {
                // collar/ribbon detail at center top
                ctx.fillStyle = accessoryColor;
                ctx.fillRect(shirtX + (shirtW/2 - 1), 8 + bob + femaleYOffset, 2, 1);
            }
            ctx.fillStyle = backpackColor;
            ctx.fillRect(8, 9 + bob + femaleYOffset, 9, 7);
            ctx.fillStyle = "#1e8449"; 
            ctx.fillRect(8, 10 + bob + femaleYOffset, 9, 2);
            ctx.fillStyle = skinColor;
            ctx.fillRect(9, 3 + bob + femaleYOffset, 7, 6);
            ctx.fillStyle = hairColor;
            ctx.fillRect(8, 2 + bob + femaleYOffset, 9, 5);
            ctx.fillRect(8, 2 + bob + femaleYOffset, 9, 7);
            if (isFemale) {
                ctx.fillStyle = accessoryColor;
                ctx.fillRect(10, 1 + bob + femaleYOffset, 2, 1); // clip on forehead
            }
            break;

        case 'left':
            // female long hair on RIGHT side (opposite direction)
            if (isFemale) {
                ctx.fillStyle = hairColor;
                ctx.fillRect(14, 6 + bob + femaleYOffset, 3, 10);
            }
            // skirt/legs
            if (isFemale) {
                // full skirt block always under body, with internal stripes for movement
                ctx.fillStyle = skirtColor;
                const baseX = 10;
                ctx.fillRect(baseX, 16 + bob + femaleYOffset, 5, 6);
                const legSwing = walk; // reduced amplitude so legs stay close
                ctx.fillStyle = "#d2a6b3"; // slightly darker stripe
                ctx.fillRect(baseX + 1 + legSwing, 16 + bob + femaleYOffset, 1, 6);
                ctx.fillRect(baseX + 3 - legSwing, 16 + bob + femaleYOffset, 1, 6);
            } else {
                ctx.fillStyle = pantsColor;
                ctx.fillRect(10 + walk * 2, 16 + bob + femaleYOffset, 4, 8);
            }
            ctx.fillStyle = shoeColor;
            if (isFemale) {
                // smaller shoe motion to keep them next to skirt
                ctx.fillRect(9 + walk, 24 + bob + femaleYOffset, 2, 2);
                ctx.fillRect(12 - walk, 24 + bob + femaleYOffset, 2, 2);
            } else {
                ctx.fillRect(9 + walk * 2, 24 + bob + femaleYOffset, 5, 2);
            }
            // shirt
            ctx.fillStyle = shirtColor;
            const leftShirtX = 10 + shoulderShrink/2;
            const leftShirtW = 5 - shoulderShrink/2;
            ctx.fillRect(leftShirtX, 8 + bob + femaleYOffset, leftShirtW, 9);
            if (isFemale) {
                ctx.fillStyle = accessoryColor;
                ctx.fillRect(leftShirtX + (leftShirtW/2 - 1), 8 + bob + femaleYOffset, 2, 1);
            }
            ctx.fillStyle = backpackColor;
            ctx.fillRect(15, 9 + bob + femaleYOffset, 2, 6);
            ctx.fillStyle = skinColor;
            ctx.fillRect(11, 9 + bob - walk + femaleYOffset, 2, 6);
            ctx.fillStyle = shirtColor;
            ctx.fillRect(11, 8 + bob + femaleYOffset, 2, 3);
            ctx.fillStyle = skinColor;
            ctx.fillRect(9, 3 + bob + femaleYOffset, 6, 6);
            ctx.fillStyle = hairColor;
            ctx.fillRect(9, 2 + bob + femaleYOffset, 7, 4);
            ctx.fillRect(13, 2 + bob + femaleYOffset, 3, 6);
            if (isFemale) {
                ctx.fillStyle = accessoryColor;
                ctx.fillRect(11, 1 + bob + femaleYOffset, 2, 1);
            }
            ctx.fillStyle = "#000";
            ctx.fillRect(9, 5 + bob + femaleYOffset, 1, 1);
            break;

        case 'right':
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-24, 0);
            // female long hair: use same coordinates as left case (14) so mirror flip puts it on left side
            if (isFemale) {
                ctx.fillStyle = hairColor;
                ctx.fillRect(14, 6 + bob + femaleYOffset, 3, 10);
            }
            // skirt/legs
            if (isFemale) {
                ctx.fillStyle = skirtColor;
                const baseX = 10;
                ctx.fillRect(baseX, 16 + bob + femaleYOffset, 5, 6);
                const legSwing = walk;
                ctx.fillStyle = "#d2a6b3";
                ctx.fillRect(baseX + 1 + legSwing, 16 + bob + femaleYOffset, 1, 6);
                ctx.fillRect(baseX + 3 - legSwing, 16 + bob + femaleYOffset, 1, 6);
            } else {
                ctx.fillStyle = pantsColor;
                ctx.fillRect(10 + walk * 2, 16 + bob + femaleYOffset, 4, 8);
            }
            ctx.fillStyle = shoeColor;
            if (isFemale) {
                ctx.fillRect(9 + walk, 24 + bob + femaleYOffset, 2, 2);
                ctx.fillRect(12 - walk, 24 + bob + femaleYOffset, 2, 2);
            } else {
                ctx.fillRect(9 + walk * 2, 24 + bob + femaleYOffset, 5, 2);
            }
            // shirt
            ctx.fillStyle = shirtColor;
            const rightShirtX = 10 + shoulderShrink/2;
            const rightShirtW = 5 - shoulderShrink/2;
            ctx.fillRect(rightShirtX, 8 + bob + femaleYOffset, rightShirtW, 9);
            if (isFemale) {
                ctx.fillStyle = accessoryColor;
                ctx.fillRect(rightShirtX + (rightShirtW/2 - 1), 8 + bob + femaleYOffset, 2, 1);
            }
            ctx.fillStyle = backpackColor;
            ctx.fillRect(15, 9 + bob + femaleYOffset, 2, 6);
            ctx.fillStyle = skinColor;
            ctx.fillRect(11, 9 + bob - walk + femaleYOffset, 2, 6);
            ctx.fillStyle = shirtColor;
            ctx.fillRect(11, 8 + bob + femaleYOffset, 2, 3);
            ctx.fillStyle = skinColor;
            ctx.fillRect(9, 3 + bob + femaleYOffset, 6, 6);
            ctx.fillStyle = hairColor;
            ctx.fillRect(9, 2 + bob + femaleYOffset, 7, 4);
            ctx.fillRect(13, 2 + bob + femaleYOffset, 3, 6);
            if (isFemale) {
                ctx.fillStyle = accessoryColor;
                ctx.fillRect(11, 1 + bob + femaleYOffset, 2, 1);
            }
            ctx.fillStyle = "#000";
            ctx.fillRect(9, 5 + bob + femaleYOffset, 1, 1);
            ctx.restore();
            break;
        
        case 'down':
        default:
            // legs/skirt front
            if (isFemale) {
                ctx.fillStyle = skirtColor;
                ctx.fillRect(8, 16 + bob + femaleYOffset, 9, 6);
            } else {
                ctx.fillStyle = pantsColor;
                ctx.fillRect(9, 16 + bob + femaleYOffset, 3, 8);
                ctx.fillRect(13, 16 + bob + femaleYOffset, 3, 8);
            }
            ctx.fillStyle = shoeColor;
            ctx.fillRect(8, 24 + bob + femaleYOffset, 4, 2);
            ctx.fillRect(12, 24 + bob + femaleYOffset, 4, 2);
            ctx.fillStyle = shirtColor;
            const downShirtX = 7 + shoulderShrink/2;
            const downShirtW = 11 - shoulderShrink;
            ctx.fillRect(downShirtX, 8 + bob + femaleYOffset, downShirtW, 9);
            if (isFemale) {
                ctx.fillStyle = accessoryColor;
                ctx.fillRect(downShirtX + (downShirtW/2 - 1), 8 + bob + femaleYOffset, 2, 1);
            }
            ctx.fillStyle = skinColor;
            ctx.fillRect(5, 9 + bob + femaleYOffset, 2, 6);
            ctx.fillRect(18, 9 + bob + femaleYOffset, 2, 6);
            ctx.fillStyle = shirtColor;
            ctx.fillRect(5, 8 + bob + femaleYOffset, 2, 3);
            ctx.fillRect(18, 8 + bob + femaleYOffset, 2, 3);
            ctx.fillStyle = skinColor;
            ctx.fillRect(9, 3 + bob + femaleYOffset, 7, 6);
            ctx.fillStyle = "#000";
            ctx.fillRect(10, 5 + bob + femaleYOffset, 1, 1);
            ctx.fillRect(14, 5 + bob + femaleYOffset, 1, 1);
            ctx.fillStyle = "#d35400";
            ctx.fillRect(11, 7 + bob + femaleYOffset, 3, 1);
            ctx.fillStyle = hairColor;
            ctx.fillRect(8, 1 + bob + femaleYOffset, 9, 3);
            ctx.fillRect(8, 1 + bob + femaleYOffset, 1, 5);
            ctx.fillRect(16, 1 + bob + femaleYOffset, 1, 5);
            if (isFemale) {
                ctx.fillStyle = accessoryColor;
                ctx.fillRect(10, 1 + bob + femaleYOffset, 2, 1);
            }
            break;
    }

    ctx.restore();

    // Draw baby in arms if player is holding baby
    if (state.babyWithPlayer) {
        drawBabyInArms(x + player.width / 2, y + player.height / 2, player.direction);
    }
}

function drawBabyInCrib(cribX, cribY) {
    // Draw a sleeping baby in the crib
    ctx.save();
    
    // Baby head
    ctx.fillStyle = "#f1c27d"; // Skin color
    ctx.beginPath();
    ctx.arc(cribX + 16, cribY + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Baby body wrapped in blanket
    ctx.fillStyle = "#ff69b4"; // Pink blanket
    ctx.fillRect(cribX + 10, cribY + 16, 12, 10);
    
    // Eyes (closed, sleeping)
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(cribX + 13, cribY + 10, 1, 1);
    ctx.fillRect(cribX + 18, cribY + 10, 1, 1);
    
    ctx.restore();
}

function drawBabyInArms(x, y, direction) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.4, 1.4); // Match player scale
    
    let babyOffsetX = 0;
    let babyOffsetY = 0;
    
    switch(direction) {
        case 'up':
        case 'down':
            babyOffsetX = 0; // Centered
            babyOffsetY = -4;
            break;
        case 'left':
            babyOffsetX = -6;
            babyOffsetY = 0;
            break;
        case 'right':
            babyOffsetX = 6;
            babyOffsetY = 0;
            break;
    }
    
    // Draw relative to center (0,0)
    const babyX = babyOffsetX;
    const babyY = babyOffsetY;
    
    ctx.fillStyle = "#ff69b4"; // Pink
    ctx.beginPath();
    ctx.ellipse(babyX, babyY, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#f1c27d"; // Skin
    ctx.beginPath();
    ctx.arc(babyX, babyY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    if (direction !== 'up') {
        ctx.fillStyle = "#000";
        ctx.fillRect(babyX - 1.5, babyY - 5, 1, 1);
        ctx.fillRect(babyX + 0.5, babyY - 5, 1, 1);
    }
    
    ctx.restore();
}

function addFloatingText(x, y, text, color) {
    state.floatingTexts.push({x, y, text, color, life: 60});
}

function drawFloatingTexts() {
    ctx.font = "10px 'Press Start 2P'";
    for (let ft of state.floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
    }
}

function drawActionLoader() {
    if (!state.isActionLoading) return;

    const now = Date.now();
    // Determine action duration: PickUp is faster, others are standard
    const actionDuration = (state.currentActionType === "Crib" || state.currentActionType === "PickUp") ? BABY_PICKUP_DURATION : ACTION_DURATION;
    const elapsed = now - state.actionLoadStartTime;
    const progress = Math.min(elapsed / actionDuration, 1);

    const centerX = state.actionLocation.x;
    const centerY = state.actionLocation.y;
    const radius = 20;
    const startAngle = -Math.PI / 2; // Start from the top
    const endAngle = startAngle + (progress * 2 * Math.PI);

    // Draw background circle
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 5;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw progress arc
    ctx.beginPath();
    ctx.strokeStyle = '#3498db'; // Blue color for progress
    ctx.lineWidth = 5;
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
}

// --- UI HELPERS ---

function updateUI() {
    document.getElementById('p-energy').value = state.energy;
    document.getElementById('p-stress').value = state.stress;
    document.getElementById('p-baby').value = state.babyHealth;
    document.getElementById('p-school').value = state.schoolProgress;
    document.getElementById('val-money').innerText = "₱" + state.money;
    document.getElementById('val-time').innerText = `Month ${state.month} - Day ${state.day}`;
    document.getElementById('val-clock').innerText = timeBlocks[state.timeBlock];
}

function showModal(title, text, eduText = null) {
    state.isPaused = true;
    const modal = document.getElementById('modal-overlay');
    const mTitle = document.getElementById('modal-title');
    const mText = document.getElementById('modal-text');
    const mEdu = document.getElementById('modal-edu');
    const mActions = document.getElementById('modal-actions');

    mTitle.innerText = title;
    mText.innerText = text;
    
    if (eduText) {
        mEdu.innerText = eduText;
        mEdu.classList.remove('hidden');
    } else {
        mEdu.classList.add('hidden');
    }

    mActions.innerHTML = `<button onclick="closeModal()">OK</button>`;
    modal.classList.remove('hidden');
}

function showConfirm(title, text, onConfirm) {
    state.isPaused = true;
    const modal = document.getElementById('modal-overlay');
    const mTitle = document.getElementById('modal-title');
    const mText = document.getElementById('modal-text');
    const mEdu = document.getElementById('modal-edu');
    const mActions = document.getElementById('modal-actions');

    mTitle.innerText = title;
    mText.innerText = text;
    mEdu.classList.add('hidden');

    // Create buttons dynamically
    mActions.innerHTML = '';
    
    const btnYes = document.createElement('button');
    btnYes.innerText = "Yes";
    btnYes.onclick = () => {
        onConfirm();
        closeModal();
    };

    const btnNo = document.createElement('button');
    btnNo.innerText = "No";
    btnNo.classList.add('danger');
    btnNo.onclick = closeModal;

    mActions.appendChild(btnYes);
    mActions.appendChild(btnNo);

    modal.classList.remove('hidden');
}

window.closeModal = function() {
    document.getElementById('modal-overlay').classList.add('hidden');
    if (!state.isGameOver) {
        state.isPaused = false;
    }
};

function endGame(title, text) {
    state.isGameOver = true;
    showModal(title, text);
    // Remove OK button and add restart button that resets game to initial state
    document.getElementById('modal-actions').innerHTML = '<button onclick="resetGame()">Restart Game</button>';
}

function resetGame() {
    // Reset all game state to initial values
    state.month = 1;
    state.day = 1;
    state.timeBlock = 0;
    state.energy = 100;
    state.stress = 0;
    state.money = 800;
    state.schoolProgress = 100;
    state.babyHealth = 100;
    state.isGameOver = false;
    state.isPaused = false;
    state.isActionLoading = false;
    state.babyCrying = false;
    state.lastVaccineMonth = 0;
    state.burnout = false;
    state.floatingTexts = [];
    state.lastSecondDecayTime = Date.now();
    state.lastTimeBlockChangeTime = Date.now();
    state.actionLoadStartTime = 0;
    state.actionLocation = { x: 0, y: 0 };
    state.actionInitialStats = {};
    state.actionTotalChanges = {};
    state.babyHealthEmergencyShown = false;
    state.stressEmergencyShown = false;
    state.gameOverShown = false;
    state.babyWithPlayer = false;
    state.currentActionType = null;
    
    // Reset player position
    player.x = 15 * TILE_SIZE;
    player.y = 9 * TILE_SIZE;
    
    // Close modal and resume game
    closeModal();
    updateUI();
}

// --- SAVE SYSTEM ---
function saveGame() {
    localStorage.setItem('teenParentSimSave', JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem('teenParentSimSave');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Merge saved state into current state to ensure new fields exist
            Object.assign(state, parsed);
            // Ensure game is not paused on load (modals are hidden by default in HTML)
            state.isPaused = false;
        } catch (e) {
            console.error("Save file corrupted", e);
        }
    }

    // if local storage has a more recent character pick, respect it
    const picked = localStorage.getItem('selectedCharacter');
    if (picked) {
        state.selectedCharacter = picked;
    }
    updatePlayerAppearance();
}

// update visual attributes of the player based on selectedCharacter
function updatePlayerAppearance() {
    if (state.selectedCharacter === 'female') {
        // change shirt color for female
        player.color = '#9b59b6';
    } else {
        // default male
        player.color = '#e74c3c';
    }
}

// Start
window.onload = init;