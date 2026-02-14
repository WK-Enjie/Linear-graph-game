const state = {
    level: 1,
    target: null,
    points: [],
    equation: { m: 0, c: 0 },
    tablePoints: [],
    answered: false
};

const game = {
    active: false,
    processing: false,
    type: null,
    score: 0,
    timer: 60,
    interval: null,
    givenPoints: [],
    targetPoint: null,
    shapeName: "",
    line1: { m: 0, c: 0 },
    line2: { m: 0, c: 0 },
    sameGradient: false
};

document.addEventListener('DOMContentLoaded', () => {
    try {
        initCanvas('mainCanvas');
        initCanvas('gameCanvas');
        setupEvents();
        loadLevel(1);
    } catch(e) { console.error(e); }
});

function initCanvas(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
        const parent = canvas.parentElement;
        if (parent.clientWidth > 0) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientWidth;
            drawGrid(ctx, canvas);
            if (id === 'mainCanvas') redrawMain();
            if (id === 'gameCanvas' && game.active) drawGame();
        }
    };

    // Force initial resize
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
}

function setupEvents() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
            
            if (btn.dataset.tab === 'games') {
                stopGame();
                setTimeout(() => {
                    const gCanvas = document.getElementById('gameCanvas');
                    gCanvas.width = gCanvas.parentElement.clientWidth;
                    gCanvas.height = gCanvas.parentElement.clientWidth;
                    drawGrid(gCanvas.getContext('2d'), gCanvas);
                }, 50);
            }
        });
    });

    // Main Canvas Events
    const mainCanvas = document.getElementById('mainCanvas');
    mainCanvas.addEventListener('mousedown', handleMainClick);
    mainCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleMainClick(e.touches[0]); }, {passive: false});
    mainCanvas.addEventListener('mousemove', (e) => updateCoordDisplay(e, 'coordDisplay', mainCanvas));

    // Game Canvas Events
    const gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.addEventListener('mousedown', handleGameClick);
    gameCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleGameClick(e.touches[0]); }, {passive: false});

    // Buttons
    document.getElementById('checkBtn').addEventListener('click', checkAnswer);
    document.getElementById('nextBtn').addEventListener('click', () => loadLevel(state.level + 1));
    document.getElementById('resetBtn').addEventListener('click', () => loadLevel(state.level));

    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => startGame(card.dataset.game));
    });

    document.getElementById('exitGame').addEventListener('click', stopGame);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').style.display = 'none';
        startGame(game.type);
    });
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').style.display = 'none';
        stopGame();
    });
}

function handleMainClick(e) {
    const canvas = document.getElementById('mainCanvas');
    const c = getCoords(canvas, e);
    
    if (state.level === 1) {
        state.points = [c];
    } else if (state.level === 5) {
        if(state.points.length >= 2) state.points = [];
        state.points.push(c);
    }
    redrawMain();
}

