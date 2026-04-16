let currentLang = 'es';
let pendingBuyCell = null;

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    renderBoard();
    updateLanguageTexts();
});

function initUI() {
    // Menus
    document.getElementById('btn-create-game').addEventListener('click', () => {
        const customId = document.getElementById('create-code').value.trim() || null;
        document.getElementById('lobby-status').textContent = 'Creando sala...';
        initPeer(
            (id) => {
                isHost = true;
                document.getElementById('current-room-code').textContent = id;
                document.getElementById('main-menu').classList.remove('active');
                document.getElementById('game-screen').classList.add('active');
                
                // Add host to game
                addPlayerBase(id, 'Anfitrión');
                gameState.started = false; // Wait for Start button
                window.updateGameUI(gameState);
            },
            (state) => {},
            (peerid) => { console.log('Peer joined: ', peerid); },
            customId
        );
    });

    document.getElementById('btn-join-game').addEventListener('click', () => {
        const code = document.getElementById('join-code').value.trim();
        if(!code) return;
        document.getElementById('lobby-status').textContent = 'Conectando...';
        initPeer((id) => {
            joinGame(code, 
                (state) => { window.updateGameUI(state); },
                () => {
                    document.getElementById('current-room-code').textContent = code;
                    document.getElementById('main-menu').classList.remove('active');
                    document.getElementById('game-screen').classList.add('active');
                }
            );
        }, () => {}, () => {});
    });

    // Language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentLang = target.dataset.lang;
            updateLanguageTexts();
        });
    });
    document.querySelector('.lang-btn[data-lang="es"]').classList.add('active');

    // Modals & Buttons
    document.getElementById('btn-close-modal').addEventListener('click', () => {
        document.getElementById('card-modal').classList.add('hidden');
        if(isHost) {
            sendActionToHost({action: 'NEXT_TURN'});
        } else {
            sendActionToHost({action: 'NEXT_TURN'});
        }
    });

    document.getElementById('btn-correct').addEventListener('click', () => {
        document.getElementById('card-modal').classList.add('hidden');
        sendActionToHost({action: 'QUESTION_ANSWER', correct: true});
    });

    document.getElementById('btn-incorrect').addEventListener('click', () => {
        document.getElementById('card-modal').classList.add('hidden');
        sendActionToHost({action: 'QUESTION_ANSWER', correct: false});
    });

    document.getElementById('btn-roll-dice').addEventListener('click', () => {
        const diceNum = Math.floor(Math.random() * 6) + 1;
        document.getElementById('dice-result').textContent = diceNum;
        sendActionToHost({action: 'MOVE', steps: diceNum});
        document.getElementById('btn-roll-dice').disabled = true;
    });

    document.getElementById('btn-buy').addEventListener('click', () => {
        if(pendingBuyCell !== null) {
            sendActionToHost({action: 'BUY', cellIndex: pendingBuyCell});
        }
        document.getElementById('buy-modal').classList.add('hidden');
        pendingBuyCell = null;
    });

    document.getElementById('btn-pass').addEventListener('click', () => {
        sendActionToHost({action: 'PASS', cellIndex: pendingBuyCell});
        document.getElementById('buy-modal').classList.add('hidden');
        pendingBuyCell = null;
    });

    document.getElementById('btn-start-game').addEventListener('click', () => {
        sendActionToHost({action: 'START_GAME'});
    });

    document.getElementById('btn-restart-game').addEventListener('click', () => {
        if(confirm('¿Reiniciar la partida?')) {
            sendActionToHost({action: 'RESTART_GAME'});
        }
    });

    // Assign remote callbacks
    window.updateGameUI = updateGameUI;
    window.showCardLocal = showCardLocal;
    window.promptBuyLocal = (cellIndex, price) => {
        pendingBuyCell = cellIndex;
        const cell = GameData.board[cellIndex];
        document.getElementById('buy-prop-name').textContent = cell.name;
        document.getElementById('buy-price').textContent = price;
        
        // Detailed rent info
        document.getElementById('r0').textContent = cell.baseRent;
        document.getElementById('r1').textContent = cell.rent1;
        document.getElementById('r2').textContent = cell.rent2;
        document.getElementById('r3').textContent = cell.rent3;
        document.getElementById('r4').textContent = cell.rent4;
        document.getElementById('rh').textContent = cell.rentHotel;
        document.getElementById('hc').textContent = cell.houseCost;
        document.getElementById('mt').textContent = cell.mortgage;

        // Color header
        const colorMap = {
            'brown': '#8B4513', 'lightblue': '#87CEEB', 'pink': '#FFC0CB', 'orange': '#FFA500',
            'red': '#FF0000', 'yellow': '#FFFF00', 'green': '#00FF00', 'darkblue': '#00008B'
        };
        document.getElementById('buy-card-header').style.backgroundColor = colorMap[cell.color] || '#333';
        
        // Show the modal
        const modal = document.getElementById('buy-modal');
        modal.classList.remove('hidden');
        modal.style.display = 'block';
    };
    window.showNotificationLocal = (msg) => {
        const container = document.getElementById('notification-container');
        const div = document.createElement('div');
        div.className = 'notification';
        div.textContent = msg;
        container.appendChild(div);
        setTimeout(() => container.removeChild(div), 4000);
    };
}

