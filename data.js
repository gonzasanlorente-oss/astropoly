const GameData = {
    languages: {
        es: {
            MENU_TITLE: "MENÚ PRINCIPAL",
            CREATE_GAME: "CREAR PARTIDA",
            JOIN_GAME: "UNIRSE A PARTIDA",
            ROOM_CODE_PH: "CÓDIGO DE SALA",
            ROOM: "SALA:",
            PLAYERS: "JUGADORES (Créditos)",
            ROLL_DICE: "TIRAR DADO",
            SURPRISES: "SORPRESAS",
            QUESTIONS: "PREGUNTAS",
            DRAW_CARD: "SACAR CARTA",
            CLOSE: "CERRAR",
            WAITING_PLAYERS: "Esperando jugadores...",
            TURN_OF: "Turno de: ",
            YOUR_TURN: "¡Es tu turno!",
            START_GAME: "INICIAR PARTIDA",
            RESTART_GAME: "REINICIAR",
            LABEL_RENT: "ALQUILER:",
            LABEL_H1: "Con 1 Casa",
            LABEL_H2: "Con 2 Casas",
            LABEL_H3: "Con 3 Casas",
            LABEL_H4: "Con 4 Casas",
            LABEL_HOTEL: "Con HOTEL",
            LABEL_HC: "Coste Casa",
            LABEL_MT: "Valor Hipoteca",
            LABEL_BUY: "COMPRAR POR",
            LABEL_PASS: "PASAR",
            SURPRISES_DESC: "Cae en Cápsula de Suerte para obtener un regalo.",
            QUESTIONS_DESC: "Cae en Pregunta Espacial para ganar créditos."
        },
        en: {
            MENU_TITLE: "MAIN MENU",
            CREATE_GAME: "CREATE GAME",
            JOIN_GAME: "JOIN GAME",
            ROOM_CODE_PH: "ROOM CODE",
            ROOM: "ROOM:",
            PLAYERS: "PLAYERS (Credits)",
            ROLL_DICE: "ROLL DICE",
            SURPRISES: "SURPRISES",
            QUESTIONS: "QUESTIONS",
            DRAW_CARD: "DRAW CARD",
            CLOSE: "CLOSE",
            WAITING_PLAYERS: "Waiting for players...",
            TURN_OF: "Turn of: ",
            YOUR_TURN: "It's your turn!",
            START_GAME: "START GAME",
            RESTART_GAME: "RESTART",
            LABEL_RENT: "RENT:",
            LABEL_H1: "With 1 House",
            LABEL_H2: "With 2 Houses",
            LABEL_H3: "With 3 Houses",
            LABEL_H4: "With 4 Houses",
            LABEL_HOTEL: "With HOTEL",
            LABEL_HC: "House Cost",
            LABEL_MT: "Mortgage Value",
            LABEL_BUY: "BUY FOR",
            LABEL_PASS: "PASS",
            SURPRISES_DESC: "Land on Luck Capsule to get a gift.",
            QUESTIONS_DESC: "Land on Space Trivia to win credits."
        },
        fr: {
            MENU_TITLE: "MENU PRINCIPAL",
            CREATE_GAME: "CRÉER UNE PARTIE",
            JOIN_GAME: "REJOINDRE PARTIE",
            ROOM_CODE_PH: "CODE SALLE",
            ROOM: "SALLE:",
            PLAYERS: "JOUEURS (Crédits)",
            ROLL_DICE: "LANCER LE DÉ",
            SURPRISES: "SURPRISES",
            QUESTIONS: "QUESTIONS",
            DRAW_CARD: "TIRER CARTE",
            CLOSE: "FERMER",
            WAITING_PLAYERS: "En attente de joueurs...",
            TURN_OF: "Tour de : ",
            YOUR_TURN: "C'est votre tour !",
            START_GAME: "DÉMARRER PARTIE",
            RESTART_GAME: "REDÉMARRER",
            LABEL_RENT: "LOYER:",
            LABEL_H1: "Avec 1 Maison",
            LABEL_H2: "Avec 2 Maisons",
            LABEL_H3: "Avec 3 Maisons",
            LABEL_H4: "Avec 4 Maisons",
            LABEL_HOTEL: "Avec HÔTEL",
            LABEL_HC: "Coût Maison",
            LABEL_MT: "Valeur Hypothèque",
            LABEL_BUY: "ACHETER POUR",
            LABEL_PASS: "PASSER",
            SURPRISES_DESC: "Atterrissez sur une Capsule Chance pour un cadeau.",
            QUESTIONS_DESC: "Atterrissez sur Trivia Spatiale pour des crédits."
        }
    },
    surprises: [
        // Obsequios Especiales provistos
        { type: "gift", title: { es: "Escudo Antigravedad", en: "Antigravity Shield", fr: "Bouclier Antigravité" }, text: { es: "Inmune a caer en cárcel una vez.", en: "Immune to going to jail once.", fr: "Immunisé contre la prison une fois." } },
        { type: "gift", title: { es: "Salvoconducto Intergaláctico", en: "Intergalactic Safe Conduct", fr: "Sauf-conduit Intergalactique" }, text: { es: "Sal gratis de cárcel sin pagar.", en: "Get out of jail free.", fr: "Sortez de prison gratuitement." } },
        { type: "gift", title: { es: "Hiperpropulsión Instantánea", en: "Instant Hyperdrive", fr: "Hyperpropulsion Instantanée" }, text: { es: "Avanza a cualquier casilla del tablero.", en: "Advance to any space on the board.", fr: "Avancez vers n'importe quelle case du plateau." } },
        { type: "gift", title: { es: "Blindaje Cósmico", en: "Cosmic Armor", fr: "Blindage Cosmique" }, text: { es: "Ignora una multa o penalización.", en: "Ignore a fine or penalty.", fr: "Ignorez une amende ou une pénalité." } },
        { type: "gift", title: { es: "Subsidio de la Federación", en: "Federation Subsidy", fr: "Subvention de la Fédération" }, text: { es: "Cobra el doble en tu próxima cobranza.", en: "Collect double on your next collection.", fr: "Encaissez le double lors de votre prochain encaissement." } },
        // Otros genericos
        { type: "reward", title: { es: "Descubrimiento Minero", en: "Mining Discovery", fr: "Découverte Minière" }, text: { es: "Encuentras un asteroide de oro. Ganas 200 CG.", en: "You find a gold asteroid. Gain 200 CG.", fr: "Vous trouvez un astéroïde en or. Gagnez 200 CG." }, delta: 200 },
        { type: "penalty", title: { es: "Fallo de Motor", en: "Engine Failure", fr: "Panne de Moteur" }, text: { es: "Pagas 50 CG para reparaciones.", en: "Pay 50 CG for repairs.", fr: "Payez 50 CG pour les réparations." }, delta: -50 }
    ],
    questions: [
        { title: { es: "Trivia Espacial", en: "Space Trivia", fr: "Trivia Spatiale" }, text: { es: "¿Cuál es el planeta rojo? (Respuesta correcta: +50 CG)", en: "What is the red planet? (Correct: +50 CG)", fr: "Quelle est la planète rouge ? (Correct : +50 CG)" } },
        { title: { es: "Trivia Espacial", en: "Space Trivia", fr: "Trivia Spatiale" }, text: { es: "¿Quién fue el primer humano en el espacio? (+50 CG)", en: "Who was the first human in space? (+50 CG)", fr: "Qui fut le premier humain dans l'espace ? (+50 CG)" } }
    ],
    // 20 tiles board (6x6 perimeter)
    // Indexes: 0 (top-left), to 19 (perimeter of 6x6 grid)
    board: [
        { name: "START", type: "corner" }, // 0
        { name: "La Luna", type: "property", color: "brown", price: 60, baseRent: 2, rent1: 10, rent2: 30, rent3: 90, rent4: 160, rentHotel: 250, houseCost: 50, mortgage: 30 }, // 1
        { name: "Marte", type: "property", color: "brown", price: 80, baseRent: 5, rent1: 27, rent2: 80, rent3: 240, rent4: 427, rentHotel: 600, houseCost: 67, mortgage: 40 }, // 2
        { name: "CÁPSULA DE SUERTE", type: "action", subType: "surprise" }, // 3
        { name: "Mercurio", type: "property", color: "lightblue", price: 100, baseRent: 6, rent1: 30, rent2: 90, rent3: 270, rent4: 400, rentHotel: 550, houseCost: 50, mortgage: 50 }, // 4
        { name: "Venus", type: "property", color: "lightblue", price: 120, baseRent: 8, rent1: 40, rent2: 100, rent3: 300, rent4: 450, rentHotel: 600, houseCost: 50, mortgage: 60 }, // 5
        { name: "Europa (Satélite)", type: "property", color: "pink", price: 140, baseRent: 10, rent1: 50, rent2: 150, rent3: 450, rent4: 625, rentHotel: 750, houseCost: 100, mortgage: 70 }, // 6
        { name: "JUST VISITING", type: "corner" }, // 7
        { name: "Júpiter", type: "property", color: "pink", price: 140, baseRent: 10, rent1: 50, rent2: 150, rent3: 450, rent4: 625, rentHotel: 750, houseCost: 100, mortgage: 70 }, // 8
        { name: "Saturno", type: "property", color: "pink", price: 160, baseRent: 12, rent1: 60, rent2: 180, rent3: 500, rent4: 700, rentHotel: 900, houseCost: 100, mortgage: 80 }, // 9
        { name: "PREGUNTA ESPACIAL", type: "action", subType: "question" }, // 10
        { name: "Titán", type: "property", color: "orange", price: 180, baseRent: 14, rent1: 70, rent2: 200, rent3: 550, rent4: 750, rentHotel: 950, houseCost: 100, mortgage: 90 }, // 11
        { name: "Urano", type: "property", color: "orange", price: 180, baseRent: 14, rent1: 70, rent2: 200, rent3: 550, rent4: 750, rentHotel: 950, houseCost: 100, mortgage: 90 }, // 12
        { name: "Neptuno", type: "property", color: "orange", price: 200, baseRent: 16, rent1: 80, rent2: 220, rent3: 600, rent4: 800, rentHotel: 1000, houseCost: 100, mortgage: 100 }, // 13
        { name: "O2 SUPPLIES", type: "corner" }, // 14
        { name: "Plutón", type: "property", color: "red", price: 220, baseRent: 18, rent1: 90, rent2: 250, rent3: 700, rent4: 875, rentHotel: 1050, houseCost: 150, mortgage: 110 }, // 15
        { name: "Cinturón de Asteroides", type: "property", color: "red", price: 220, baseRent: 18, rent1: 90, rent2: 250, rent3: 700, rent4: 875, rentHotel: 1050, houseCost: 150, mortgage: 110 }, // 16
        { name: "CÁPSULA DE SUERTE", type: "action", subType: "surprise" }, // 17
        { name: "Nube de Oort", type: "property", color: "red", price: 240, baseRent: 20, rent1: 100, rent2: 300, rent3: 750, rent4: 925, rentHotel: 1100, houseCost: 150, mortgage: 120 }, // 18
        { name: "Próxima Centauri", type: "property", color: "yellow", price: 260, baseRent: 22, rent1: 110, rent2: 330, rent3: 800, rent4: 975, rentHotel: 1150, houseCost: 150, mortgage: 130 }, // 19
        { name: "Alpha Centauri", type: "property", color: "yellow", price: 260, baseRent: 22, rent1: 110, rent2: 330, rent3: 800, rent4: 975, rentHotel: 1150, houseCost: 150, mortgage: 130 }, // 20
        { name: "FATAL DEVIATION!!", type: "corner" }, // 21
        { name: "Sirio", type: "property", color: "yellow", price: 280, baseRent: 24, rent1: 120, rent2: 360, rent3: 850, rent4: 1025, rentHotel: 1200, houseCost: 150, mortgage: 140 }, // 22
        { name: "Nebulosa de Orión", type: "property", color: "green", price: 300, baseRent: 26, rent1: 130, rent2: 390, rent3: 900, rent4: 1100, rentHotel: 1275, houseCost: 200, mortgage: 150 }, // 23
        { name: "PREGUNTA ESPACIAL", type: "action", subType: "question" }, // 24
        { name: "Nebulosa del Águila", type: "property", color: "green", price: 320, baseRent: 28, rent1: 150, rent2: 450, rent3: 1000, rent4: 1200, rentHotel: 1400, houseCost: 200, mortgage: 160 }, // 25
        { name: "Galaxia de Andrómeda", type: "property", color: "darkblue", price: 350, baseRent: 35, rent1: 175, rent2: 500, rent3: 1100, rent4: 1300, rentHotel: 1500, houseCost: 200, mortgage: 175 }, // 26
        { name: "Sagitario A*", type: "property", color: "darkblue", price: 400, baseRent: 50, rent1: 200, rent2: 600, rent3: 1400, rent4: 1700, rentHotel: 2000, houseCost: 200, mortgage: 200 } // 27
    ]
};
