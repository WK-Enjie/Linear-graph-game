// Coordinate Geometry Learning Tool - CORRECTED VERSION
// Coordinates are ONLY shown in text instructions, NOT visually on canvas until after attempt

const appState = {
    currentLevel: 1,
    targetPoint: { x: 3, y: 4 },
    pointA: { x: -5, y: -2 },
    pointB: { x: 4, y: 7 },
    gradient: null,
    equation: { m: null, c: null },
    userPoints: [],
    userClick: null, // For level 1
    correctAnswers: 0,
    totalQuestions: 4,
    canvasScale: 30, // pixels per unit
    canvasOffset: { x: 300, y: 300 },
    canvasWidth: 600,
    canvasHeight: 600,
    answerSubmitted: false // Track if answer has been submitted
};

const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('level-display');
const progressBar = document.getElementById('progress-bar');
const levelTitle = document.getElementById('level-title');
const instructions = document.getElementById('instructions');
const inputArea = document.getElementById('input-area');
const feedback = document.getElementById('feedback');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');
const coordinatesDisplay = document.getElementById('coordinates-display');
const levelCards = document.querySelectorAll('.level-card');

function init() {
    setupCanvas();
    setupEventListeners();
    loadLevel(appState.currentLevel);
}

function setupCanvas() {
    // Get actual canvas dimensions
    const canvasRect = canvas.getBoundingClientRect();
    appState.canvasWidth = canvasRect.width;
    appState.canvasHeight = canvasRect.height;
    
    // Recalculate offset based on actual size
    appState.canvasOffset = {
        x: appState.canvasWidth / 2,
        y: appState.canvasHeight / 2
    };
    
    // Set canvas scale based on actual size (20 units total)
    appState.canvasScale = Math.min(appState.canvasWidth, appState.canvasHeight) / 20;
    
    drawGrid();
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // FIXED: Proper coordinate calculation
        const gridX = Math.round((x - appState.canvasOffset.x) / appState.canvasScale);
        const gridY = Math.round((appState.canvasOffset.y - y) / appState.canvasScale);
        
        coordinatesDisplay.textContent = `Coordinates: (${gridX}, ${gridY})`;
        
        drawGrid();
        highlightGridCell(gridX, gridY);
        drawLevelContent();
    });
    
    // Touch support for mobile devices
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleCanvasTouch(e, 'start');
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleCanvasTouch(e, 'move');
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleCanvasTouch(e, 'end');
    });
}

function handleCanvasTouch(e, type) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // FIXED: Use the same calculation as mouse events
    const gridX = Math.round((x - appState.canvasOffset.x) / appState.canvasScale);
    const gridY = Math.round((appState.canvasOffset.y - y) / appState.canvasScale);
    
    if (type === 'move') {
        coordinatesDisplay.textContent = `Coordinates: (${gridX}, ${gridY})`;
        drawGrid();
        highlightGridCell(gridX, gridY);
        drawLevelContent();
    } else if (type === 'end') {
        handleCanvasClick(gridX, gridY);
    }
}

function handleCanvasClick(gridX, gridY) {
    if (appState.currentLevel === 1 && !appState.answerSubmitted) {
        appState.userClick = { x: gridX, y: gridY };
        feedback.innerHTML = `You clicked (${gridX}, ${gridY}).<br>Click "Submit Answer" to check.`;
        feedback.className = 'feedback';
    } else if (appState.currentLevel === 4 && !appState.answerSubmitted) {
        if (appState.userPoints.length < 2) {
            appState.userPoints.push({x: gridX, y: gridY});
            drawGrid();
            drawLevelContent();
            
            if (appState.userPoints.length === 2) {
                submitBtn.style.display = 'block';
            }
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    for (let x = -10; x <= 10; x++) {
        const xPos = appState.canvasOffset.x + x * appState.canvasScale;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, canvas.height);
        ctx.stroke();
    }
    
   