// --- Level Logic ---
function loadLevel(lvl) {
    state.level = lvl > 5 ? 1 : lvl;
    state.answered = false;
    state.points = [];
    state.tablePoints = [];
    
    // UI Reset
    document.getElementById('levelProgress').style.width = (state.level * 20) + '%';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('checkBtn').style.display = 'block';
    document.getElementById('feedbackArea').className = 'feedback-area';
    document.getElementById('feedbackArea').innerText = '';
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('inputArea').innerHTML = '';

    const title = document.getElementById('questionTitle');
    const text = document.getElementById('questionText');
    const label = document.getElementById('levelLabel');

    if (state.level === 1) {
        label.innerText = "Level 1: Coordinates";
        state.target = { x: rand(-8, 8), y: rand(-8, 8) };
        title.innerText = "Plotting Points";
        text.innerHTML = `Click the grid to plot: <span class="highlight">(${state.target.x}, ${state.target.y})</span>`;
    } 
    else if (state.level === 2) {
        label.innerText = "Level 2: Gradients";
        let x1 = rand(-7, 2);
        let x2 = x1 + rand(3, 5);
        let y1 = rand(-6, 6);
        let y2 = rand(-6, 6);
        state.points = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
        title.innerText = "Find the Gradient (m)";
        text.innerHTML = `Calculate slope between <b>A(${x1}, ${y1})</b> and <b>B(${x2}, ${y2})</b><br><small>m = (y₂ - y₁) ÷ (x₂ - x₁)</small>`;
        document.getElementById('inputArea').innerHTML = `<div class="input-row"><label>m =</label><input type="text" id="gradInput" placeholder="e.g. 2 or 1/2"></div>`;
    } 
    else if (state.level === 3) {
        label.innerText = "Level 3: Line Equations";
        let m = rand(0, 1) === 0 ? rand(1, 2) : rand(-2, -1);
        let c = rand(-3, 3);
        state.equation = { m: m, c: c };
        title.innerText = "Find Equation (y = mx + c)";
        text.innerHTML = `Find the equation of the line shown.<br><small>Find y-intercept (c) then gradient (m)</small>`;
        document.getElementById('inputArea').innerHTML = `
            <div class="input-row"><label>m:</label><input type="number" id="mVal" placeholder="Gradient"></div>
            <div class="input-row"><label>c:</label><input type="number" id="cVal" placeholder="Y-Intercept"></div>`;
    } 
    else if (state.level === 4) {
        label.innerText = "Level 4: Table of Values";
        let m = rand(1, 2) * (Math.random() > 0.5 ? 1 : -1);
        let c = rand(-2, 2);
        state.equation = { m: m, c: c };
        const xVals = [-2, 0, 2];
        state.tablePoints = xVals.map(x => ({ x: x, y: m * x + c }));
        
        title.innerText = "Complete the Table";
        text.innerHTML = `Calculate y-values for: <span class="highlight">y = ${m}x ${c >= 0 ? '+' : ''} ${c}</span>`;
        
        document.getElementById('tableContainer').style.display = 'block';
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';
        xVals.forEach((x, i) => {
            tbody.innerHTML += `<tr><td>${x}</td><td><input type="number" id="tbl_y_${i}" class="table-input" placeholder="?"></td></tr>`;
        });
    } 
    else if (state.level === 5) {
        label.innerText = "Level 5: Graphing";
        state.equation = { m: rand(1, 2), c: rand(-3, 1) };
        title.innerText = "Plot the Line";
        text.innerHTML = `Plot 2 points for: <b>y = ${state.equation.m}x ${state.equation.c >= 0 ? '+' : ''} ${state.equation.c}</b>`;
    }

    redrawMain();
}

