// ====================
// GRAPH MASTER - Enhanced Game with Fixed Number Display
// ====================

// Game State
const gameState = {
    // Core values
    currentSlope: 2,
    currentIntercept: 1,
    targetSlope: 2,
    targetIntercept: 1,
    
    // Game progress
    score: 0,
    xp: 0,
    level: 1,
    streak: 0,
    combo: 1,
    
    // Statistics
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalTime: 0,
    avgTime: 0,
    
    // Game settings
    zoomLevel: 1,
    showGrid: true,
    accuracy: 100,
    
    // Next level requirements
    xpForNextLevel: 100,
    
    // Game mode
    isChallengeActive: true,
    timeRemaining: 60,
    timerInterval: null
};

// DOM Elements
const elements = {
    canvas: null,
    ctx: null,
    
    // Display elements
    currentSlopeDisplay: null,
    currentInterceptDisplay: null,
    currentSignDisplay: null,
    targetSlopeDisplay: null,
    targetInterceptDisplay: null,
    targetSignDisplay: null,
    slopeValue: null,
    interceptValue: null,
    scoreDisplay: null,
    xpDisplay: null,
    levelDisplay: null,
    streakDisplay: null,
    comboDisplay: null,
    comboFill: null,
    accuracyDisplay: null,
    zoomLevelDisplay: null,
    timerDisplay: null,
    missionFill: null,
    missionTarget: null,
    
    // Statistics
    correctCount: null,
    incorrectCount: null,
    avgTimeDisplay: null,
    accuracyRate: null,
    progressFill: null,
    currentLevelDisplay: null,
    currentXpDisplay: null,
    nextLevelXpDisplay: null,
    
    // Controls
    slopeSlider: null,
    interceptSlider: null,
    randomBtn: null,
    resetBtn: null,
    hintBtn: null,
    submitBtn: null,
    zoomInBtn: null,
    zoomOutBtn: null,
    gridToggleBtn: null,
    
    // Feedback
    feedback: null,
    feedbackText: null,
    feedbackIcon: null,
    
    // Next challenge
    nextChallengeEq: null,
    
    // Audio
    correctSound: null,
    incorrectSound: null,
    levelUpSound: null
};

// Initialize Game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    showLoadingScreen();
});

function showLoadingScreen() {
    setTimeout(() => {
        document.body.classList.add('loaded');
        startGame();
    }, 1500);
}

function initializeGame() {
    // Get DOM elements
    cacheElements();
    setupCanvas();
    setupEventListeners();
    initializeAudio();
    setupInitialState();
}

function cacheElements() {
    // Canvas
    elements.canvas = document.getElementById('graphCanvas');
    elements.ctx = elements.canvas.getContext('2d');
    
    // Display elements
    elements.currentSlopeDisplay = document.getElementById('current-slope');
    elements.currentInterceptDisplay = document.getElementById('current-intercept');
    elements.currentSignDisplay = document.getElementById('current-sign');
    elements.targetSlopeDisplay = document.getElementById('target-slope');
    elements.targetInterceptDisplay = document.getElementById('target-intercept');
    elements.targetSignDisplay = document.getElementById('target-sign');
    elements.slopeValue = document.getElementById('slope-value');
    elements.interceptValue = document.getElementById('intercept-value');
    elements.scoreDisplay = document.getElementById('score');
    elements.xpDisplay = document.getElementById('xp');
    elements.levelDisplay = document.getElementById('level');
    elements.streakDisplay = document.getElementById('streak');
    elements.comboDisplay = document.getElementById('combo');
    elements.comboFill = document.getElementById('combo-fill');
    elements.accuracyDisplay = document.getElementById('accuracy');
    elements.zoomLevelDisplay = document.getElementById('zoom-level');
    elements.timerDisplay = document.getElementById('timer');
    elements.missionFill = document.getElementById('mission-fill');
    elements.missionTarget = document.getElementById('mission-target');
    
    // Statistics
    elements.correctCount = document.getElementById('correct-count');
    elements.incorrectCount = document.getElementById('incorrect-count');
    elements.avgTimeDisplay = document.getElementById('avg-time');
    elements.accuracyRate = document.getElementById('accuracy-rate');
    elements.progressFill = document.getElementById('progress-fill');
    elements.currentLevelDisplay = document.getElementById('current-level');
    elements.currentXpDisplay = document.getElementById('current-xp');
    elements.nextLevelXpDisplay = document.getElementById('next-level-xp');
    
    // Controls
    elements.slopeSlider = document.getElementById('slope');
    elements.interceptSlider = document.getElementById('intercept');
    elements.randomBtn = document.getElementById('random-btn');
    elements.resetBtn = document.getElementById('reset-btn');
    elements.hintBtn = document.getElementById('hint-btn');
    elements.submitBtn = document.getElementById('submit-btn');
    elements.zoomInBtn = document.getElementById('zoom-in');
    elements.zoomOutBtn = document.getElementById('zoom-out');
    elements.gridToggleBtn = document.getElementById('grid-toggle');
    
    // Feedback
    elements.feedback = document.getElementById('feedback');
    elements.feedbackText = elements.feedback.querySelector('.feedback-text');
    elements.feedbackIcon = elements.feedback.querySelector('.feedback-icon i');
    
    // Next challenge
    elements.nextChallengeEq = document.getElementById('next-challenge-eq');
    
    // Audio
    elements.correctSound = document.getElementById('correctSound');
    elements.incorrectSound = document.getElementById('incorrectSound');
    elements.levelUpSound = document.getElementById('levelUpSound');
}

