import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import db from './database.js';
import { createDeck, isValidMove, calculateHandScore } from './src/logic/unoLogic.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

const PORT = 3001;

app.use(cors());
app.use(express.json());

const rooms = new Map(); // roomId -> gameState

const nextTurn = (room, skip = 0) => {
    let next = (room.currentPlayer + room.direction * (1 + skip)) % room.players.length;
    if (next < 0) next = room.players.length - 1;
    room.currentPlayer = next;
};

const drawCardsForPlayer = (room, playerId, count) => {
    for (let i = 0; i < count; i++) {
        if (room.deck.length === 0) {
            const top = room.discardPile.pop();
            room.deck = createDeck(); // Simplified reshuffle
            room.discardPile = [top];
        }
        const card = room.deck.pop();
        room.hands[playerId].push(card);
    }
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomId, playerName }) => {
        socket.join(roomId);

        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                id: roomId,
                players: [],
                deck: [],
                discardPile: [],
                hands: {},
                currentPlayer: 0,
                currentColor: '',
                direction: 1,
                status: 'waiting',
                scores: {}, // playerId -> cumulative score
                pickedColorNeeded: false,
                lastCardPlayed: null,
                unoState: {} // playerId -> { hasPressed: bool, timestamp: number }
            });
        }

        const room = rooms.get(roomId);
        if (!room.players.find(p => p.id === socket.id)) {
            room.players.push({ id: socket.id, name: playerName });
            room.scores[socket.id] = 0;
        }

        io.to(roomId).emit('updateRoom', room);
    });

    socket.on('startGame', (roomId) => {
        const room = rooms.get(roomId);
        if (!room) return;

        room.deck = createDeck();
        room.players.forEach(p => {
            room.hands[p.id] = room.deck.splice(0, 7);
            room.unoState[p.id] = { hasPressed: false };
        });

        const firstCard = room.deck.pop();
        room.discardPile = [firstCard];
        room.currentColor = firstCard.color === 'wild' ? 'red' : firstCard.color;
        room.status = 'playing';
        room.currentPlayer = 0;
        room.pickedColorNeeded = false;

        io.to(roomId).emit('updateRoom', room);
    });

    socket.on('playCard', ({ roomId, cardIndex, pickedColor }) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== 'playing') return;

        const playerId = socket.id;
        const playerIdx = room.players.findIndex(p => p.id === playerId);
        if (playerIdx !== room.currentPlayer) return;

        const playerHand = room.hands[playerId];
        const card = playerHand[cardIndex];
        const topCard = room.discardPile[room.discardPile.length - 1];

        if (isValidMove(card, topCard, room.currentColor)) {
            // Check for Wild Color Pick
            if (card.color === 'wild' && !pickedColor) {
                socket.emit('requestColor', { cardIndex });
                return;
            }

            playerHand.splice(cardIndex, 1);
            room.discardPile.push(card);
            room.currentColor = pickedColor || card.color;
            room.unoState[playerId].hasPressed = false; // Reset for new card play

            if (playerHand.length === 0) {
                // End Round
                let roundPoints = 0;
                Object.keys(room.hands).forEach(pid => {
                    if (pid !== playerId) roundPoints += calculateHandScore(room.hands[pid]);
                });

                room.scores[playerId] += roundPoints;
                room.roundWinner = room.players[playerIdx].name;
                room.roundPoints = roundPoints;

                if (room.scores[playerId] >= 500) {
                    room.status = 'gameOver';
                    room.winner = room.roundWinner;
                } else {
                    room.status = 'roundEnded';
                }
            } else {
                let skipCount = 0;
                if (card.value === 'Skip') skipCount = 1;
                if (card.value === 'Reverse') {
                    if (room.players.length === 2) skipCount = 1; // Official 2-player rule
                    else room.direction *= -1;
                }
                if (card.value === 'Draw2') {
                    const nextPlayerId = room.players[(room.currentPlayer + room.direction + room.players.length) % room.players.length].id;
                    drawCardsForPlayer(room, nextPlayerId, 2);
                    skipCount = 1;
                }
                if (card.value === 'WildDraw4') {
                    const nextPlayerId = room.players[(room.currentPlayer + room.direction + room.players.length) % room.players.length].id;
                    drawCardsForPlayer(room, nextPlayerId, 4);
                    skipCount = 1;
                }

                nextTurn(room, skipCount);
            }
            io.to(roomId).emit('updateRoom', room);
        }
    });

    socket.on('drawCard', (roomId) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== 'playing') return;

        const playerId = socket.id;
        if (room.players[room.currentPlayer].id !== playerId) return;

        drawCardsForPlayer(room, playerId, 1);
        room.unoState[playerId].hasPressed = false;

        // According to official rules, if drawn card is playable, you can play it.
        // For simplicity here, we end turn unless we add "playable" check.
        // Let's implement full official: drawing ends turn unless handled specifically.
        nextTurn(room);
        io.to(roomId).emit('updateRoom', room);
    });

    socket.on('pressUno', (roomId) => {
        const room = rooms.get(roomId);
        if (!room) return;
        room.unoState[socket.id].hasPressed = true;
        io.to(roomId).emit('updateRoom', room);
    });

    socket.on('catchUno', ({ roomId, targetPlayerId }) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== 'playing') return;

        const targetHand = room.hands[targetPlayerId];
        if (targetHand.length === 1 && !room.unoState[targetPlayerId].hasPressed) {
            drawCardsForPlayer(room, targetPlayerId, 2);
            io.to(roomId).emit('updateRoom', room);
        }
    });

    socket.on('nextRound', (roomId) => {
        const room = rooms.get(roomId);
        if (!room) return;

        room.deck = createDeck();
        room.players.forEach(p => {
            room.hands[p.id] = room.deck.splice(0, 7);
            room.unoState[p.id] = { hasPressed: false };
        });

        const firstCard = room.deck.pop();
        room.discardPile = [firstCard];
        room.currentColor = firstCard.color === 'wild' ? 'red' : firstCard.color;
        room.status = 'playing';
        room.currentPlayer = 0;

        io.to(roomId).emit('updateRoom', room);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Database API still works for high scores
app.get('/api/scores', (req, res) => {
    const scores = db.prepare(`
    SELECT p.name, s.score, s.games_won, s.last_played 
    FROM scoreboard s 
    JOIN players p ON s.player_id = p.id 
    ORDER BY s.score DESC
  `).all();
    res.json(scores);
});

app.post('/api/scores', (req, res) => {
    const { name, score, won } = req.body;
    try {
        let player = db.prepare('SELECT id FROM players WHERE name = ?').get(name);
        if (!player) {
            const result = db.prepare('INSERT INTO players (name) VALUES (?)').run(name);
            player = { id: result.lastInsertRowid };
            db.prepare('INSERT INTO scoreboard (player_id, score, games_won) VALUES (?, 0, 0)').run(player.id);
        }
        db.prepare(`UPDATE scoreboard SET score = score + ?, games_won = games_won + ?, last_played = CURRENT_TIMESTAMP WHERE player_id = ?`).run(score, won ? 1 : 0, player.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
