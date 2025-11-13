
        const $ = (sel, root = document) => root.querySelector(sel);
        const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

        const MODE_TO_TARGET = {
            beginner: 'easy',
            easy: 'easy',
            medium: 'medium',
            hard: 'hard',
            daily: 'medium'
            // or: 'hard': { minClues: 24, maxClues: 32, techniques: { NS:true, HS:true, NP:true, HP:true, PC:true } }
        };

        const COLOR_THEMES = {
            default: {
                '--bg': '#f7f9fe',
                '--panel': '#ffffff',
                '--text': '#0d1321',
                '--muted': '#5a657a',
                '--accent': '#1352ff',
                '--accent-2': '#0ea86f'
            },
            warm: {
                '--bg': '#fff7f1',
                '--panel': '#fff1e0',
                '--text': '#2d1400',
                '--muted': '#7a4e30',
                '--accent': '#f97316',
                '--accent-2': '#facc15'
            },
            mono: {
                '--bg': '#f2f2f2',
                '--panel': '#ffffff',
                '--text': '#111111',
                '--muted': '#4f4f4f',
                '--accent': '#1f7ae0',
                '--accent-2': '#0e9b6b'
            }
        };

        const TIP_IDLE_MS = 12000;
        let audioCtx = null;

        const MODE_THEMES = {
            beginner: {
                label: 'Beginner Bloom',
                icon: '🌱',
                tagline: 'Guided play with generous highlights while you learn the patterns.',
                progress: 25,
                confetti: ['#8ec5ff', '#b5f6ff', '#c3ffd9'],
                perks: [
                    { label: 'Guidance', value: 'Row • Column • Box highlights' },
                    { label: 'Mistake shield', value: 'Unlimited retries' },
                    { label: 'Hints', value: 'Direct placements allowed' }
                ],
                tokens: {
                    '--bg': '#f5f8ff',
                    '--panel': '#ffffff',
                    '--text': '#0d1321',
                    '--muted': '#5a657a',
                    '--accent': '#3b82f6',
                    '--accent-2': '#22c55e',
                    '--warn': '#f59e0b',
                    '--error': '#ef4444',
                    '--grid-line': '#d9e3ff',
                    '--grid-strong': '#9cb2ff',
                    '--grid-outer': '#4361ee',
                    '--sel': '#e4f0ff',
                    '--hilite': '#f4f7ff',
                    '--ok': '#059669',
                    '--btn-bg': '#ffffff',
                    '--btn-fg': '#0d1321',
                    '--btn-border': '#d2ddff',
                    '--shadow': '0 12px 32px rgba(15, 35, 95, 0.12)',
                    '--bg-gradient': 'linear-gradient(135deg, #f7f9ff 0%, #eef6ff 55%, #fdf7ff 100%)',
                    '--ambient-1': 'rgba(67, 97, 238, 0.28)',
                    '--ambient-2': 'rgba(14, 165, 233, 0.24)',
                    '--ambient-3': 'rgba(16, 185, 129, 0.2)',
                    '--glow-accent': 'rgba(67, 97, 238, 0.45)'
                }
            },
            easy: {
                label: 'Easy Ember',
                icon: '🌤️',
                tagline: 'Classic flow with subtle row guidance and forgiving tempo.',
                progress: 45,
                confetti: ['#ffd89c', '#ff9a8b', '#f6d365'],
                perks: [
                    { label: 'Guidance', value: 'Row highlights' },
                    { label: 'Mistake shield', value: '5 chances' },
                    { label: 'Hints', value: 'Direct placements allowed' }
                ],
                tokens: {
                    '--bg': '#fff9f4',
                    '--panel': '#ffffff',
                    '--text': '#2c1b18',
                    '--muted': '#7a5d57',
                    '--accent': '#f97316',
                    '--accent-2': '#facc15',
                    '--warn': '#f59e0b',
                    '--error': '#dc2626',
                    '--grid-line': '#fde4cf',
                    '--grid-strong': '#f8b4a3',
                    '--grid-outer': '#f97316',
                    '--sel': '#fff4e6',
                    '--hilite': '#fff8ed',
                    '--ok': '#16a34a',
                    '--btn-bg': '#fffdf9',
                    '--btn-fg': '#2c1b18',
                    '--btn-border': '#fcd8b6',
                    '--shadow': '0 12px 30px rgba(255, 149, 58, 0.18)',
                    '--bg-gradient': 'linear-gradient(135deg, #fff7ed 0%, #ffe0c3 60%, #ffd4e1 100%)',
                    '--ambient-1': 'rgba(249, 115, 22, 0.25)',
                    '--ambient-2': 'rgba(236, 72, 153, 0.18)',
                    '--ambient-3': 'rgba(250, 204, 21, 0.22)',
                    '--glow-accent': 'rgba(249, 115, 22, 0.45)'
                }
            },
            medium: {
                label: 'Medium Pulse',
                icon: '⚡',
                tagline: 'Sharper tempo with tighter mistake limits and neon guidance.',
                progress: 70,
                confetti: ['#a855f7', '#38bdf8', '#f472b6'],
                perks: [
                    { label: 'Guidance', value: 'Focus-only highlighting' },
                    { label: 'Mistake shield', value: '3 chances' },
                    { label: 'Hints', value: 'Manual strategy encouraged' }
                ],
                tokens: {
                    '--bg': '#f4f0ff',
                    '--panel': '#fcfbff',
                    '--text': '#140f2d',
                    '--muted': '#6b5b8d',
                    '--accent': '#8b5cf6',
                    '--accent-2': '#22d3ee',
                    '--warn': '#f97316',
                    '--error': '#f43f5e',
                    '--grid-line': '#d7d0f0',
                    '--grid-strong': '#b69cf4',
                    '--grid-outer': '#7c3aed',
                    '--sel': '#f1eaff',
                    '--hilite': '#f7f4ff',
                    '--ok': '#14b8a6',
                    '--btn-bg': '#fdfcff',
                    '--btn-fg': '#140f2d',
                    '--btn-border': '#d2c7ff',
                    '--shadow': '0 14px 36px rgba(96, 56, 190, 0.2)',
                    '--bg-gradient': 'linear-gradient(135deg, #f5f0ff 0%, #efe7ff 45%, #dff5ff 100%)',
                    '--ambient-1': 'rgba(139, 92, 246, 0.3)',
                    '--ambient-2': 'rgba(14, 165, 233, 0.24)',
                    '--ambient-3': 'rgba(244, 114, 182, 0.24)',
                    '--glow-accent': 'rgba(139, 92, 246, 0.5)'
                }
            },
            hard: {
                label: 'Hard Eclipse',
                icon: '🚀',
                tagline: 'Precision sprint — one mistake and the grid locks down.',
                progress: 95,
                confetti: ['#facc15', '#f43f5e', '#60a5fa'],
                perks: [
                    { label: 'Guidance', value: 'Pure focus mode' },
                    { label: 'Mistake shield', value: 'Single strike' },
                    { label: 'Hints', value: 'Use sparingly!' }
                ],
                tokens: {
                    '--bg': '#050812',
                    '--panel': '#11162c',
                    '--text': '#eff2ff',
                    '--muted': '#9ca3c8',
                    '--accent': '#60a5fa',
                    '--accent-2': '#f87171',
                    '--warn': '#facc15',
                    '--error': '#f87171',
                    '--grid-line': '#202642',
                    '--grid-strong': '#3d4b73',
                    '--grid-outer': '#60a5fa',
                    '--sel': '#182547',
                    '--hilite': '#131b35',
                    '--ok': '#4ade80',
                    '--btn-bg': '#161d39',
                    '--btn-fg': '#eff2ff',
                    '--btn-border': '#28335d',
                    '--shadow': '0 18px 40px rgba(0, 0, 0, 0.55)',
                    '--bg-gradient': 'linear-gradient(160deg, #05070f 0%, #131a3a 55%, #341938 100%)',
                    '--ambient-1': 'rgba(96, 165, 250, 0.25)',
                    '--ambient-2': 'rgba(248, 113, 113, 0.2)',
                    '--ambient-3': 'rgba(244, 114, 182, 0.18)',
                    '--glow-accent': 'rgba(96, 165, 250, 0.5)'
                }
            },
            daily: {
                label: 'Daily Quest',
                icon: '📅',
                tagline: 'A fresh seeded puzzle each day to keep your streak alive.',
                progress: 80,
                confetti: ['#60a5fa', '#a78bfa', '#34d399'],
                perks: [
                    { label: 'Guidance', value: 'Medium-level assists' },
                    { label: 'Mistake shield', value: '3 chances' },
                    { label: 'Hints', value: 'Manual logic encouraged' }
                ],
                tokens: {
                    '--bg': '#f1f6ff',
                    '--panel': '#ffffff',
                    '--text': '#0f172a',
                    '--muted': '#5b6478',
                    '--accent': '#2563eb',
                    '--accent-2': '#14b8a6',
                    '--warn': '#facc15',
                    '--error': '#f87171',
                    '--grid-line': '#d8e3ff',
                    '--grid-strong': '#9cb7ff',
                    '--grid-outer': '#2563eb',
                    '--sel': '#dbeafe',
                    '--hilite': '#f0f7ff',
                    '--ok': '#22c55e',
                    '--btn-bg': '#f7fbff',
                    '--btn-fg': '#0f172a',
                    '--btn-border': '#cfe1ff',
                    '--shadow': '0 14px 32px rgba(37, 99, 235, 0.16)',
                    '--bg-gradient': 'linear-gradient(135deg, #f1f6ff 0%, #dfefff 60%, #f6f7ff 100%)',
                    '--ambient-1': 'rgba(37, 99, 235, 0.25)',
                    '--ambient-2': 'rgba(20, 184, 166, 0.18)',
                    '--ambient-3': 'rgba(14, 165, 233, 0.18)',
                    '--glow-accent': 'rgba(37, 99, 235, 0.45)'
                }
            }
        };

        const MOBILE_BREAKPOINT = window.matchMedia('(max-width: 759px)');

        let state = {
            mode: 'beginner',
            givens: Array(81).fill(0),
            cells: Array(81).fill(0),
            solution: Array(81).fill(0),
            sel: null,
            pencilMode: false,
            pencils: [],
            timerId: null,
            elapsedSeconds: 0,
            wrongMoves: 0,
            wrongMovesLimit: Infinity,
            gameOver: false,
            isPaused: false,
            history: [],
            future: [],
            completedNumbers: new Set(),
            streak: 0,
            bestStreak: 0,
            soundOn: false,
            colorTheme: 'default',
            tipTimer: null,
            lastActionAt: Date.now(),
            dailySeed: null
        };

        function applyModeTheme(mode) {
            const theme = MODE_THEMES[mode] || MODE_THEMES.beginner;
            const root = document.documentElement;
            Object.entries(theme.tokens).forEach(([token, value]) => {
                root.style.setProperty(token, value);
            });

            const chip = $('#level-chip');
            if (chip) chip.textContent = `${theme.icon} ${theme.label}`;

            const flavor = $('#level-flavor');
            if (flavor) flavor.textContent = theme.tagline;

            const details = $('#level-details');
            if (details) {
                details.innerHTML = theme.perks.map(perk => `
                    <div class="level-detail">
                        <span class="detail-label">${perk.label}</span>
                        <span class="detail-value">${perk.value}</span>
                    </div>
                `).join('');
            }

            updateLevelProgress();
        }

        function applyColorTheme(name) {
            const theme = COLOR_THEMES[name] || COLOR_THEMES.default;
            Object.entries(theme).forEach(([token, value]) => {
                document.documentElement.style.setProperty(token, value);
            });
            state.colorTheme = name;
            localStorage.setItem('sudokuPalette', name);
        }

        function burstConfetti({ count = 24, mode = state.mode } = {}) {
            const layer = $('#confetti-layer');
            if (!layer) return;
            const palette = MODE_THEMES[mode]?.confetti || ['#ffffff'];
            for (let i = 0; i < count; i++) {
                const piece = document.createElement('span');
                piece.className = 'confetti-piece';
                piece.style.background = palette[i % palette.length];
                piece.style.left = `${Math.random() * 100}%`;
                piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 30}vw`);
                piece.style.setProperty('--spin', `${Math.random() > 0.5 ? 1 : -1}`);
                piece.style.setProperty('--confetti-duration', `${1.6 + Math.random() * 1.2}s`);
                layer.appendChild(piece);
                setTimeout(() => piece.remove(), 2400);
            }
        }

        function flashBoard() {
            const board = $('#board');
            if (!board) return;
            board.classList.remove('board-flash');
            // Force reflow so the animation can restart
            void board.offsetWidth;
            board.classList.add('board-flash');
        }

        function pulseWrongCell(i, { clearValue = false, extraCells = [] } = {}) {
            const mainCell = cellAt(i);
            if (!mainCell) return;
            const row = Math.floor(i / 9), col = i % 9;
            const affected = new Set();
            affected.add(mainCell);
            const extraNodes = new Set();

            for (let c = 0; c < 9; c++) affected.add($cell(row, c));
            for (let r = 0; r < 9; r++) affected.add($cell(r, col));
            const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
            for (let r = br; r < br + 3; r++) {
                for (let c = bc; c < bc + 3; c++) affected.add($cell(r, c));
            }

            extraCells.forEach(idx => {
                const extraCell = cellAt(idx);
                if (extraCell) {
                    affected.add(extraCell);
                    extraNodes.add(extraCell);
                }
            });

            affected.forEach(cell => {
                if (!cell) return;
                if (cell === mainCell || extraNodes.has(cell)) cell.classList.add('wrong-flash');
                else cell.classList.add('wrong-section');
            });

            setTimeout(() => {
                affected.forEach(cell => {
                    if (!cell) return;
                    cell.classList.remove('wrong-section');
                    if (cell === mainCell || extraNodes.has(cell)) cell.classList.remove('wrong-flash');
                });
                if (clearValue) {
                    state.cells[i] = 0;
                    state.pencils[i].clear();
                    mainCell.textContent = '';
                    renderPencils(mainCell, i);
                    highlightMatchingNumbers(0);
                }
            }, 620);
        }

        function focusBoard() {
            const board = $('#board');
            if (!board) return;
            board.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function toggleSound() {
            state.soundOn = !state.soundOn;
            updateSoundButton();
            localStorage.setItem('sudokuSound', state.soundOn ? '1' : '0');
            if (state.soundOn && !audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function updateSoundButton() {
            const btn = $('#sound-toggle');
            if (!btn) return;
            btn.classList.toggle('active', state.soundOn);
            btn.textContent = state.soundOn ? '🔊 On' : '🔈 Off';
        }

        function toggleMenu(force) {
            const panel = $('#menu-panel');
            if (!panel) return;
            const willShow = typeof force === 'boolean' ? force : !panel.classList.contains('show');
            panel.classList.toggle('show', willShow);
        }

        function closeMenu() {
            toggleMenu(false);
        }

        function playTone(type) {
            if (!state.soundOn) return;
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const now = audioCtx.currentTime;
            const map = {
                correct: 620,
                row: 700,
                box: 520,
                combo: 840,
                win: 940,
                wrong: 240
            };
            osc.frequency.value = map[type] || 520;
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc.type = 'sine';
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        }

        function showNumberToast(message) {
            const toast = $('#number-toast');
            if (!toast) return;
            toast.textContent = message;
            toast.classList.add('show');
            clearTimeout(showNumberToast.timeoutId);
            showNumberToast.timeoutId = setTimeout(() => toast.classList.remove('show'), 2200);
        }

        function numberButton(num) {
            return $(`.pad button[data-num="${num}"]`);
        }

        function celebrateNumber(num) {
            showNumberToast(`Great job! All ${num}s are locked in.`);
            setStatus(`🎉 All ${num}s are complete!`);
            burstConfetti({ count: 18, mode: state.mode });
            const btn = numberButton(num);
            if (btn) {
                btn.classList.remove('celebrate');
                void btn.offsetWidth;
                btn.classList.add('celebrate');
                setTimeout(() => btn.classList.remove('celebrate'), 1600);
            }
            const cellsToFlash = [];
            const rowSets = new Set();
            const colSets = new Set();
            for (let i = 0; i < 81; i++) {
                if (state.cells[i] === num) {
                    const cell = cellAt(i);
                    if (cell) cellsToFlash.push(cell);
                    rowSets.add(Math.floor(i / 9));
                    colSets.add(i % 9);
                }
            }
            addTempClass(cellsToFlash, 'number-celebrate', 1000);
            setTimeout(() => {
                highlightMatchingNumbers(0);
            }, 1000);
            rowSets.forEach(r => {
                const rowCells = [];
                for (let c = 0; c < 9; c++) rowCells.push($cell(r, c));
                addTempClass(rowCells, 'row-celebrate', 900);
            });
            colSets.forEach(c => {
                const colCells = [];
                for (let r = 0; r < 9; r++) colCells.push($cell(r, c));
                addTempClass(colCells, 'row-celebrate', 900);
            });
            if (state.activeTip && state.activeTip.includes(`${num}`)) {
                setTipMessage('Tip cleared. Keep going!');
            }
        }

        function incrementStreak() {
            state.streak++;
            if (state.streak > state.bestStreak) state.bestStreak = state.streak;
            updateStreakDisplays();
        }

        function resetStreak() {
            if (state.streak === 0) return;
            state.streak = 0;
            updateStreakDisplays();
        }

        function updateStreakDisplays() {
            const streakEl = $('#streak');
            if (streakEl) streakEl.textContent = state.streak;
            const bestEl = $('#best-streak');
            if (bestEl) bestEl.textContent = `Best: ${state.bestStreak}`;
        }

        function scheduleTip() {
            if (state.tipTimer) clearTimeout(state.tipTimer);
            state.lastActionAt = Date.now();
            state.tipTimer = setTimeout(showIdleTip, TIP_IDLE_MS);
        }

        function showIdleTip() {
            const tip = computeTipMessage();
            state.activeTip = tip;
            const textEl = $('#tip-text');
            if (textEl) textEl.textContent = tip;
            const modePill = $('#mode-pill');
            if (modePill) modePill.textContent = `Mode: ${modeLabel(state.mode)}`;
        }

        function computeTipMessage() {
            for (let r = 0; r < 9; r++) {
                const zeros = state.cells.slice(r * 9, r * 9 + 9).filter(v => v === 0).length;
                if (zeros === 1) return `Tip: Row ${r + 1} has just one open cell.`;
            }
            for (let c = 0; c < 9; c++) {
                let zeros = 0;
                for (let r = 0; r < 9; r++) if (state.cells[r * 9 + c] === 0) zeros++;
                if (zeros === 1) return `Tip: Column ${c + 1} is almost solved.`;
            }
            const remainingCounts = Array(10).fill(0);
            state.cells.forEach((v, idx) => {
                if (v === 0) remainingCounts[state.solution[idx]]++;
            });
            let bestNum = 0, bestCount = Infinity;
            for (let num = 1; num <= 9; num++) {
                if (remainingCounts[num] > 0 && remainingCounts[num] < bestCount) {
                    bestCount = remainingCounts[num];
                    bestNum = num;
                }
            }
            if (bestNum) return `Tip: Only ${bestCount} cells left for number ${bestNum}.`;
            return 'Keep going! Trust your logic.';
        }

        function setTipMessage(message) {
            const banner = $('#tip-text');
            state.activeTip = message;
            if (banner) banner.textContent = message || '';
            const modePill = $('#mode-pill');
            if (modePill) modePill.textContent = `Mode: ${modeLabel(state.mode)}`;
        }

        function loadDailyPuzzle(date = new Date()) {
            const key = date.toISOString().slice(0, 10);
            const seed = Number(key.replace(/-/g, ''));
            state.dailySeed = key;
            const puzzle = generatePuzzle({
                target: 'medium',
                symmetry: 'rotate',
                seed
            });
            return puzzle;
        }

        function isNumberFullySolved(num) {
            for (let i = 0; i < 81; i++) {
                if (state.solution[i] === num && state.cells[i] !== num) {
                    return false;
                }
            }
            return true;
        }

        function checkNumberAchievements() {
            if (!(state.mode === 'beginner' || state.mode === 'easy')) return;
            if (!state.completedNumbers) state.completedNumbers = new Set();
            for (let num = 1; num <= 9; num++) {
                const complete = isNumberFullySolved(num);
                const wasComplete = state.completedNumbers.has(num);
                if (complete && !wasComplete) {
                    state.completedNumbers.add(num);
                    celebrateNumber(num);
                } else if (!complete && wasComplete) {
                    state.completedNumbers.delete(num);
                }
            }
        }

        function updateLevelSummaryAction() {
            const action = $('#level-summary-action');
            const levelCard = $('#level-card');
            if (!action || !levelCard) return;
            const isOpen = levelCard.hasAttribute('open');
            action.textContent = isOpen ? 'Hide details' : 'Show assists';
        }

        function initLevelCardResponsive() {
            const levelCard = $('#level-card');
            if (!levelCard) return;
            const syncCardState = () => {
                if (MOBILE_BREAKPOINT.matches) {
                    levelCard.removeAttribute('open');
                } else {
                    levelCard.setAttribute('open', '');
                }
                updateLevelSummaryAction();
            };
            syncCardState();
            MOBILE_BREAKPOINT.addEventListener('change', syncCardState);
            levelCard.addEventListener('toggle', updateLevelSummaryAction);
        }

        function idx(r, c) { return (r * 9) + c; }
        function rc(index) { return [Math.floor(index / 9), index % 9]; }

        function loadPuzzle(mode) {
            if (state.timerId) clearInterval(state.timerId);
            state.mode = mode;
            applyModeTheme(mode);
            applyColorTheme(state.colorTheme || localStorage.getItem('sudokuPalette') || 'default');
            let givens, solution;
            if (mode === 'daily') {
                const puzzle = loadDailyPuzzle();
                ({ givens, solution } = puzzle);
            } else {
                const target = MODE_TO_TARGET[mode] || 'medium';
                const generated = generatePuzzle({
                    target,
                    symmetry: 'rotate',
                    seed: Date.now()
                });
                ({ givens, solution } = generated);
            }

            state.givens = givens.split('').map(Number);
            state.solution = solution.split('').map(Number);
            state.cells = [...state.givens];
            state.pencils = Array.from({ length: 81 }, () => new Set());
            state.sel = null;
            state.pencilMode = false;
            $('#pencil').classList.remove('active');
            state.history = [];
            state.future = [];
            state.elapsedSeconds = 0;
            $('#timer').textContent = '00:00';
            state.timerId = setInterval(timerTick, 1000);
            state.wrongMoves = 0;
            state.gameOver = false;
            state.completedNumbers = new Set();
            state.streak = 0;
            updateStreakDisplays();
            switch (mode) {
                case 'daily':
                    state.wrongMovesLimit = 3;
                    break;
                case 'easy':
                    state.wrongMovesLimit = 5;
                    break;
                case 'medium':
                    state.wrongMovesLimit = 3;
                    break;
                case 'hard':
                    // 0 wrong moves allowed means the 1st mistake ends the game
                    state.wrongMovesLimit = 1;
                    break;
                default: // beginner
                    state.wrongMovesLimit = Infinity;
                    break;
            }
            renderBoard();
            checkNumberAchievements();
            updateWrongMovesDisplay();
            if (mode === 'daily') {
                setStatus(`Daily Challenge — ${state.dailySeed}`);
            } else {
            setTipMessage(state.activeTip || '');
            }
            scheduleTip();
            setTipMessage('Building streaks increases your bonus animations!');
        }
        function modeLabel(m) { return { beginner: "Beginner", easy: "Easy", medium: "Medium", hard: "Hard", daily: "Daily" }[m] || m; }

        const gridEl = $('#grid');

        function renderBoard() {
            gridEl.innerHTML = '';
            for (let i = 0; i < 81; i++) {
                const r = Math.floor(i / 9), c = i % 9;
                const v = state.cells[i];
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.setAttribute('role', 'gridcell');
                cell.dataset.i = i;
                cell.dataset.r = r + 1; // 1..9
                cell.dataset.c = c + 1; // 1..9
                const given = state.givens[i] !== 0;
                cell.dataset.given = given ? '1' : '0';
                cell.tabIndex = given ? -1 : 0;
                cell.textContent = v === 0 ? '' : v;
                cell.addEventListener('click', () => selectCell(i));
                cell.addEventListener('keydown', (e) => {
                    if (given) return;
                    if (e.key >= '1' && e.key <= '9') { place(+e.key); }
                    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { erase(); }
                    if (e.key === 'ArrowLeft') { moveSel(0, -1) }
                    if (e.key === 'ArrowRight') { moveSel(0, 1) }
                    if (e.key === 'ArrowUp') { moveSel(-1, 0) }
                    if (e.key === 'ArrowDown') { moveSel(1, 0) }
                });
                gridEl.appendChild(cell);
                renderPencils(cell, i);
            }
            paintSelection();
            updateLevelProgress();
        }

        function selectCell(i) {
            state.sel = i;
            paintSelection();
            const value = state.cells[i];
            if (value === 0) {
                highlightMatchingNumbers(0);
            }
        }
        function $cell(r, c) { return $(`.cell[data-r="${r + 1}"][data-c="${c + 1}"]`, gridEl) }
        function cellAt(i) { const r = Math.floor(i / 9), c = i % 9; return $cell(r, c); }

        function paintSelection() {
            $$('.cell', gridEl).forEach(el => {
                el.classList.remove('selected', 'hilite', 'dup', 'hint-target', 'error', 'number-match');
            });
            if (state.sel == null) return;
            const r = Math.floor(state.sel / 9), c = state.sel % 9;

            if (state.mode === 'beginner' || state.mode === 'easy') {
                // Highlight row
                for (let cc = 0; cc < 9; cc++) $cell(r, cc).classList.add('hilite');
            }
            if (state.mode === 'beginner') {
                // Highlight column
                for (let rr = 0; rr < 9; rr++) $cell(rr, c).classList.add('hilite');
                // Highlight 3x3 box
                const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
                for (let rr = br; rr < br + 3; rr++) for (let cc = bc; cc < bc + 3; cc++) $cell(rr, cc).classList.add('hilite');
            }
            $cell(r, c).classList.add('selected');

            // Highlight matching numbers when selecting a cell that contains a number
            const selectedCellValue = state.cells[state.sel];
            if (selectedCellValue !== 0) {
                highlightMatchingNumbers(selectedCellValue);
            }
        }

        function highlightMatchingNumbers(num) {
            // Clear previous number highlights
            $$('.cell', gridEl).forEach(el => el.classList.remove('number-match', 'number-match-row', 'number-match-col'));

            // Only highlight if num is valid (1-9)
            if (!num || num < 1 || num > 9) return;

            // Highlight all cells that contain the same number
            for (let i = 0; i < 81; i++) {
                if (state.cells[i] === num) {
                    const cell = cellAt(i);
                    if (!cell) continue;
                    cell.classList.add('number-match');
                    if (state.mode === 'beginner') {
                        const r = Math.floor(i / 9), c = i % 9;
                        for (let cc = 0; cc < 9; cc++) $cell(r, cc).classList.add('number-match-row');
                        for (let rr = 0; rr < 9; rr++) $cell(rr, c).classList.add('number-match-col');
                    }
                }
            }
        }

        function addTempClass(nodes, className, duration = 1000) {
            if (!nodes) return;
            const list = Array.isArray(nodes) ? nodes : [nodes];
            const unique = list.filter(Boolean);
            unique.forEach(node => node.classList.add(className));
            setTimeout(() => unique.forEach(node => node.classList.remove(className)), duration);
        }

        function duplicatesFor(i, val) {
            const r = Math.floor(i / 9), c = i % 9;
            const hits = new Set();

            // Check row
            for (let k = 0; k < 9; k++) {
                const j = r * 9 + k;
                if (j !== i && state.cells[j] === val) hits.add(j);
            }

            // Check column (this is the line that was fixed)
            for (let k = 0; k < 9; k++) { // <-- Changed k() to k++
                const j = k * 9 + c;
                if (j !== i && state.cells[j] === val) hits.add(j);
            }

            // Check 3x3 box
            const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
            for (let rr = br; rr < br + 3; rr++) {
                for (let cc = bc; cc < bc + 3; cc++) {
                    const j = rr * 9 + cc;
                    if (j !== i && state.cells[j] === val) hits.add(j);
                }
            }
            return [...hits];
        }

        function clearFeedback() { $$('.cell').forEach(el => el.classList.remove('dup', 'hint-target', 'error', 'wrong-flash', 'wrong-section')); }

        function applyImmediateFeedback(i, val) {
            clearFeedback();
            if (state.mode === 'hard') { setStatus(''); return; }

            const dups = duplicatesFor(i, val);
            if (dups.length) {
                if (state.mode === 'beginner' || state.mode === 'easy') {
                    const clearValue = state.mode === 'beginner';
                    state.wrongMoves++;
                    updateWrongMovesDisplay();
                    resetStreak();
                    playTone('wrong');
                    if (enforceMistakeLimit(i)) return;
                    pulseWrongCell(i, { clearValue, extraCells: dups });
                    setStatus(clearValue ? 'Duplicate detected. Value removed.' : 'Duplicate detected. Fix highlighted cells.');
                } else {
                    [i, ...dups].forEach(j => cellAt(j).classList.add('dup'));
                    setStatus('Duplicate detected in row/column/box.');
                    resetStreak();
                    playTone('wrong');
                }
                return;
            }
            const correct = state.solution[i] === val;
            if (correct) { setStatus('Looks good.'); return; }

            state.wrongMoves++;
            updateWrongMovesDisplay();

            if (enforceMistakeLimit(i)) return;

            if (state.mode === 'beginner' || state.mode === 'easy') {
                const clearValue = state.mode === 'beginner';
                pulseWrongCell(i, { clearValue });
                resetStreak();
                playTone('wrong');
                const r = Math.floor(i / 9), c = i % 9;
                let target = -1;
                for (let cc = 0; cc < 9; cc++) { const j = r * 9 + cc; if (state.solution[j] === val) { target = j; break; } }
                if (target === -1) {
                    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
                    for (let rr = br; rr < br + 3 && target === -1; rr++)
                        for (let cc = bc; cc < bc + 3; cc++) {
                            const j = rr * 9 + cc; if (state.solution[j] === val) { target = j; break; }
                        }
                }
                if (target !== -1) { cellAt(target).classList.add('hint-target'); setStatus('Wrong here. Hint shown.'); }
                else { setStatus('Wrong here.'); }
            } else {
                setStatus('That value is incorrect.');
                cellAt(i).classList.add('error');
                resetStreak();
                playTone('wrong');
            }
        }

        function pushHistory() {
            state.history.push({
                cells: [...state.cells],
                pencils: deepClonePencils(state.pencils)
            });
            if (state.history.length > 200) state.history.shift();
        }
        function undo() {
            if (state.isPaused) return;
            if (state.gameOver) return;
            if (!state.history.length) return;
            state.future.push({
                cells: [...state.cells],
                pencils: deepClonePencils(state.pencils)
            });
            const prevState = state.history.pop();
            state.cells = prevState.cells;
            state.pencils = prevState.pencils;
            refreshBoardState();
            setStatus('Undo.');
            scheduleTip();
        }
        function redo() {
            if (state.isPaused) return;
            if (state.gameOver) return;
            if (!state.future.length) return;
            state.history.push({
                cells: [...state.cells],
                pencils: deepClonePencils(state.pencils)
            });
            const nextState = state.future.pop();
            state.cells = nextState.cells;
            state.pencils = nextState.pencils;
            refreshBoardState();
            setStatus('Redo.');
            scheduleTip();
        }
        function refreshBoardState() {
            for (let i = 0; i < 81; i++) {
                const cellEl = cellAt(i);
                cellEl.textContent = state.cells[i] === 0 ? '' : state.cells[i];
                renderPencils(cellEl, i);
            }
            clearFeedback();
            paintSelection(); // Repaint selection highlights
            updateLevelProgress();
            checkNumberAchievements();
        }
        function updateWrongMovesDisplay() {
            const el = $('#wrong-moves');
            if (!el) return;

            // Use the infinity symbol '∞' if the limit is Infinity, otherwise use the number
            const limitDisplay = (state.wrongMovesLimit === Infinity) ? '∞' : state.wrongMovesLimit;

            // Always display in the "X / Y" format
            el.textContent = `${state.wrongMoves} / ${limitDisplay}`;
            updateLevelProgress();
        }

        function enforceMistakeLimit(i) {
            if (state.wrongMovesLimit === Infinity) return false;
            if (state.wrongMoves < state.wrongMovesLimit) return false;
            if (state.timerId) clearInterval(state.timerId);
            state.gameOver = true;
            cellAt(i).classList.add('error');
            showGameOverModal('Game Over! You\'ve made too many mistakes.');
            saveGame();
            return true;
        }

        function updateLevelProgress() {
            if (!state || !state.cells) return;
            const solvedCells = state.cells.reduce((count, value) => count + (value !== 0 ? 1 : 0), 0);
            const percent = Math.round((solvedCells / 81) * 100);

            const fill = $('#level-meter-fill');
            if (fill) fill.style.width = `${Math.max(percent, 4)}%`;

            const progressLabel = $('#level-progress-label');
            if (progressLabel) progressLabel.textContent = `${percent}% board complete`;

            const summaryProgress = $('#level-summary-progress');
            if (summaryProgress) summaryProgress.textContent = `${percent}% complete`;
        }

        /* === COMPLETION CHECKING FUNCTIONS === */

        // Check if a row is complete and correct
        function isRowComplete(row) {
            const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const rowValues = [];
            for (let c = 0; c < 9; c++) {
                const i = row * 9 + c;
                if (state.cells[i] === 0) return false; // Not complete
                rowValues.push(state.cells[i]);
            }
            rowValues.sort((a, b) => a - b);
            return JSON.stringify(rowValues) === JSON.stringify(expected);
        }

        // Check if a column is complete and correct
        function isColumnComplete(col) {
            const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const colValues = [];
            for (let r = 0; r < 9; r++) {
                const i = r * 9 + col;
                if (state.cells[i] === 0) return false; // Not complete
                colValues.push(state.cells[i]);
            }
            colValues.sort((a, b) => a - b);
            return JSON.stringify(colValues) === JSON.stringify(expected);
        }

        // Check if a 3x3 section is complete and correct
        function isSectionComplete(row, col) {
            const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const sectionValues = [];
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;

            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    const i = r * 9 + c;
                    if (state.cells[i] === 0) return false; // Not complete
                    sectionValues.push(state.cells[i]);
                }
            }
            sectionValues.sort((a, b) => a - b);
            return JSON.stringify(sectionValues) === JSON.stringify(expected);
        }

        // Apply completion animations and styling
        function markCompletedSeries(cellRow, cellCol) {
            const completedSeries = []; // Track what got completed for status message
            const rowCells = [];
            const colCells = [];
            const boxCells = [];
            const rowDone = isRowComplete(cellRow);
            const colDone = isColumnComplete(cellCol);
            const boxDone = isSectionComplete(cellRow, cellCol);

            if (rowDone) {
                for (let c = 0; c < 9; c++) {
                    const cellEl = $cell(cellRow, c);
                    rowCells.push(cellEl);
                    cellEl.classList.add('completed');
                    setTimeout(() => {
                        cellEl.classList.remove('completed');
                        cellEl.classList.add('locked');
                    }, 800);
                }
                addTempClass(rowCells, 'row-celebrate', 900);
                completedSeries.push('row');
                playTone('row');
                if (state.activeTip && state.activeTip.includes(`Row ${cellRow + 1}`)) {
                    setTipMessage('');
                }
            }

            if (colDone) {
                for (let r = 0; r < 9; r++) {
                    const cellEl = $cell(r, cellCol);
                    colCells.push(cellEl);
                    cellEl.classList.add('completed');
                    setTimeout(() => {
                        cellEl.classList.remove('completed');
                        cellEl.classList.add('locked');
                    }, 800);
                }
                addTempClass(colCells, 'row-celebrate', 900);
                completedSeries.push('column');
                playTone('row');
                if (state.activeTip && state.activeTip.includes(`Column ${cellCol + 1}`)) {
                    setTipMessage('');
                }
            }

            if (boxDone) {
                const startRow = Math.floor(cellRow / 3) * 3;
                const startCol = Math.floor(cellCol / 3) * 3;

                for (let r = startRow; r < startRow + 3; r++) {
                    for (let c = startCol; c < startCol + 3; c++) {
                        const cellEl = $cell(r, c);
                        boxCells.push(cellEl);
                        cellEl.classList.add('completed');
                        setTimeout(() => {
                            cellEl.classList.remove('completed');
                            cellEl.classList.add('locked');
                        }, 800);
                    }
                }
                addTempClass(boxCells, 'box-celebrate', 900);
                completedSeries.push('section');
                playTone('box');
            }

            if (rowDone && boxDone) {
                addTempClass([...rowCells, ...boxCells], 'combo-celebrate', 1100);
                playTone('combo');
            }

            // Update status message if any series were completed
            if (completedSeries.length > 0) {
                flashBoard();
                burstConfetti({ count: 6 + completedSeries.length * 4, mode: state.mode });
                const seriesText = completedSeries.join(' and ');
                setStatus(`🎉 Completed ${seriesText}!`);
            }
        }


        /* Place with toggle: pressing the same number again clears the cell */
        function place(n) {
            if (state.isPaused) return;
            if (state.gameOver) return;
            if (state.sel == null) { setStatus('Tap a cell first.'); return; }
            const i = state.sel;
            if (state.givens[i] !== 0) { setStatus('Given cell cannot be changed.'); return; }

            // toggle-off behavior
            if (state.cells[i] === n) {
                erase();
                return;
            }

            pushHistory();
            state.cells[i] = n;
            state.pencils[i].clear();
            state.future.length = 0;
            cellAt(i).textContent = n;
            renderPencils(cellAt(i), i);
            applyImmediateFeedback(i, n);

            // Highlight matching numbers after placing a number
            highlightMatchingNumbers(n);

            // Check for completed series (row, column, section) and animate them
            const cellRow = Math.floor(i / 9);
            const cellCol = i % 9;
            markCompletedSeries(cellRow, cellCol);
            checkNumberAchievements();
            updateLevelProgress();
            if (state.cells[i] === state.solution[i]) {
                incrementStreak();
                playTone('correct');
            }
            scheduleTip();

            // Automatically check the puzzle on the last move in hard mode
            const isBoardFull = !state.cells.includes(0);
            if (isBoardFull) {
                finish();
            }
        }

        function erase() {
            if (state.isPaused) return;
            if (state.gameOver) return;
            if (state.sel == null) return; // Nothing selected
            const i = state.sel;
            if (state.givens[i] !== 0) return; // Can't erase a given number

            // Check if the cell has pencil marks
            if (state.pencils[i].size > 0) {
                pushHistory();
                state.pencils[i].clear();
                state.future.length = 0;
                renderPencils(cellAt(i), i); // Update the cell's display
                setStatus('Pencil marks cleared.');

                // If no pencil marks, check for a main number (original behavior)
            } else if (state.cells[i] !== 0) {
                pushHistory();
                state.cells[i] = 0;
                state.future.length = 0;
                cellAt(i).textContent = '';
                renderPencils(cellAt(i), i); // Update display to show pencils again if any existed before this state
                clearFeedback();
                setStatus('Cell cleared.');

                // Clear number highlights when erasing a number
                highlightMatchingNumbers(0);
                checkNumberAchievements();
                updateLevelProgress();
                resetStreak();
                if (state.activeTip && state.activeTip.includes(`Row ${Math.floor(i / 9) + 1}`)) setTipMessage('');
            }
            scheduleTip();
        }
        // --- NEW: Pause and Resume Functions ---
        function pauseGame() {
            if (state.gameOver || state.isPaused) return;
            state.isPaused = true;
            $('#pause-overlay').classList.remove('hidden');
            saveGame();;
        }

        function resumeGame() {
            if (state.gameOver || !state.isPaused) return;
            state.isPaused = false;
            $('#pause-overlay').classList.add('hidden');
        }

        // --- NEW: Game Over Modal ---
        function showGameOverModal(message) {
            $('#game-over-message').textContent = message;
            $('#game-over-modal').classList.remove('hidden');
        }

        // --- NEW: Save and Load Game State ---
        function saveGame() {
            // Convert Sets to arrays for JSON serialization
            const serializableState = {
                ...state,
                pencils: state.pencils.map(s => Array.from(s)),
                completedNumbers: Array.from(state.completedNumbers),
                tipTimer: null
            };
            localStorage.setItem('sudokuGameState', JSON.stringify(serializableState));
        }

        function loadGame() {
            const savedStateJSON = localStorage.getItem('sudokuGameState');
            if (!savedStateJSON) return false;

            const savedState = JSON.parse(savedStateJSON);

            // Restore state
            state = {
                ...savedState,
                pencils: savedState.pencils.map(p => new Set(p)), // Convert arrays back to Sets
                isPaused: false, // Always start unpaused
                completedNumbers: new Set(savedState.completedNumbers || []),
                tipTimer: null
            };
            applyModeTheme(state.mode || 'beginner');
            applyColorTheme(state.colorTheme || 'default');
            state.streak = state.streak || 0;
            state.bestStreak = state.bestStreak || 0;
            updateStreakDisplays();
            updateSoundButton();
            if (state.soundOn && !audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            localStorage.setItem('sudokuSound', state.soundOn ? '1' : '0');

            // Re-render board and UI
            renderBoard();
            updateWrongMovesDisplay();
            checkNumberAchievements();

            // Resume timer if game was in progress
            if (!state.gameOver) {
                state.timerId = setInterval(timerTick, 1000);
            }

            // If the game was over, show the modal again
            if (state.gameOver) {
                const message = state.wrongMoves >= state.wrongMovesLimit ?
                    "Game Over! Too many mistakes." : "Congratulations, You Win!";
                showGameOverModal(message);
            }

            scheduleTip();
            setTipMessage('Welcome back! Resume your logic streak.');
            return true; // Indicate that a game was loaded
        }

        function finish() {
            if (state.isPaused || state.gameOver) return;

            // The auto-finish in the place() function already ensures the board is full.
            // So we don't need to check for that here.

            state.gameOver = true;
            if (state.timerId) clearInterval(state.timerId);

            const ok = state.cells.every((v, i) => v === state.solution[i]);
            if (ok) {
                showGameOverModal('Congratulations, You Win! 🏆');
                addTempClass($$('.cell'), 'board-celebrate', 1400);
                playTone('win');
                burstConfetti({ count: 48, mode: state.mode });
            } else {
                showGameOverModal('Almost! Some entries are wrong.');
            }
            saveGame();
        }

        function checkCell() {
            if (state.isPaused) return;
            if (state.gameOver) return;
            if (state.sel == null) return;
            const i = state.sel;
            if (state.cells[i] === 0) { setStatus('Empty cell.'); return; }
            const ok = state.cells[i] === state.solution[i];
            if (ok) setStatus('✅ This cell is correct.');
            else { cellAt(i).classList.add('error'); setStatus('❌ This cell is incorrect.'); }
        }
        function giveHint() {
            if (state.isPaused) return;
            if (state.gameOver) return;
            if (state.sel == null) return;
            const i = state.sel;
            if (state.givens[i] !== 0) { setStatus('Cannot hint a given cell.'); return; }
            if (state.cells[i] === state.solution[i]) { setStatus('Already correct.'); return; }
            pushHistory();
            state.cells[i] = state.solution[i];
            state.future.length = 0;
            cellAt(i).textContent = state.cells[i];
            clearFeedback();
            setStatus('Hint applied to the selected cell.');
            checkNumberAchievements();
            updateLevelProgress();
            resetStreak();
            scheduleTip();
        }

        function moveSel(dr, dc) {
            if (state.sel == null) { state.sel = 0; paintSelection(); return; }
            let r = Math.floor(state.sel / 9), c = state.sel % 9;
            r = (r + dr + 9) % 9; c = (c + dc + 9) % 9;
            state.sel = r * 9 + c; paintSelection();
        }

        // NEW function to render pencil marks inside a cell
        function renderPencils(cellEl, i) {
            // Clear any old pencil grid
            const oldGrid = cellEl.querySelector('.pencil-grid');
            if (oldGrid) oldGrid.remove();

            // Don't show pencils if a final number is placed
            if (state.cells[i] !== 0) return;

            const marks = state.pencils[i];
            if (marks.size === 0) return;

            const grid = document.createElement('div');
            grid.className = 'pencil-grid';
            for (let n = 1; n <= 9; n++) {
                const span = document.createElement('span');
                if (marks.has(n)) {
                    span.textContent = n;
                }
                grid.appendChild(span);
            }
            cellEl.appendChild(grid);
        }

        // NEW helper function for undo/redo
        function deepClonePencils(pencils) {
            return pencils.map(s => new Set(s));
        }

        function pencil(n) {
            if (state.isPaused) return;
            if (state.gameOver) return;
            if (state.sel == null) { setStatus('Select a cell first.'); return; }
            const i = state.sel;
            if (state.givens[i] !== 0) { setStatus('Cannot pencil a given cell.'); return; }
            if (state.cells[i] !== 0) { setStatus('Clear the number before adding pencil marks.'); return; }

            pushHistory(); // Save state before changing

            if (state.pencils[i].has(n)) {
                state.pencils[i].delete(n);
                setStatus(`Pencil mark ${n} removed.`);
            } else {
                state.pencils[i].add(n);
                setStatus(`Pencil mark ${n} added.`);
            }
            state.future.length = 0; // Clear redo history

            // Re-render the pencils for the current cell
            renderPencils(cellAt(i), i);
            scheduleTip();
        }

        // This function will run every second to update the timer display
        function timerTick() {
            if (state.isPaused || state.gameOver) return;

            state.elapsedSeconds++;
            const minutes = Math.floor(state.elapsedSeconds / 60);
            const seconds = state.elapsedSeconds % 60;

            // Format to MM:SS and update the HTML
            const timerEl = $('#timer');
            if (timerEl) {
                timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }

        function movesCount() {
            // Future use: implement move counting if needed
        }

        /* --- UI bindings --- */
        /* --- UI bindings --- */
        // A single, reliable event listener for all buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const id = target.id;
            console.log(`Button clicked! ID: "${id}"`);


            const isNumPad = target.closest('#pad') && target.dataset.num;

            if (isNumPad) {
                const clickedNumber = +target.dataset.num;

                // Highlight matching numbers when clicking number buttons (all modes)
                highlightMatchingNumbers(clickedNumber);

                if (state.pencilMode) {
                    pencil(clickedNumber);
                } else {
                    place(clickedNumber);
                }
                return;
            }

            // Call the correct function based on the button's ID
            switch (id) {
                case 'new':
                case 'new-game-modal-btn':
                    localStorage.removeItem('sudokuGameState');
                    $('#game-over-modal').classList.add('hidden');
                    loadPuzzle(state.mode);
                    closeMenu();
                    break;
                case 'finish-btn':
                    finish();
                    break;
                case 'pause-btn':
                    pauseGame();
                    break;
                case 'resume-btn':
                    resumeGame();
                    break;
                case 'clear':
                    erase();
                    break;
                case 'focus-board':
                    focusBoard();
                    break;
                case 'menu-toggle':
                    toggleMenu();
                    break;
                case 'check':
                    checkCell();
                    break;
                case 'hint':
                    giveHint();
                    break;
                case 'undo':
                    undo();
                    break;
                case 'pencil':
                    state.pencilMode = !state.pencilMode;
                    target.classList.toggle('active', state.pencilMode);
                    setStatus(state.pencilMode ? 'Pencil mode is ON' : 'Pencil mode is OFF');
                    break;
                case 'sound-toggle':
                    toggleSound();
                    closeMenu();
                    break;
                case 'daily-btn':
                    $('#mode').value = 'daily';
                    loadPuzzle('daily');
                    closeMenu();
                    break;
                case 'pause-btn':
                    pauseGame();
                    closeMenu();
                    break;
            }
        });

        // Listener for the difficulty dropdown
        $('#mode').addEventListener('change', e => {
            localStorage.removeItem('sudokuGameState');
            loadPuzzle(e.target.value);
            closeMenu();
        });

        const paletteSelect = $('#palette');
        const savedPalette = localStorage.getItem('sudokuPalette') || 'default';
        applyColorTheme(savedPalette);
        if (paletteSelect) {
            paletteSelect.value = savedPalette;
            paletteSelect.addEventListener('change', e => applyColorTheme(e.target.value));
        }

        const savedSoundPref = localStorage.getItem('sudokuSound') === '1';
        state.soundOn = savedSoundPref;
        updateSoundButton();
        if (state.soundOn && !audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        setTipMessage('Welcome! Keep a streak going for extra flair.');
        scheduleTip();

        document.addEventListener('click', (e) => {
            const panel = $('#menu-panel');
            const toggle = $('#menu-toggle');
            if (!panel || !panel.classList.contains('show')) return;
            if (toggle && (e.target === toggle || toggle.contains(e.target))) return;
            if (!panel.contains(e.target)) toggleMenu(false);
        });

        function setStatus(msg) {
            if (!msg) return;
            const toast = $('#number-toast');
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.add('show');
            clearTimeout(setStatus.timeoutId);
            setStatus.timeoutId = setTimeout(() => toast.classList.remove('show'), 1800);
        }

        initLevelCardResponsive();

        // --- Final Game Load ---
        if (!loadGame()) {
            loadPuzzle('beginner');
        }

    