function setupCanvas() {
    // Set canvas size
    const container = document.querySelector('.graph-canvas-container');
    elements.canvas.width = container.clientWidth - 40;
    elements.canvas.height = 400;
    
    // Draw initial graph
    drawGraph();
}

function setupEventListeners() {
    // Slider events
    elements.slopeSlider.addEventListener('input', handleSlopeChange);
    elements.interceptSlider.addEventListener('input', handleInterceptChange);
    
    // Button events
    elements.randomBtn.addEventListener('click', generateRandomChallenge);
    elements.resetBtn.addEventListener('click', resetToDefault);
    elements.hintBtn.addEventListener('click', showHint);
    elements.submitBtn.addEventListener('click', submitAnswer);
    elements.zoomInBtn.addEventListener('click', zoomIn);
    elements.zoomOutBtn.addEventListener('click', zoomOut);
    elements.gridToggleBtn.addEventListener('click', toggleGrid);
    
    // Window resize
    window.addEventListener('resize', handleResize);
    
    // Touch events for mobile
    elements.canvas.addEventListener('touchstart', handleCanvasTouch);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function initializeAudio() {
    // Preload audio
    if (elements.correctSound) elements.correctSound.load();
    if (elements.incorrectSound) elements.incorrectSound.load();
    if (elements.levelUpSound) elements.levelUpSound.load();
}

function setupInitialState() {
    // Set initial values
    updateDisplays();
    generateNewChallenge();
    startTimer();
    
    // Update statistics
    updateStatistics();
}

// ====================
// GAME LOGIC
// ====================

function startGame() {
    // Remove loading screen
    document.body.classList.add('loaded');
    
    // Start background animations
    animateBackground();
    
    // Show welcome message
    showFeedback('🎮 Welcome to Graph Master! Match the target equation!', 'info', 3000);
}

function generateNewChallenge() {
    // Generate random target equation
    gameState.targetSlope = (Math.random() * 10 - 5).toFixed(1);
    gameState.targetIntercept = Math.floor(Math.random() * 21 - 10);
    
    // Update mission display
    updateMissionDisplay();
    
    // Generate next challenge preview
    generateNextChallengePreview();
    
    // Reset player's current values to defaults
    gameState.currentSlope = 2;
    gameState.currentIntercept = 1;
    elements.slopeSlider.value = gameState.currentSlope;
    elements.interceptSlider.value = gameState.currentIntercept;
    
    // Update accuracy
    calculateAccuracy();
    
    // Redraw graph
    drawGraph();
    updateDisplays();
}

function generateNextChallengePreview() {
    // Generate random values for next challenge preview
    const nextSlope = (Math.random() * 10 - 5).toFixed(1);
    const nextIntercept = Math.floor(Math.random() * 21 - 10);
    const sign = nextIntercept >= 0 ? '+' : '-';
    const absIntercept = Math.abs(nextIntercept);
    
    if (elements.nextChallengeEq) {
        elements.nextChallengeEq.innerHTML = `y = <span class="challenge-slope">${nextSlope}</span>x ${sign} <span class="challenge-intercept">${absIntercept}</span>`;
    }
}

function updateMissionDisplay() {
    // Format the equation properly
    const slope = gameState.targetSlope;
    const intercept = gameState.targetIntercept;
    const sign = intercept >= 0 ? '+' : '-';
    const absIntercept = Math.abs(intercept);
    
    // Format: y = 1.8x - 7 (not y = 1.8x + -7)
    const equationText = `y = ${slope}x ${sign} ${absIntercept}`;
    
    if (elements.missionTarget) {
        elements.missionTarget.textContent = equationText;
    }
    
    // Also update target display
    updateTargetDisplay();
}

function updateTargetDisplay() {
    const slope = gameState.targetSlope;
    const intercept = gameState.targetIntercept;
    const sign = intercept >= 0 ? '+' : '-';
    const absIntercept = Math.abs(intercept);
    
    // Update target displays
    elements.targetSlopeDisplay.textContent = slope;
    elements.targetInterceptDisplay.textContent = absIntercept;
    elements.targetSignDisplay.textContent = sign;
}

function handleSlopeChange() {
    gameState.currentSlope = parseFloat(this.value);
    calculateAccuracy();
    updateDisplays();
    drawGraph();
}

function handleInterceptChange() {
    gameState.currentIntercept = parseInt(this.value);
    calculateAccuracy();
    updateDisplays();
    drawGraph();
}

function calculateAccuracy() {
    const slopeDiff = Math.abs(gameState.currentSlope - gameState.targetSlope);
    const interceptDiff = Math.abs(gameState.currentIntercept - gameState.targetIntercept);
    
    // Calculate accuracy percentage (100% - errors)
    const slopeAccuracy = Math.max(0, 100 - (slopeDiff * 10));
    const interceptAccuracy = Math.max(0, 100 - (interceptDiff * 5));
    
    gameState.accuracy = Math.round((slopeAccuracy + interceptAccuracy) / 2);
    elements.accuracyDisplay.textContent = `${gameState.accuracy}%`;
}

function updateDisplays() {
    // Update current equation displays with proper sign
    const currentSign = gameState.currentIntercept >= 0 ? '+' : '-';
    const currentAbsIntercept = Math.abs(gameState.currentIntercept);
    
    elements.currentSlopeDisplay.textContent = gameState.currentSlope.toFixed(1);
    elements.currentInterceptDisplay.textContent = currentAbsIntercept;
    elements.currentSignDisplay.textContent = currentSign;
    
    // Update target equation displays
    updateTargetDisplay();
    
    // Update control values
    elements.slopeValue.textContent = gameState.currentSlope.toFixed(1);
    elements.interceptValue.textContent = gameState.currentIntercept;
    
    // Update game stats
    elements.scoreDisplay.textContent = gameState.score.toLocaleString();
    elements.xpDisplay.textContent = gameState.xp.toLocaleString();
    elements.levelDisplay.textContent = gameState.level;
    elements.streakDisplay.textContent = gameState.streak;
    elements.comboDisplay.textContent = `${gameState.combo}x`;
    
    // Update combo bar
    const comboPercent = Math.min(100, gameState.streak * 10);
    elements.comboFill.style.width = `${comboPercent}%`;
    
    // Update mission progress
    const missionPercent = (gameState.accuracy / 100) * 100;
    elements.missionFill.style.width = `${missionPercent}%`;
    
    // Update progress bar
    const progressPercent = (gameState.xp / gameState.xpForNextLevel) * 100;
    elements.progressFill.style.width = `${progressPercent}%`;
    elements.currentLevelDisplay.textContent = gameState.level;
    elements.currentXpDisplay.textContent = gameState.xp.toLocaleString();
    elements.nextLevelXpDisplay.textContent = gameState.xpForNextLevel.toLocaleString();
}

function updateStatistics() {
    elements.correctCount.textContent = gameState.correctAnswers.toLocaleString();
    elements.incorrectCount.textContent = gameState.incorrectAnswers.toLocaleString();
    elements.avgTimeDisplay.textContent = `${gameState.avgTime.toFixed(1)}s`;
    elements.accuracyRate.textContent = `${calculateOverallAccuracy()}%`;
}

function calculateOverallAccuracy() {
    const total = gameState.correctAnswers + gameState.incorrectAnswers;
    return total > 0 ? Math.round((gameState.correctAnswers / total) * 100) : 0;
}

// ====================
// GRAPH RENDERING
// ====================

function drawGraph() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Draw grid if enabled
    if (gameState.showGrid) {
        drawGrid();
    }
    
    // Draw axes
    drawAxes();
    
    // Draw target line (semi-transparent)
    drawLine(gameState.targetSlope, gameState.targetIntercept, 'rgba(16, 185, 129, 0.3)', 2);
    
    // Draw current line
    drawLine(gameState.currentSlope, gameState.currentIntercept, '#6366f1', 3);
    
    // Draw points
    drawPoints();
    
    // Draw labels
    drawLabels();
}

