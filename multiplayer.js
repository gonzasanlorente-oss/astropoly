let peer = null;
let conn = null; // for clients
let conns = [];  // for host
let isHost = false;
let myPeerId = null;

const gameState = {
    players: [],
    turnIndex: 0,
    started: false,
    hasRolled: false,
    jailAction: null,
    properties: {},
    usedSurpriseIds: [],
    usedQuestionIds: []
};

function advanceTurn() {
    gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
    gameState.hasRolled = false;
}

// Colors for 6 players
const playerColors = ['#ff3333', '#3366ff', '#33ff33', '#ffff33', '#ff00ff', '#00ffff'];

// WebRTC Config for restrictive networks (Schools/Institutes)
const peerConfig = {
    config: {
        'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject"
            },
            {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject"
            },
            {
                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                username: "openrelayproject",
                credential: "openrelayproject"
            }
        ]
    }
};

function initPeer(onOpenCb, onDataCb, onConnectionCb, customId = null) {
    peer = customId ? new Peer(customId, peerConfig) : new Peer(peerConfig);
    peer.on('open', (id) => {
        myPeerId = id;
        onOpenCb(id);
    });

    peer.on('connection', (connection) => {
        if (!isHost) return;
        if (gameState.players.length >= 6) {
            connection.on('open', () => {
                connection.send({ type: 'ERROR', code: 'ROOM_FULL' });
                setTimeout(() => connection.close(), 1000);
            });
            return;
        }
        conns.push(connection);
        connection.on('data', (data) => {
            handleIncomeDataFromPeer(data, connection.peer, onDataCb);
        });
        connection.on('open', () => {
            onConnectionCb(connection.peer);
            addPlayerBase(connection.peer, `Gamer ${gameState.players.length + 1}`);
            broadcastState();
        });
    });
}

function joinGame(hostId, onDataCb, onJoinSuccess) {
    if (!peer) return;
    conn = peer.connect(hostId);
    conn.on('open', () => {
        onJoinSuccess();
    });
    conn.on('data', (data) => {
        if (data.type === 'STATE_UPDATE') {
            Object.assign(gameState, data.state);
            onDataCb(data.state);
        } else if (data.type === 'PROMPT_BUY') {
            if(window.promptBuyLocal) window.promptBuyLocal(data.cellIndex, data.price);
        } else if (data.type === 'NOTIFICATION') {
            if(window.showNotificationLocal) window.showNotificationLocal(data.message);
        } else if (data.type === 'CARD_DRAWN') {
            if(window.showCardLocal) window.showCardLocal(data.card);
        } else if (data.type === 'CLOSE_CARD') {
            document.getElementById('card-modal').classList.add('hidden');
        } else if (data.type === 'ERROR') {
            const texts = GameData.languages[window.currentLang || 'es'];
            if (data.code === 'ROOM_FULL') alert(texts.ERROR_FULL);
            if (data.code === 'KICKED') alert(texts.KICKED_MSG);
            location.reload();
        }
    });
}

function broadcastState() {
    if (!isHost) return;
    conns.forEach(c => {
        if(c.open){
            c.send({ type: 'STATE_UPDATE', state: gameState });
        }
    });
    if (window.updateGameUI) window.updateGameUI(gameState);
}

function addPlayerBase(id, name) {
    if(gameState.players.length >= 6) return;
    if(gameState.players.some(p => p.id === id)) return;
    gameState.players.push({
        id: id,
        name: name,
        color: playerColors[gameState.players.length],
        position: 0,
        credits: 1000,
        properties: [],
        jailTurns: 0,
        gifts: []
    });
}

function sendActionToHost(actionData) {
    if (isHost) {
        handleAction(actionData, myPeerId);
    } else if (conn && conn.open) {
        conn.send({ type: 'ACTION', ...actionData });
    }
}

function handleIncomeDataFromPeer(data, senderId, onDataCb) {
    if (data.type === 'ACTION') {
        handleAction(data, senderId);
    }
}

