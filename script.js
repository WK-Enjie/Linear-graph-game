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
    // CRITICAL FIX FOR GITHUB PAGES: Set explicit canvas dimensions to prevent browser scaling
    canvas.width = 600;
    canvas.height = 600;
    
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
    
    // Draw horizontal grid lines
    for (let y = -10; y <= 10; y++) {
        const yPos = appState.canvasOffset.y - y * appState.canvasScale;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(canvas.width, yPos);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, appState.canvasOffset.y);
    ctx.lineTo(canvas.width, appState.canvasOffset.y);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(appState.canvasOffset.x, 0);
    ctx.lineTo(appState.canvasOffset.x, canvas.height);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // X-axis labels
    for (let x = -10; x <= 10; x++) {
        if (x === 0) continue;
        const xPos = appState.canvasOffset.x + x * appState.canvasScale;
        ctx.fillText(x.toString(), xPos, appState.canvasOffset.y + 5);
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = -10; y <= 10; y++) {
        if (y === 0) continue;
        const yPos = appState.canvasOffset.y - y * appState.canvasScale;
        ctx.fillText(y.toString(), appState.canvasOffset.x - 5, yPos);
    }
}

function highlightGridCell(x, y) {
    const xPos = appState.canvasOffset.x + x * appState.canvasScale;
    const yPos = appState.canvasOffset.y - y * appState.canvasScale;
    
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.fillRect(
        xPos - appState.canvasScale/2, 
        yPos - appState.canvasScale/2, 
        appState.canvasScale, 
        appState.canvasScale
    );
    
    // Draw crosshair
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos, canvas.height);
    ctx.stroke();
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(canvas.width, yPos);
    ctx.stroke();
    
    ctx.setLineDash([]);
}

// CRITICAL FIX: Only draw points AFTER submission for Level 1
// For Levels 2-3: Draw points but WITHOUT coordinate labels on canvas
function drawLevelContent() {
    switch(appState.currentLevel) {
        case 1:
            // ONLY show target point AFTER submission (for feedback)
            if (appState.answerSubmitted && appState.userClick) {
                // Show where they clicked
                drawPoint(appState.userClick.x, appState.userClick.y, '#f39c12', 'You', false);
                // Show correct answer
                drawPoint(appState.targetPoint.x, appState.targetPoint.y, '#2ecc71', '✓', false);
            }
            break;
            
        case 2:
        case 3:
            // Draw points WITHOUT coordinate labels on canvas (only "A" and "B")
            drawPoint(appState.pointA.x, appState.pointA.y, '#3498db', 'A', false);
            drawPoint(appState.pointB.x, appState.pointB.y, '#e74c3c', 'B', false);
            drawLine(appState.pointA.x, appState.pointA.y, appState.pointB.x, appState.pointB.y, '#95a5a6');
            break;
            
        case 4:
            // Draw target line AFTER submission for feedback
            if (appState.answerSubmitted && appState.equation.m !== null) {
                drawEquationLine(appState.equation.m, appState.equation.c, '#2ecc71');
            }
            
            // Always show user-plotted points
            appState.userPoints.forEach((point, index) => {
                drawPoint(point.x, point.y, '#f39c12', `P${index+1}`, false);
            });
            
            // Draw line between user points if there are two
            if (appState.userPoints.length === 2) {
                drawLine(
                    appState.userPoints[0].x, appState.userPoints[0].y,
                    appState.userPoints[1].x, appState.userPoints[1].y,
                    '#f39c12'
                );
            }
            break;
    }
}

// Updated drawPoint: added showCoords parameter (default false)
function drawPoint(x, y, color, label, showCoords = false) {
    const xPos = appState.canvasOffset.x + x * appState.canvasScale;
    const yPos = appState.canvasOffset.y - y * appState.canvasScale;
    
    ctx.beginPath();
    ctx.arc(xPos, yPos, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // ONLY show coordinate labels if explicitly requested
    if (showCoords && label) {
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`(${x}, ${y})`, xPos + 10, yPos - 10);
    }
    
    // Always show the point label (A, B, You, etc.)
    if (label) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, xPos, yPos);
    }
}