function drawBackground() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    const scale = 40 * gameState.zoomLevel;
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = originX % scale; x < canvas.width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = originY % scale; y < canvas.height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawAxes() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    
    // X-axis
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, canvas.height);
    ctx.stroke();
    
    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // X-axis labels
    const scale = 40 * gameState.zoomLevel;
    const maxX = Math.floor(canvas.width / (2 * scale));
    
    for (let i = -maxX; i <= maxX; i++) {
        if (i === 0) continue;
        const x = originX + i * scale;
        ctx.fillText(i.toString(), x, originY + 15);
    }
    
    // Y-axis labels
    const maxY = Math.floor(canvas.height / (2 * scale));
    
    for (let i = -maxY; i <= maxY; i++) {
        if (i === 0) continue;
        const y = originY - i * scale;
        ctx.fillText(i.toString(), originX - 15, y);
    }
    
    // Origin label
    ctx.fillText('0', originX - 10, originY + 10);
}

function drawLine(slope, intercept, color, width) {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    const scale = 40 * gameState.zoomLevel;
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    
    // Calculate line points
    const x1 = -10;
    const y1 = slope * x1 + intercept;
    const x2 = 10;
    const y2 = slope * x2 + intercept;
    
    // Convert to canvas coordinates
    const canvasX1 = originX + x1 * scale;
    const canvasY1 = originY - y1 * scale;
    const canvasX2 = originX + x2 * scale;
    const canvasY2 = originY - y2 * scale;
    
    // Draw line
    ctx.moveTo(canvasX1, canvasY1);
    ctx.lineTo(canvasX2, canvasY2);
    ctx.stroke();
}

