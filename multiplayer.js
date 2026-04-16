let peer = null;
let conn = null; // for clients
let conns = [];  // for host
let isHost = false;
let myPeerId = null;

const gameState = {
    players: [],
    turnIndex: 0,
    started: false,
    jailAction: null,
    properties: {}
};

// Colors for 6 players
const playerColors = ['#ff3333', '#3366ff', '#33ff33', '#ffff33', '#ff00ff', '#00ffff'];

// WebRTC Config for restrictive networks (Schools/Institutes)
const peerConfig = {
    config: {
        'iceServers': [
            // Public Google STUN servers (helps find public IPs)
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            
            // Public Free TURN server (relays traffic if direct UDP P2P is blocked)
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

    // Host receives connections
    peer.on('connection', (connection) => {
        if (!isHost) return;
        conns.push(connection);
        
        connection.on('data', (data) => {
            handleIncomeDataFromPeer(data, connection.peer, onDataCb);
        });
        
        connection.on('open', () => {
            onConnectionCb(connection.peer);
            // Auto add player
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
    // Trigger local update too
    if (window.updateGameUI) window.updateGameUI(gameState);
}

function addPlayerBase(id, name) {
    if(gameState.players.length >= 6) return; // Max 6
    // Check if player already exists
    if(gameState.players.some(p => p.id === id)) return;
    
    gameState.players.push({
        id: id,
        name: name,
        color: playerColors[gameState.players.length],
        position: 0,
        credits: 1500,
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
        const oldPos = player.position;
        player.position = (player.position + data.steps) % 28;
        if (player.position < oldPos) {
            // Passed START
            player.credits += 200;
        }
        broadcastState();

        const cell = GameData.board[player.position];
        if (cell.type === 'property' || cell.type === 'station') {
            const ownerId = gameState.properties[player.position];
            if (!ownerId && player.credits >= cell.price) {
                // Not owned, trigger buy prompt locally for that player
                conns.forEach(c => {
                    if (c.peer === senderId) c.send({type: 'PROMPT_BUY', cellIndex: player.position, price: cell.price});
                });
                if(senderId === myPeerId) window.promptBuyLocal(player.position, cell.price);
            } else if (ownerId && ownerId !== senderId) {
                // Owned by someone else, pay rent
                const ownerPlayer = gameState.players.find(p => p.id === ownerId);
                const rent = cell.baseRent || Math.floor(cell.price / 5) || 10;
                player.credits -= rent;
                if (ownerPlayer) ownerPlayer.credits += rent;

                const msg = `${player.name} pagó ${rent} CG a ${ownerPlayer ? ownerPlayer.name : 'el Banco'}`;
                conns.forEach(c => c.send({type: 'NOTIFICATION', message: msg}));
                if(window.showNotificationLocal) window.showNotificationLocal(msg);
                
                // Turn ends after paying rent
                gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
                broadcastState();
            } else {
                // Owned by self or cannot afford unowned property
                gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
                broadcastState();
            }
        } else if (cell.type === 'action') {
            if (cell.subType === 'surprise') {
                let card = GameData.surprises[Math.floor(Math.random() * GameData.surprises.length)];
                applyCard(player, card);
                broadcastState();
                if(window.showCardLocal) window.showCardLocal(card);
                conns.forEach(c => c.send({type: 'CARD_DRAWN', card: card, player: player.name}));
            } else if (cell.subType === 'question') {
                let card = GameData.questions[Math.floor(Math.random() * GameData.questions.length)];
                card.isQuestion = true;
                broadcastState();
                if(window.showCardLocal) window.showCardLocal(card);
                conns.forEach(c => c.send({type: 'CARD_DRAWN', card: card, player: player.name}));
            }
        } else if (cell.type === 'corner') {
            // End turn on corners too
            gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
            broadcastState();
        }
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
        // Pasamos turno tras comprar o pasar
        gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
        broadcastState();
    } else if (data.action === 'DRAW_SURPRISE') {
        let card = GameData.surprises[Math.floor(Math.random() * GameData.surprises.length)];
        applyCard(player, card);
        broadcastState();
        if(window.showCardLocal) window.showCardLocal(card);
        conns.forEach(c => c.send({type: 'CARD_DRAWN', card: card, player: player.name}));
    } else if (data.action === 'DRAW_QUESTION') {
        let card = GameData.questions[Math.floor(Math.random() * GameData.questions.length)];
        card.isQuestion = true;
        broadcastState();
        if(window.showCardLocal) window.showCardLocal(card);
        conns.forEach(c => c.send({type: 'CARD_DRAWN', card: card, player: player.name}));
    } else if (data.action === 'QUESTION_ANSWER') {
        const amt = 50;
        if (data.correct) {
            player.credits += amt;
            const msg = `${player.name} +${amt} CG! (Respuesta Correcta)`;
            conns.forEach(c => c.send({type: 'NOTIFICATION', message: msg}));
            if(window.showNotificationLocal) window.showNotificationLocal(msg);
        } else {
            player.credits -= amt;
            const msg = `${player.name} -${amt} CG. (Respuesta Incorrecta)`;
            conns.forEach(c => c.send({type: 'NOTIFICATION', message: msg}));
            if(window.showNotificationLocal) window.showNotificationLocal(msg);
        }
        gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
        broadcastState();
    } else if (data.action === 'NEXT_TURN') {
        gameState.turnIndex = (gameState.turnIndex + 1) % gameState.players.length;
        broadcastState();
    } else if (data.action === 'START_GAME') {
        gameState.started = true;
        gameState.turnIndex = 0;
        broadcastState();
    } else if (data.action === 'RESTART_GAME') {
        gameState.players.forEach(p => {
            p.position = 0;
            p.credits = 1500;
            p.properties = [];
            p.jailTurns = 0;
            p.gifts = [];
        });
        gameState.properties = {};
        gameState.turnIndex = 0;
        gameState.started = true;
        broadcastState();
    }
}

function applyCard(player, card) {
    if(card.delta) player.credits += card.delta;
    if(card.type === 'gift') player.gifts.push(card);
}