function updateLanguageTexts() {
    const texts = GameData.languages[currentLang];
    document.getElementById('menu-title').textContent = texts.MENU_TITLE;
    document.getElementById('btn-create-game').textContent = texts.CREATE_GAME;
    document.getElementById('btn-join-game').textContent = texts.JOIN_GAME;
    document.getElementById('join-code').placeholder = texts.ROOM_CODE_PH;
    
    document.getElementById('panel-players-title').textContent = texts.PLAYERS;
    document.getElementById('btn-roll-dice').textContent = texts.ROLL_DICE;
    
    document.getElementById('panel-surprises-title').textContent = texts.SURPRISES;
    document.getElementById('panel-questions-title').textContent = texts.QUESTIONS;
    document.getElementById('btn-close-modal').textContent = texts.CLOSE;

    const surprisesDesc = document.getElementById('panel-surprises-desc');
    if (surprisesDesc) surprisesDesc.textContent = texts.SURPRISES_DESC;
    const questionsDesc = document.getElementById('panel-questions-desc');
    if (questionsDesc) questionsDesc.textContent = texts.QUESTIONS_DESC;

    // Additional UI and Modal translations
    document.getElementById('btn-start-game').textContent = texts.START_GAME;
    document.getElementById('btn-restart-game').textContent = texts.RESTART_GAME;
    
    // Modal buy texts (if the modal is currently configured)
    const labelRent = document.getElementById('label-rent');
    if (labelRent) {
        labelRent.textContent = texts.LABEL_RENT;
        document.getElementById('label-h1').textContent = texts.LABEL_H1;
        document.getElementById('label-h2').textContent = texts.LABEL_H2;
        document.getElementById('label-h3').textContent = texts.LABEL_H3;
        document.getElementById('label-h4').textContent = texts.LABEL_H4;
        document.getElementById('label-hotel').textContent = texts.LABEL_HOTEL;
        document.getElementById('label-hc').textContent = texts.LABEL_HC;
        document.getElementById('label-mt').textContent = texts.LABEL_MT;
        document.getElementById('label-buy').textContent = texts.LABEL_BUY;
        document.getElementById('label-pass').textContent = texts.LABEL_PASS;
    }
}

function renderBoard() {
    const boardEl = document.getElementById('astropoly-board');
    boardEl.innerHTML = '';
    
    // We render a 6x6 grid. Board has 20 items. 
    // Grid maps: Top row (0-5), Right col (6-10), Bottom row (11-15), Left col (16-19)
    // Indexes on grid (row, col) from 1 to 6
    const posMap = [
        {r:1, c:1}, {r:1, c:2}, {r:1, c:3}, {r:1, c:4}, {r:1, c:5}, {r:1, c:6}, {r:1, c:7}, {r:1, c:8}, // Top (0-7)
        {r:2, c:8}, {r:3, c:8}, {r:4, c:8}, {r:5, c:8}, {r:6, c:8}, {r:7, c:8}, // Right (8-13)
        {r:8, c:8}, {r:8, c:7}, {r:8, c:6}, {r:8, c:5}, {r:8, c:4}, {r:8, c:3}, {r:8, c:2}, {r:8, c:1}, // Bottom (14-21)
        {r:7, c:1}, {r:6, c:1}, {r:5, c:1}, {r:4, c:1}, {r:3, c:1}, {r:2, c:1} // Left (22-27)
    ];

    GameData.board.forEach((cell, i) => {
        const div = document.createElement('div');
        div.className = `board-cell custom-cell-${i}`;
        if(cell.type === 'corner') div.classList.add('corner');
        if(cell.color) div.classList.add(`property-${cell.color}`);
        
        div.style.gridRow = posMap[i].r;
        div.style.gridColumn = posMap[i].c;
        
        div.innerHTML = `<strong>${cell.name}</strong>`;
        if(cell.price) div.innerHTML += `<br/><small>${cell.price} CG</small>`;
        
        // Slot for players
        const tokensArea = document.createElement('div');
        tokensArea.className = 'tokens-area';
        tokensArea.id = `cell-tokens-${i}`;
        tokensArea.style.position = 'absolute';
        tokensArea.style.width = '100%';
        tokensArea.style.height = '100%';
        tokensArea.style.display = 'flex';
        tokensArea.style.flexWrap = 'wrap';
        tokensArea.style.justifyContent = 'center';
        tokensArea.style.alignContent = 'center';
        
        div.appendChild(tokensArea);
        boardEl.appendChild(div);
    });
}