function drawPoints() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    const scale = 40 * gameState.zoomLevel;
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    
    // Draw y-intercept point for current line
    const interceptY = originY - gameState.currentIntercept * scale;
    
    ctx.fillStyle = '#e91e63';
    ctx.beginPath();
    ctx.arc(originX, interceptY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw intercept label
    ctx.fillStyle = '#e91e63';
    ctx.font = 'bold 14px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText(`(0, ${gameState.currentIntercept})`, originX + 10, interceptY - 10);
}

function drawLabels() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    
    // Draw slope triangle if slope is not zero
    if (gameState.currentSlope !== 0) {
        const scale = 40 * gameState.zoomLevel;
        const triangleX = 3;
        const triangleY = gameState.currentSlope * triangleX + gameState.currentIntercept;
        
        const startX = originX + triangleX * scale;
        const startY = originY - triangleY * scale;
        const endX = startX;
        const endY = originY - gameState.currentIntercept * scale;
        
        // Draw triangle
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(originX, endY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Slope label
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(`slope = ${gameState.currentSlope.toFixed(1)}`, (originX + startX) / 2, (startY + endY) / 2 - 10);
    }
}

// ====================
// GAME ACTIONS
// ====================

function generateRandomChallenge() {
    generateNewChallenge();
    showFeedback('🎲 New challenge generated!', 'info', 2000);
    animateButton(elements.randomBtn);
}

function resetToDefault() {
    gameState.currentSlope = 2;
    gameState.currentIntercept = 1;
    elements.slopeSlider.value = gameState.currentSlope;
    elements.interceptSlider.value = gameState.currentIntercept;
    
    calculateAccuracy();
    updateDisplays();
    drawGraph();
    
    showFeedback('🔄 Reset to default values', 'info', 2000);
    animateButton(elements.resetBtn);
}

function showHint() {
    const slopeHint = gameState.currentSlope < gameState.targetSlope ? 'Increase slope' : 'Decrease slope';
    const interceptHint = gameState.currentIntercept < gameState.targetIntercept ? 'Increase intercept' : 'Decrease intercept';
    
    showFeedback(`💡 Hint: ${slopeHint} and ${interceptHint}`, 'info', 3000);
    animateButton(elements.hintBtn);
}