function handleAction(data, senderId) {
    if(!isHost) return;
    const player = gameState.players.find(p => p.id === senderId);
    if (!player) return;

    if (data.action === 'MOVE') {
        if (gameState.hasRolled) return;
        gameState.hasRolled = true;

        const oldPos = player.position;
        player.position = (player.position + data.steps) % 28;
        if (player.position < oldPos) {
            player.credits += 100;
        }

        const cell = GameData.board[player.position];
        let actionTriggered = false;

        if (cell.type === 'property' || cell.type === 'station') {
            const ownerId = gameState.properties[player.position];
            if (!ownerId && player.credits >= cell.price) {
                actionTriggered = true;
                conns.forEach(c => {
                    if (c.peer === senderId) c.send({type: 'PROMPT_BUY', cellIndex: player.position, price: cell.price});
                });
                if(senderId === myPeerId) window.promptBuyLocal(player.position, cell.price);
            } else if (ownerId && ownerId !== senderId) {
                const ownerPlayer = gameState.players.find(p => p.id === ownerId);
                const rent = cell.baseRent || Math.floor(cell.price / 5) || 10;
                player.credits -= rent;
                if (ownerPlayer) ownerPlayer.credits += rent;
                const msg = `${player.name} pagó ${rent} CG a ${ownerPlayer ? ownerPlayer.name : 'el Banco'}`;
                conns.forEach(c => c.send({type: 'NOTIFICATION', message: msg}));
                if(window.showNotificationLocal) window.showNotificationLocal(msg);
            }
        } else if (cell.type === 'action') {
            actionTriggered = true;
            if (cell.subType === 'surprise') {
                let available = GameData.surprises.filter(s => !gameState.usedSurpriseIds.includes(s.id));
                if (available.length === 0) { gameState.usedSurpriseIds = []; available = GameData.surprises; }
                let card = available[Math.floor(Math.random() * available.length)];
                gameState.usedSurpriseIds.push(card.id);
                applyCard(player, card);
                if(window.showCardLocal) window.showCardLocal(card);
                conns.forEach(c => c.send({type: 'CARD_DRAWN', card: card, player: player.name}));
            } else if (cell.subType === 'question') {
                let available = GameData.questions.filter(q => !gameState.usedQuestionIds.includes(q.id));
                if (available.length === 0) { gameState.usedQuestionIds = []; available = GameData.questions; }
                let card = available[Math.floor(Math.random() * available.length)];
                gameState.usedQuestionIds.push(card.id);
                card.isQuestion = true;
                if(window.showCardLocal) window.showCardLocal(card);
                conns.forEach(c => c.send({type: 'CARD_DRAWN', card: card, player: player.name}));
            }
        }

        if (!actionTriggered) advanceTurn();
        broadcastState();

    } else if (data.action === 'BUY' || data.action === 'PASS') {
        if (data.action === 'BUY') {
            const cell = GameData.board[data.cellIndex];
            if (!gameState.properties[data.cellIndex] && player.credits >= cell.price) {
                player.credits -= cell.price;
                gameState.properties[data.cellIndex] = senderId;
                const msg = `${player.name} compró ${cell.name}`;
                conns.forEach(c => c.send({type: 'NOTIFICATION', message: msg}));
                if(window.showNotificationLocal) window.showNotificationLocal(msg);
            }
        }
        advanceTurn();
        broadcastState();
    } else if (data.action === 'QUESTION_ANSWER') {
        const activePlayer = gameState.players[gameState.turnIndex];
        if (!activePlayer) return;
        const currentQuestion = GameData.questions.find(q => gameState.usedQuestionIds.includes(q.id) && q.id === gameState.usedQuestionIds[gameState.usedQuestionIds.length-1]);
        const rwd = currentQuestion ? currentQuestion.reward : 50;
        const pnl = currentQuestion ? currentQuestion.penalty : -30;
        
        if (data.correct) {
            activePlayer.credits += rwd;
            const msg = `${activePlayer.name} +${rwd} CG! (Respuesta Correcta)`;
            conns.forEach(c => c.send({type: 'NOTIFICATION', message: msg}));
            if(window.showNotificationLocal) window.showNotificationLocal(msg);
        } else {
            activePlayer.credits += pnl; // pnl is already negative
            const msg = `${activePlayer.name} ${pnl} CG. (Respuesta Incorrecta)`;
            conns.forEach(c => c.send({type: 'NOTIFICATION', message: msg}));
            if(window.showNotificationLocal) window.showNotificationLocal(msg);
        }
        advanceTurn();
        broadcastState();
        conns.forEach(c => c.send({type: 'CLOSE_CARD'}));
    } else if (data.action === 'NEXT_TURN') {
        advanceTurn();
        broadcastState();
    } else if (data.action === 'START_GAME') {
        gameState.started = true;
        gameState.turnIndex = 0;
        broadcastState();
    } else if (data.action === 'RESTART_GAME') {
        gameState.players.forEach(p => {
            p.position = 0;
            p.credits = 1000;
            p.properties = [];
            p.jailTurns = 0;
            p.gifts = [];
        });
        gameState.properties = {};
        gameState.turnIndex = 0;
        gameState.hasRolled = false;
        gameState.usedSurpriseIds = [];
        gameState.usedQuestionIds = [];
        gameState.started = false;
        broadcastState();
    } else if (data.action === 'KICK_PLAYER') {
        const targetId = data.playerId;
        const playerIndex = gameState.players.findIndex(p => p.id === targetId);
        if (playerIndex !== -1) {
            // Adjust turn if the kicked person was current or before current
            if (playerIndex < gameState.turnIndex) {
                gameState.turnIndex--;
            } else if (playerIndex === gameState.turnIndex) {
                gameState.hasRolled = false;
            }
            
            gameState.players.splice(playerIndex, 1);
            
            // Boundary check
            if (gameState.players.length > 0) {
                gameState.turnIndex = gameState.turnIndex % gameState.players.length;
            } else {
                gameState.turnIndex = 0;
            }

            const targetConn = conns.find(c => c.peer === targetId);
            if(targetConn) {
                targetConn.send({ type: 'ERROR', code: 'KICKED' });
                setTimeout(() => targetConn.close(), 500);
                conns = conns.filter(c => c.peer !== targetId);
            }
            broadcastState();
        }
    }
}

function applyCard(player, card) {
    if(card.delta) player.credits += card.delta;
    if(card.type === 'gift') player.gifts.push(card);
}