// FIXED: Corrected arrowhead drawing for double arrows
function drawLine(x1, y1, x2, y2, color) {
    const xPos1 = appState.canvasOffset.x + x1 * appState.canvasScale;
    const yPos1 = appState.canvasOffset.y - y1 * appState.canvasScale;
    const xPos2 = appState.canvasOffset.x + x2 * appState.canvasScale;
    const yPos2 = appState.canvasOffset.y - y2 * appState.canvasScale;
    
    ctx.beginPath();
    ctx.moveTo(xPos1, yPos1);
    ctx.lineTo(xPos2, yPos2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw arrowheads to indicate line extends infinitely
    drawArrowhead(xPos1, yPos1, xPos2, yPos2, color);
    drawArrowhead(xPos2, yPos2, xPos1, yPos1, color);
}

// FIXED: Corrected arrowhead positioning
function drawArrowhead(xFrom, yFrom, xTo, yTo, color) {
    const angle = Math.atan2(yTo - yFrom, xTo - xFrom);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    
    ctx.beginPath();
    ctx.moveTo(xTo, yTo);
    ctx.lineTo(
        xTo - arrowLength * Math.cos(angle - arrowAngle),
        yTo - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
        xTo - arrowLength * Math.cos(angle + arrowAngle),
        yTo - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawEquationLine(m, c, color) {
    // Calculate two points on the line within the grid bounds
    const x1 = -10;
    const y1 = m * x1 + c;
    const x2 = 10;
    const y2 = m * x2 + c;
    
    // Only draw if points are within visible grid
    if (Math.abs(y1) <= 12 && Math.abs(y2) <= 12) {
        drawLine(x1, y1, x2, y2, color);
        
        // Label the line with its equation
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const xPos = appState.canvasOffset.x + midX * appState.canvasScale;
        const yPos = appState.canvasOffset.y - midY * appState.canvasScale;
        
        ctx.fillStyle = color;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Format the equation nicely
        let equationStr = 'y = ';
        if (m === 1) {
            equationStr += 'x';
        } else if (m === -1) {
            equationStr += '-x';
        } else if (m !== 0) {
            equationStr += `${m}x`;
        }
        
        if (c > 0) {
            equationStr += ` + ${c}`;
        } else if (c < 0) {
            equationStr += ` - ${Math.abs(c)}`;
        }
        
        ctx.fillText(equationStr, xPos, yPos - 10);
    }
}

function setupEventListeners() {
    submitBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', () => {
        appState.currentLevel++;
        if (appState.currentLevel > appState.totalQuestions) {
            appState.currentLevel = 1;
        }
        loadLevel(appState.currentLevel);
    });
    
    resetBtn.addEventListener('click', () => {
        appState.answerSubmitted = false;
        appState.userClick = null;
        appState.userPoints = [];
        feedback.textContent = '';
        feedback.className = 'feedback';
        submitBtn.style.display = 'block';
        nextBtn.style.display = 'none';
        
        if (appState.currentLevel === 1) {
            drawGrid();
            drawLevelContent();
        } else if (appState.currentLevel === 4) {
            drawGrid();
            drawLevelContent();
            submitBtn.style.display = 'none';
        }
    });
    
    levelCards.forEach(card => {
        card.addEventListener('click', () => {
            const level = parseInt(card.getAttribute('data-level'));
            appState.currentLevel = level;
            loadLevel(level);
            
            levelCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

function loadLevel(level) {
    appState.answerSubmitted = false;
    appState.userClick = null;
    appState.userPoints = [];
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    levelDisplay.textContent = level;
    progressBar.style.width = `${(level / appState.totalQuestions) * 100}%`;
    
    levelCards.forEach(card => {
        card.classList.toggle('active', parseInt(card.getAttribute('data-level')) === level);
    });
    
    switch(level) {
        case 1:
            levelTitle.textContent = "Level 1: Coordinate Basics";
            appState.targetPoint = {
                x: getRandomInt(-8, 8),
                y: getRandomInt(-8, 8)
            };
            instructions.innerHTML = `
                <p><strong>Find the point:</strong> <span id="target-point">(${appState.targetPoint.x}, ${appState.targetPoint.y})</span></p>
                <p>Click or tap directly on the grid where you think this point is located</p>
                <p class="hint">💡 Remember: First number = x (horizontal), Second number = y (vertical)</p>
            `;
            inputArea.innerHTML = '';
            submitBtn.style.display = 'block';
            nextBtn.style.display = 'none';
            break;
            
        case 2:
            levelTitle.textContent = "Level 2: Gradient (Slope)";
            generateGradientProblem();
            instructions.innerHTML = `
                <p><strong>Points:</strong> A${getPointString(appState.pointA)} and B${getPointString(appState.pointB)}</p>
                <p>Calculate the gradient (slope) of the line between these points</p>
                <p>Formula: m = (y₂ - y₁) / (x₂ - x₁)</p>
            `;
            inputArea.innerHTML = `
                <div class="input-group">
                    <label for="gradient-input">Gradient (m):</label>
                    <input type="text" id="gradient-input" placeholder="Enter as fraction (2/3) or decimal (0.67)">
                </div>
            `;
            submitBtn.style.display = 'block';
            nextBtn.style.display = 'none';
            break;
            
        case 3:
            levelTitle.textContent = "Level 3: Line Equations";
            generateEquationProblem();
            instructions.innerHTML = `
                <p><strong>Points:</strong> A${getPointString(appState.pointA)} and B${getPointString(appState.pointB)}</p>
                <p>Find the equation in form: y = mx + c</p>
                <p>First calculate gradient (m), then y-intercept (c)</p>
            `;
            inputArea.innerHTML = `
                <div class="input-group">
                    <label for="gradient-m">Gradient (m):</label>
                    <input type="text" id="gradient-m" placeholder="e.g., 2/3 or 0.67">
                </div>
                <div class="input-group">
                    <label for="y-intercept">Y-intercept (c):</label>
                    <input type="text" id="y-intercept" placeholder="e.g., 4 or -2.5">
                </div>
            `;
            submitBtn.style.display = 'block';
            nextBtn.style.display = 'none';
            break;
            
        case 4:
            levelTitle.textContent = "Level 4: Graph Drawing";
            generateGraphProblem();
            instructions.innerHTML = `
                <p><strong>Equation:</strong> <span id="equation-display">${getEquationString(appState.equation)}</span></p>
                <p>Click or tap on the grid to plot TWO points that lie on this line</p>
                <p>After plotting both points, click "Submit Answer"</p>
            `;
            inputArea.innerHTML = '';
            submitBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            break;
    }
    
    drawGrid();
    drawLevelContent();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGradientProblem() {
    do {
        appState.pointA = { x: getRandomInt(-8, -2), y: getRandomInt(-8, 8) };
        appState.pointB = { x: getRandomInt(2, 8), y: getRandomInt(-8, 8) };
    } while (appState.pointA.x === appState.pointB.x);
}

function generateEquationProblem() {
    do {
        appState.pointA = { x: getRandomInt(-8, -2), y: getRandomInt(-8, 8) };
        appState.pointB = { x: getRandomInt(2, 8), y: getRandomInt(-8, 8) };
    } while (appState.pointA.x === appState.pointB.x);
    
    const dx = appState.pointB.x - appState.pointA.x;
    const dy = appState.pointB.y - appState.pointA.y;
    const m = dy / dx;
    const c = appState.pointA.y - m * appState.pointA.x;
    
    appState.equation = { m: roundToTwoDecimals(m), c: roundToTwoDecimals(c) };
}

function generateGraphProblem() {
    const m = getRandomInt(-3, 3);
    const c = getRandomInt(-5, 5);
    appState.equation = { m, c };
}

function getPointString(point) {
    return `(${point.x}, ${point.y})`;
}

function getEquationString(equation) {
    let str = 'y = ';
    
    if (equation.m === 0) {
        return `y = ${equation.c}`;
    }
    
    if (equation.m === 1) {
        str += 'x';
    } else if (equation.m === -1) {
        str += '-x';
    } else {
        str += `${equation.m}x`;
    }
    
    if (equation.c > 0) {
        str += ` + ${equation.c}`;
    } else if (equation.c < 0) {
        str += ` - ${Math.abs(equation.c)}`;
    }
    
    return str;
}

function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}

function checkAnswer() {
    appState.answerSubmitted = true;
    
    switch(appState.currentLevel) {
        case 1:
            checkCoordinateAnswer();
            break;
        case 2:
            checkGradientAnswer();
            break;
        case 3:
            checkEquationAnswer();
            break;
        case 4:
            checkGraphAnswer();
            break;
    }
    
    // Redraw to show feedback visuals
    drawGrid();
    drawLevelContent();
}

function checkCoordinateAnswer() {
    if (!appState.userClick) {
        showFeedback(false, "Please click or tap on the grid first to select a point.");
        appState.answerSubmitted = false;
        return;
    }
    
    const distance = Math.sqrt(
        Math.pow(appState.userClick.x - appState.targetPoint.x, 2) + 
        Math.pow(appState.userClick.y - appState.targetPoint.y, 2)
    );
    
    if (distance < 1.5) {
        showFeedback(true, `✓ Correct! (${appState.userClick.x}, ${appState.userClick.y}) matches the target.`);
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    } else {
        showFeedback(false, `✗ You clicked (${appState.userClick.x}, ${appState.userClick.y}).<br>The target was (${appState.targetPoint.x}, ${appState.targetPoint.y}).`);
        feedback.innerHTML += `<br><span class="feedback reveal">✓ Correct point shown in green on the grid</span>`;
    }
}

function checkGradientAnswer() {
    const input = document.getElementById('gradient-input').value.trim();
    if (!input) {
        showFeedback(false, "Please enter a value for the gradient.");
        appState.answerSubmitted = false;
        return;
    }
    
    const dx = appState.pointB.x - appState.pointA.x;
    const dy = appState.pointB.y - appState.pointA.y;
    const correctGradient = dy / dx;
    
    let userGradient;
    if (input.includes('/')) {
        const [numerator, denominator] = input.split('/');
        userGradient = parseFloat(numerator) / parseFloat(denominator);
    } else {
        userGradient = parseFloat(input);
    }
    
    if (Math.abs(userGradient - correctGradient) < 0.05) {
        showFeedback(true, `✓ Correct! Gradient = ${correctGradient.toFixed(2)}`);
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    } else {
        showFeedback(false, `✗ Not quite. Correct gradient = ${correctGradient.toFixed(2)}`);
    }
}

function checkEquationAnswer() {
    const mInput = document.getElementById('gradient-m').value.trim();
    const cInput = document.getElementById('y-intercept').value.trim();
    
    if (!mInput || !cInput) {
        showFeedback(false, "Please enter values for both m and c.");
        appState.answerSubmitted = false;
        return;
    }
    
    const dx = appState.pointB.x - appState.pointA.x;
    const dy = appState.pointB.y - appState.pointA.y;
    const correctM = roundToTwoDecimals(dy / dx);
    const correctC = roundToTwoDecimals(appState.pointA.y - correctM * appState.pointA.x);
    
    let userM, userC;
    if (mInput.includes('/')) {
        const [numerator, denominator] = mInput.split('/');
        userM = roundToTwoDecimals(parseFloat(numerator) / parseFloat(denominator));
    } else {
        userM = roundToTwoDecimals(parseFloat(mInput));
    }
    userC = roundToTwoDecimals(parseFloat(cInput));
    
    const mCorrect = Math.abs(userM - correctM) < 0.05;
    const cCorrect = Math.abs(userC - correctC) < 0.05;
    
    if (mCorrect && cCorrect) {
        showFeedback(true, `✓ Perfect! Equation: y = ${correctM}x ${correctC >= 0 ? '+' : ''} ${correctC}`);
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    } else if (mCorrect) {
        showFeedback(false, `△ Gradient correct, but y-intercept should be ${correctC}`);
    } else if (cCorrect) {
        showFeedback(false, `△ Y-intercept correct, but gradient should be ${correctM}`);
    } else {
        showFeedback(false, `✗ Not quite. Correct equation: y = ${correctM}x ${correctC >= 0 ? '+' : ''} ${correctC}`);
    }
}

function checkGraphAnswer() {
    if (appState.userPoints.length < 2) {
        showFeedback(false, "Please plot two points on the grid first.");
        appState.answerSubmitted = false;
        return;
    }
    
    const p1 = appState.userPoints[0];
    const p2 = appState.userPoints[1];
    const dx = p2.x - p1.x;
    
    if (dx === 0) {
        showFeedback(false, "Vertical line detected, but target equation is not vertical.");
        return;
    }
    
    const dy = p2.y - p1.y;
    const userM = roundToTwoDecimals(dy / dx);
    const userC = roundToTwoDecimals(p1.y - userM * p1.x);
    
    const mCorrect = Math.abs(userM - appState.equation.m) < 0.15;
    const cCorrect = Math.abs(userC - appState.equation.c) < 1.0;
    
    if (mCorrect && cCorrect) {
        showFeedback(true, `✓ Excellent! Your line matches ${getEquationString(appState.equation)}`);
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    } else {
        showFeedback(false, `✗ Target equation: ${getEquationString(appState.equation)}<br><span class="feedback reveal">✓ Correct line shown in green on the grid</span>`);
    }
}

function showFeedback(isCorrect, message) {
    feedback.innerHTML = message;
    feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
}

window.addEventListener('DOMContentLoaded', init);