function submitAnswer() {
    const slopeDiff = Math.abs(gameState.currentSlope - gameState.targetSlope);
    const interceptDiff = Math.abs(gameState.currentIntercept - gameState.targetIntercept);
    
    // Check if answer is correct (within tolerance)
    const isCorrect = slopeDiff < 0.1 && interceptDiff === 0;
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
    
    animateButton(elements.submitBtn);
}

function handleCorrectAnswer() {
    // Calculate points
    const basePoints = 10;
    const streakBonus = gameState.streak * 2;
    const comboMultiplier = gameState.combo;
    const timeBonus = Math.max(0, 60 - gameState.timeRemaining);
    
    const pointsEarned = Math.round((basePoints + streakBonus + timeBonus) * comboMultiplier);
    const xpEarned = Math.round(pointsEarned * 1.5);
    
    // Update game state
    gameState.score += pointsEarned;
    gameState.xp += xpEarned;
    gameState.correctAnswers++;
    gameState.streak++;
    gameState.combo = Math.min(5, Math.floor(gameState.streak / 3) + 1);
    
    // Update average time
    const timeUsed = 60 - gameState.timeRemaining;
    gameState.totalTime += timeUsed;
    gameState.avgTime = gameState.totalTime / gameState.correctAnswers;
    
    // Check for level up
    checkLevelUp();
    
    // Play sound
    playSound('correct');
    
    // Show celebration
    showConfetti();
    showFeedback(`🎉 Perfect! +${pointsEarned} points! Streak: ${gameState.streak}`, 'success', 3000);
    
    // Generate new challenge
    setTimeout(() => {
        generateNewChallenge();
        resetTimer();
    }, 2000);
    
    // Update displays
    updateDisplays();
    updateStatistics();
}

function handleIncorrectAnswer() {
    // Update game state
    gameState.incorrectAnswers++;
    gameState.streak = 0;
    gameState.combo = 1;
    
    // Play sound
    playSound('incorrect');
    
    // Show feedback
    showFeedback('❌ Not quite right. Try again!', 'error', 3000);
    
    // Update displays
    updateDisplays();
    updateStatistics();
}

function checkLevelUp() {
    if (gameState.xp >= gameState.xpForNextLevel) {
        gameState.level++;
        gameState.xp = gameState.xp - gameState.xpForNextLevel;
        gameState.xpForNextLevel = Math.round(gameState.xpForNextLevel * 1.5);
        
        // Play level up sound
        playSound('levelUp');
        
        // Show level up message
        showFeedback(`🚀 Level Up! You're now Level ${gameState.level}!`, 'success', 4000);
        
        // Update badges
        updateBadges();
    }
}

function updateBadges() {
    const badges = document.querySelectorAll('.badge');
    
    // Unlock badges based on level
    if (gameState.level >= 3) {
        badges[2].classList.remove('locked');
        badges[2].classList.add('earned');
        badges[2].innerHTML = '<i class="fas fa-crown"></i><span>Graph Master</span>';
    }
    
    if (calculateOverallAccuracy() >= 100) {
        badges[3].classList.remove('locked');
        badges[3].classList.add('earned');
        badges[3].innerHTML = '<i class="fas fa-star"></i><span>Perfect Score</span>';
    }
}

// ====================
// UI CONTROLS
// ====================

function zoomIn() {
    if (gameState.zoomLevel < 2) {
        gameState.zoomLevel += 0.25;
        updateZoomDisplay();
        drawGraph();
        animateButton(elements.zoomInBtn);
    }
}

function zoomOut() {
    if (gameState.zoomLevel > 0.5) {
        gameState.zoomLevel -= 0.25;
        updateZoomDisplay();
        drawGraph();
        animateButton(elements.zoomOutBtn);
    }
}

function updateZoomDisplay() {
    elements.zoomLevelDisplay.textContent = `${gameState.zoomLevel.toFixed(2)}x`;
}

function toggleGrid() {
    gameState.showGrid = !gameState.showGrid;
    drawGraph();
    
    const icon = elements.gridToggleBtn.querySelector('i');
    if (gameState.showGrid) {
        icon.className = 'fas fa-th';
        showFeedback('📊 Grid enabled', 'info', 1500);
    } else {
        icon.className = 'fas fa-th-large';
        showFeedback('📊 Grid disabled', 'info', 1500);
    }
    
    animateButton(elements.gridToggleBtn);
}