function checkAnswer() {
    let correct = false;
    const fb = document.getElementById('feedbackArea');

    if (state.level === 1) {
        if (!state.points.length) { fb.innerText = "Click the grid!"; fb.className = "feedback-area error"; return; }
        correct = state.points[0].x === state.target.x && state.points[0].y === state.target.y;
    } 
    else if (state.level === 2) {
        const val = evalFraction(document.getElementById('gradInput').value);
        const m = (state.points[1].y - state.points[0].y) / (state.points[1].x - state.points[0].x);
        correct = val !== null && Math.abs(val - m) < 0.01;
    } 
    else if (state.level === 3) {
        const um = parseFloat(document.getElementById('mVal').value);
        const uc = parseFloat(document.getElementById('cVal').value);
        correct = um === state.equation.m && uc === state.equation.c;
    } 
    else if (state.level === 4) {
        let allCorrect = true;
        state.tablePoints.forEach((p, i) => {
            const input = document.getElementById(`tbl_y_${i}`);
            if (parseInt(input.value) !== p.y) {
                input.style.borderColor = "red";
                allCorrect = false;
            } else {
                input.style.borderColor = "#16a34a";
                input.style.backgroundColor = "#dcfce7";
            }
        });
        correct = allCorrect;
        if(correct) state.points = [...state.tablePoints];
    } 
    else if (state.level === 5) {
        if (state.points.length < 2) { fb.innerText = "Plot 2 points!"; fb.className = "feedback-area error"; return; }
        correct = state.points.every(p => Math.abs(p.y - (state.equation.m * p.x + state.equation.c)) < 0.1);
    }

    if (correct) {
        state.answered = true;
        fb.innerText = "Correct! 🎉";
        fb.className = "feedback-area success";
        document.getElementById('checkBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'block';
        redrawMain();
    } else {
        fb.innerText = "Try again!";
        fb.className = "feedback-area error";
    }
}

// --- Drawing ---
function drawGrid(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;
    const unit = w / 20;
    ctx.clearRect(0, 0, w, h);
    
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e2e8f0';
    for (let i = 0; i <= 20; i++) {
        ctx.beginPath(); ctx.moveTo(i * unit, 0); ctx.lineTo(i * unit, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * unit); ctx.lineTo(w, i * unit); ctx.stroke();
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for(let i=-10; i<=10; i+=2) {
        if(i===0) continue;
        ctx.fillText(i, w/2 + i*unit, h/2 + 15);
        ctx.fillText(i, w/2 - 15, h/2 - i*unit);
    }
}

function redrawMain() {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    drawGrid(ctx, canvas);

    if (state.level === 1) state.points.forEach(p => drawPoint(ctx, canvas, p.x, p.y, '#4f46e5'));
    else if (state.level === 2) {
        state.points.forEach(p => drawPoint(ctx, canvas, p.x, p.y, '#4f46e5'));
        drawLine(ctx, canvas, state.points[0], state.points[1], '#4f46e5');
    }
    else if (state.level === 3) drawLineEquation(ctx, canvas, state.equation.m, state.equation.c, '#4f46e5');
    else if (state.level === 4) {
        if (state.answered) {
            state.points.forEach(p => drawPoint(ctx, canvas, p.x, p.y, '#16a34a'));
            drawLineEquation(ctx, canvas, state.equation.m, state.equation.c, '#16a34a');
        }
    }
    else if (state.level === 5) {
        state.points.forEach(p => drawPoint(ctx, canvas, p.x, p.y, '#4f46e5'));
        if (state.answered) drawLineEquation(ctx, canvas, state.equation.m, state.equation.c, '#16a34a');
    }
}

// --- Game Logic ---
function startGame(type) {
    game.active = true;
    game.processing = false;
    game.type = type;
    game.score = 0;
    game.timer = 60;
    game.givenPoints = [];
    game.targetPoint = null;
    
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('gameInterface').style.display = 'flex';
    document.getElementById('gameScore').innerText = 0;
    document.getElementById('gameTimer').innerText = 60;

    const gCanvas = document.getElementById('gameCanvas');
    gCanvas.width = gCanvas.parentElement.clientWidth;
    gCanvas.height = gCanvas.parentElement.clientWidth;
    drawGrid(gCanvas.getContext('2d'), gCanvas);

    const instructions = document.getElementById('gameInstructions');
    const actionArea = document.getElementById('gameActionArea');

    if (type === 'shape') {
        instructions.innerHTML = `<strong>🔷 Shape Builder</strong><br>We provide the starting points.<br>Click the LAST point to complete the shape!`;
        actionArea.innerHTML = '';
        generateShapeQuestion();
    } else {
        instructions.innerHTML = `<strong>⚖️ Gradient Matcher</strong><br>Do these lines have the same gradient?`;
        actionArea.innerHTML = `<div class="game-buttons"><button class="btn btn-success" onclick="answerGradient(true)">YES</button><button class="btn btn-secondary" onclick="answerGradient(false)">NO</button></div>`;
        generateGradientQuestion();
    }

    clearInterval(game.interval);
    game.interval = setInterval(() => {
        game.timer--;
        document.getElementById('gameTimer').innerText = game.timer;
        if (game.timer <= 0) endGame();
    }, 1000);
}

function generateShapeQuestion() {
    const shapeType = rand(1, 3); // 1:Square, 2:Rect, 3:Para (Triangles removed)
    let points = [];
    let name = "";
    let valid = false;
    const inBound = (p) => p.x >= -9 && p.x <= 9 && p.y >= -9 && p.y <= 9;

    while (!valid) {
        const startX = rand(-6, 4);
        const startY = rand(-6, 4);
        if (shapeType === 1) { 
            const s = rand(3, 5); name = "Square";
            points = [ {x:startX, y:startY}, {x:startX+s, y:startY}, {x:startX+s, y:startY+s}, {x:startX, y:startY+s} ];
        } else if (shapeType === 2) { 
            const w = rand(3, 6); const h = rand(2, 5); if(w===h) continue; name = "Rectangle";
            points = [ {x:startX, y:startY}, {x:startX+w, y:startY}, {x:startX+w, y:startY+h}, {x:startX, y:startY+h} ];
        } else if (shapeType === 3) { 
            const w = rand(3, 5); const h = rand(3, 5); const shift = rand(1, 3); name = "Parallelogram";
            points = [ {x:startX, y:startY}, {x:startX+w, y:startY}, {x:startX+w+shift, y:startY+h}, {x:startX+shift, y:startY+h} ];
        }
        if (points.every(inBound)) valid = true;
    }

    game.shapeName = name;
    game.targetPoint = points.pop(); 
    game.givenPoints = points;
    document.getElementById('gameQuestionBox').innerHTML = `Make a <strong>${name}</strong>!<br>Click the final missing point.`;
    drawGame();
}

function handleGameClick(e) {
    if (!game.active || game.type !== 'shape' || game.processing) return;
    const canvas = document.getElementById('gameCanvas');
    const c = getCoords(canvas, e);
    const target = game.targetPoint;
    
    if (c.x === target.x && c.y === target.y) {
        game.processing = true;
        game.score += 20;
        document.getElementById('gameScore').innerText = game.score;
        game.givenPoints.push(game.targetPoint); 
        drawGame(); 
        setTimeout(() => {
             game.processing = false;
             generateShapeQuestion();
        }, 800);
    } else {
        canvas.style.borderColor = 'red';
        setTimeout(() => canvas.style.borderColor = '#cbd5e1', 200);
    }
}

function generateGradientQuestion() {
    const m1 = rand(1, 3);
    const same = Math.random() > 0.5;
    const m2 = same ? m1 : (m1 === 1 ? 2 : 1);
    game.sameGradient = same;
    game.line1 = { m: m1, c: rand(-3, 3) };
    game.line2 = { m: m2, c: rand(-3, 3) };
    document.getElementById('gameQuestionBox').innerHTML = `Line A: y = ${m1}x ${game.line1.c >= 0 ? '+' : ''}${game.line1.c}<br>Line B: y = ${m2}x ${game.line2.c >= 0 ? '+' : ''}${game.line2.c}`;
    drawGame();
}

function answerGradient(ans) {
    if(ans === game.sameGradient) {
        game.score += 10;
        document.getElementById('gameScore').innerText = game.score;
    }
    generateGradientQuestion();
}

function drawGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    drawGrid(ctx, canvas);
    
    if (game.type === 'shape') {
        const points = game.givenPoints;
        if (points.length > 0) {
            ctx.beginPath();
            const start = toCanvas(canvas, points[0].x, points[0].y);
            ctx.moveTo(start.x, start.y);
            for(let i=1; i<points.length; i++) {
                const p = toCanvas(canvas, points[i].x, points[i].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2; ctx.stroke();
            
            // Close loop if full shape (which is always 4 points now)
            if (points.length === 4) {
                 ctx.beginPath();
                 const last = toCanvas(canvas, points[points.length-1].x, points[points.length-1].y);
                 const first = toCanvas(canvas, points[0].x, points[0].y);
                 ctx.moveTo(last.x, last.y); ctx.lineTo(first.x, first.y); ctx.stroke();
            }
            points.forEach(p => drawPoint(ctx, canvas, p.x, p.y, '#4f46e5'));
        }
    } else {
        drawLineEquation(ctx, canvas, game.line1.m, game.line1.c, '#4f46e5');
        drawLineEquation(ctx, canvas, game.line2.m, game.line2.c, '#e11d48');
    }
}

// --- Helpers ---
function stopGame() {
    game.active = false;
    clearInterval(game.interval);
    document.getElementById('gameInterface').style.display = 'none';
    document.getElementById('gameMenu').style.display = 'grid';
}

function endGame() {
    stopGame();
    document.getElementById('finalScore').innerText = game.score;
    document.getElementById('gameOverModal').style.display = 'flex';
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1) + min); }
function evalFraction(s) { if(!s) return null; if(s.includes('/')) { let [n,d]=s.split('/'); return n/d; } return parseFloat(s); }
function toCanvas(c, x, y) { const u = c.width/20; return { x: c.width/2 + x*u, y: c.height/2 - y*u }; }
function getCoords(c, e) {
    const r = c.getBoundingClientRect();
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;
    const u = c.width/20;
    return { x: Math.round((x - r.left - c.width/2)/u), y: Math.round((c.height/2 - (y - r.top))/u) };
}
function drawPoint(ctx, c, x, y, color, size=6) {
    const p = toCanvas(c, x, y);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI*2); ctx.fill();
}
function drawLine(ctx, c, p1, p2, color) {
    const s = toCanvas(c, p1.x, p1.y); const e = toCanvas(c, p2.x, p2.y);
    ctx.strokeStyle = color; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(e.x, e.y); ctx.stroke();
}
function drawLineEquation(ctx, c, m, int, color) {
    const p1 = {x: -10, y: m*-10+int}; const p2 = {x: 10, y: m*10+int};
    drawLine(ctx, c, p1, p2, color);
}
function updateCoordDisplay(e, id, c) {
    const coords = getCoords(c, e);
    document.getElementById(id).innerText = `(${coords.x}, ${coords.y})`;
}

window.answerGradient = answerGradient;