function updateGameUI(state) {
    if(!state || !state.players) return;
    
    // Update players list
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    
    // Clear old token indicators if any (not needed now as we use absolute playerTokens)
    document.querySelectorAll('.tokens-area').forEach(el => el.innerHTML = '');

    let myTurn = false;
    const currentTurnId = state.players[state.turnIndex]?.id;

    // Use a global object to persist tokens across UI updates for animation
    if (!window.playerTokens) window.playerTokens = {};

    // Redraw owners
    for(const [cellIndex, ownerId] of Object.entries(state.properties)) {
        const ownerPlayer = state.players.find(p => p.id === ownerId);
        if(ownerPlayer) {
            const cellTokens = document.getElementById(`cell-tokens-${cellIndex}`);
            if(cellTokens) {
                const div = document.createElement('div');
                div.className = 'property-owner';
                div.style.backgroundColor = ownerPlayer.color;
                div.style.boxShadow = `0 -2px 10px ${ownerPlayer.color}`;
                cellTokens.parentElement.appendChild(div);
            }
        }
    }

    state.players.forEach((p, index) => {
        const li = document.createElement('li');
        li.className = 'player-item';
        if(index === state.turnIndex) li.classList.add('active-turn');
        if(p.id === myPeerId && p.id === currentTurnId) myTurn = true;
        
        li.innerHTML = `
            <div>
                <span class="color-indicator" style="background:${p.color};"></span>
                <strong>${p.name}</strong>
            </div>
            <div>${p.credits} CG</div>
        `;
        list.appendChild(li);

        // Animate or teleport token
        let tokenEl = window.playerTokens[p.id];
        if (!tokenEl) {
            tokenEl = document.createElement('div');
            tokenEl.className = 'player-token animated-token';
            tokenEl.style.backgroundColor = p.color;
            tokenEl.style.boxShadow = `0 0 10px ${p.color}, inset 0 0 5px white`;
            tokenEl.title = p.name;
            document.body.appendChild(tokenEl);
            window.playerTokens[p.id] = tokenEl;
        }

        const cellEl = document.querySelector(`.custom-cell-${p.position}`);
        if(cellEl) {
            const rect = cellEl.getBoundingClientRect();
            // Offset to avoid stacking
            const ox = (index % 3) * 6;
            const oy = Math.floor(index / 3) * 6;
            tokenEl.style.left = (rect.left + rect.width/2 - 10 + ox) + 'px';
            tokenEl.style.top = (rect.top + rect.height/2 - 10 + oy) + 'px';
        }
    });

    // Update buttons
    const btnDice = document.getElementById('btn-roll-dice');
    const btnStart = document.getElementById('btn-start-game');
    const btnRestart = document.getElementById('btn-restart-game');

    // Host controls
    if(isHost) {
        if(!state.started) {
            btnStart.classList.remove('hidden');
            btnRestart.classList.add('hidden');
        } else {
            btnStart.classList.add('hidden');
            btnRestart.classList.remove('hidden');
        }
    } else {
        btnStart.classList.add('hidden');
        btnRestart.classList.add('hidden');
    }

    // Dice only enabled if game started and it's my turn
    if(state.started && myTurn) {
        btnDice.disabled = false;
    } else {
        btnDice.disabled = true;
    }
}

function showCardLocal(card) {
    const texts = GameData.languages[currentLang];
    const modal = document.getElementById('card-modal');
    modal.classList.remove('hidden');
    
    // Translate Card
    const cardTitle = card.title[currentLang] || card.title['es'];
    const cardText = card.text[currentLang] || card.text['es'];
    
    document.getElementById('modal-card-title').textContent = cardTitle;
    document.getElementById('modal-card-text').textContent = cardText;

    if (card.isQuestion) {
        document.getElementById('btn-close-modal').classList.add('hidden');
        document.getElementById('btn-correct').classList.remove('hidden');
        document.getElementById('btn-incorrect').classList.remove('hidden');
        
        switch (currentLang) {
            case 'en':
                document.getElementById('btn-correct').textContent = 'CORRECT';
                document.getElementById('btn-incorrect').textContent = 'INCORRECT';
                break;
            case 'fr':
                document.getElementById('btn-correct').textContent = 'CORRECT';
                document.getElementById('btn-incorrect').textContent = 'INCORRECT';
                break;
            default:
                document.getElementById('btn-correct').textContent = 'CORRECTO';
                document.getElementById('btn-incorrect').textContent = 'INCORRECTO';
        }
    } else {
        document.getElementById('btn-close-modal').classList.remove('hidden');
        document.getElementById('btn-correct').classList.add('hidden');
        document.getElementById('btn-incorrect').classList.add('hidden');
    }
}