function handleResize() {
    const container = document.querySelector('.graph-canvas-container');
    elements.canvas.width = container.clientWidth - 40;
    drawGraph();
}

function handleCanvasTouch(e) {
    e.preventDefault();
    // Handle touch interactions for graph
}

function handleKeyboardShortcuts(e) {
    switch(e.key) {
        case 'r':
        case 'R':
            generateRandomChallenge();
            break;
        case 'h':
        case 'H':
            showHint();
            break;
        case 'Enter':
            submitAnswer();
            break;
        case ' ':
            resetToDefault();
            break;
        case '+':
            zoomIn();
            break;
        case '-':
            zoomOut();
            break;
        case 'g':
        case 'G':
            toggleGrid();
            break;
    }
}

// ====================
// FEEDBACK & ANIMATIONS
// ====================

function showFeedback(message, type, duration = 3000) {
    const feedback = elements.feedback;
    const feedbackText = elements.feedbackText;
    const feedbackIcon = elements.feedbackIcon;
    
    // Set message and type
    feedbackText.textContent = message;
    
    // Set icon based on type
    switch(type) {
        case 'success':
            feedbackIcon.className = 'fas fa-check-circle';
            feedback.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.1))';
            feedback.style.borderLeft = '4px solid #10b981';
            break;
        case 'error':
            feedbackIcon.className = 'fas fa-times-circle';
            feedback.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))';
            feedback.style.borderLeft = '4px solid #ef4444';
            break;
        case 'info':
            feedbackIcon.className = 'fas fa-info-circle';
            feedback.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))';
            feedback.style.borderLeft = '4px solid #3b82f6';
            break;
        case 'warning':
            feedbackIcon.className = 'fas fa-exclamation-triangle';
            feedback.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))';
            feedback.style.borderLeft = '4px solid #f59e0b';
            break;
    }
    
    // Show feedback with animation
    feedback.style.display = 'flex';
    feedback.style.animation = 'slideIn 0.3s ease';
    
    // Hide after duration
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            feedback.style.display = 'none';
            feedback.style.animation = '';
        }, 300);
    }, duration);
}

function animateButton(button) {
    button.style.transform = 'scale(0.95)';
    button.style.boxShadow = 'inset 0 0 20px rgba(255, 255, 255, 0.2)';
    
    setTimeout(() => {
        button.style.transform = '';
        button.style.boxShadow = '';
    }, 200);
}

function showConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        
        container.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

function playSound(type) {
    let sound;
    
    switch(type) {
        case 'correct':
            sound = elements.correctSound;
            break;
        case 'incorrect':
            sound = elements.incorrectSound;
            break;
        case 'levelUp':
            sound = elements.levelUpSound;
            break;
    }
    
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function animateBackground() {
    // Add subtle animations to background elements
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach(shape => {
        shape.style.animationDuration = `${20 + Math.random() * 10}s`;
    });
}

// ====================
// TIMER FUNCTIONS
// ====================

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (gameState.timeRemaining > 0) {
        gameState.timeRemaining--;
        elements.timerDisplay.textContent = gameState.timeRemaining;
        
        // Flash warning when time is running low
        if (gameState.timeRemaining <= 10) {
            elements.timerDisplay.style.color = '#ef4444';
            elements.timerDisplay.style.animation = 'pulse 1s infinite';
        }
    } else {
        // Time's up!
        clearInterval(gameState.timerInterval);
        showFeedback('⏰ Time\'s up! New challenge starting...', 'warning', 2000);
        
        // Generate new challenge
        setTimeout(() => {
            generateNewChallenge();
            resetTimer();
        }, 2000);
    }
}

function resetTimer() {
    gameState.timeRemaining = 60;
    elements.timerDisplay.textContent = gameState.timeRemaining;
    elements.timerDisplay.style.color = '#f59e0b';
    elements.timerDisplay.style.animation = '';
    startTimer();
}

// ====================
// UTILITY FUNCTIONS
// ====================

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function formatNumber(num, decimals = 2) {
    return parseFloat(num.toFixed(decimals));
}

// ====================
// INITIALIZATION COMPLETE
// ====================

console.log('🎮 Graph Master initialized successfully!');