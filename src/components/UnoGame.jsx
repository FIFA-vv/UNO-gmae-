import React, { useState, useEffect } from 'react';
import Card from './Card';
import socket from '../socket';
import { motion, AnimatePresence } from 'framer-motion';

const UnoGame = ({ roomId, playerName }) => {
    const [room, setRoom] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(null); // cardIndex

    useEffect(() => {
        socket.on('updateRoom', (data) => {
            setRoom(data);
            if (data.status === 'playing') setShowColorPicker(null);
        });
        socket.on('requestColor', ({ cardIndex }) => {
            setShowColorPicker(cardIndex);
        });
        return () => {
            socket.off('updateRoom');
            socket.off('requestColor');
        };
    }, []);

    const handlePlayCard = (index, pickedColor = null) => {
        socket.emit('playCard', { roomId, cardIndex: index, pickedColor });
        setShowColorPicker(null);
    };

    const handleDrawCard = () => {
        socket.emit('drawCard', roomId);
    };

    const handleStartGame = () => {
        socket.emit('startGame', roomId);
    };

    const handlePressUno = () => {
        socket.emit('pressUno', roomId);
    };

    const handleCatchUno = (targetId) => {
        socket.emit('catchUno', { roomId, targetPlayerId: targetId });
    };

    const handleNextRound = () => {
        socket.emit('nextRound', roomId);
    };

    if (!room) return <div className="glass" style={{ padding: '20px' }}>Connecting...</div>;

    if (room.status === 'waiting') {
        return (
            <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Room: {roomId}</h2>
                <h3>Players Waiting:</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {room.players.map(p => <li key={p.id}>{p.name} {p.id === socket.id ? '(You)' : ''}</li>)}
                </ul>
                {room.players[0]?.id === socket.id && (
                    <button onClick={handleStartGame} disabled={room.players.length < 2}>Start Game</button>
                )}
                <p style={{ opacity: 0.7 }}>Need at least 2 players to start</p>
            </div>
        );
    }

    if (room.status === 'roundEnded' || room.status === 'gameOver') {
        const isGameOver = room.status === 'gameOver';
        return (
            <div className="glass" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
                <h1 style={{ color: '#ecd407' }}>{isGameOver ? '🏆 TOURNAMENT OVER' : '🔔 ROUND ENDED'}</h1>
                <h2>{room.roundWinner} won the round!</h2>
                <div style={{ margin: '20px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Points Earned: +{room.roundPoints}
                </div>

                <h3 style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>Current Standings:</h3>
                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                    {room.players.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: p.name === room.roundWinner ? 'rgba(236,212,7,0.1)' : 'transparent', borderRadius: '8px' }}>
                            <span>{p.name}</span>
                            <strong>{room.scores[p.id]} pts</strong>
                        </div>
                    ))}
                </div>

                {isGameOver ? (
                    <div>
                        <h2 style={{ color: '#D72600' }}>Overall Winner: {room.winner}</h2>
                        <button onClick={() => window.location.reload()}>Back to Menu</button>
                    </div>
                ) : (
                    room.players[0]?.id === socket.id && (
                        <button onClick={handleNextRound}>Start Next Round</button>
                    )
                )}
            </div>
        );
    }

    const myHand = room.hands[socket.id] || [];
    const currentPlayer = room.players[room.currentPlayer];
    const isMyTurn = currentPlayer?.id === socket.id;

    return (
        <div className="game-board">
            {/* Players Status */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '10px', flexWrap: 'wrap' }}>
                {room.players.map(p => (
                    <div key={p.id} className="glass" style={{
                        padding: '10px 20px',
                        opacity: currentPlayer?.id === p.id ? 1 : 0.6,
                        border: currentPlayer?.id === p.id ? '2px solid #ecd407' : '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        minWidth: '120px'
                    }}>
                        <div style={{ fontWeight: 'bold' }}>{p.name} {p.id === socket.id ? '(You)' : ''}</div>
                        <div style={{ fontSize: '0.9rem' }}>Cards: {room.hands[p.id]?.length}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Score: {room.scores[p.id]}</div>

                        {/* Catch Button for others */}
                        {p.id !== socket.id && room.hands[p.id]?.length === 1 && !room.unoState[p.id]?.hasPressed && (
                            <button
                                onClick={() => handleCatchUno(p.id)}
                                style={{ position: 'absolute', top: '-10px', right: '-10px', padding: '5px 10px', fontSize: '0.7rem', background: '#D72600' }}
                            >
                                CATCH!
                            </button>
                        )}

                        {room.unoState[p.id]?.hasPressed && (
                            <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#ecd407', color: 'black', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                UNO!
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="center-pile" style={{ margin: '20px 0', gap: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Card isBack={true} onClick={isMyTurn ? handleDrawCard : null} />
                    {isMyTurn && <div style={{ fontSize: '0.8rem', marginTop: '10px', color: '#ecd407', fontWeight: 'bold' }}>CLICK TO DRAW</div>}
                </div>

                <div style={{ position: 'relative' }}>
                    {room.discardPile.length > 0 && (
                        <Card card={room.discardPile[room.discardPile.length - 1]} isPlayable={false} />
                    )}
                    <div style={{
                        position: 'absolute',
                        bottom: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: room.currentColor,
                        fontWeight: '900',
                        fontSize: '1rem',
                        textShadow: '1px 1px 2px black'
                    }}>
                        {room.currentColor.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Turn Indicator */}
            <div style={{
                textAlign: 'center',
                backgroundColor: isMyTurn ? 'rgba(236,212,7,0.2)' : 'rgba(255,255,255,0.05)',
                padding: '10px 30px',
                borderRadius: '30px',
                margin: '10px auto',
                maxWidth: '400px',
                border: isMyTurn ? '1px solid #ecd407' : '1px solid transparent',
                fontWeight: 'bold'
            }}>
                {isMyTurn ? "🔥 IT'S YOUR TURN!" : `Waiting for ${currentPlayer?.name}...`}
            </div>

            {/* My Hand Area */}
            <div className="player-hand-container" style={{ marginTop: 'auto', paddingBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>Your Hand ({myHand.length})</h3>
                    {myHand.length <= 2 && (
                        <motion.button
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            onClick={handlePressUno}
                            style={{
                                background: room.unoState[socket.id]?.hasPressed ? '#379711' : '#D72600',
                                boxShadow: '0 0 15px rgba(215,38,0,0.5)'
                            }}
                        >
                            {room.unoState[socket.id]?.hasPressed ? 'UNO PRESSED!' : 'PRESS UNO!'}
                        </motion.button>
                    )}
                </div>

                <div className="player-hand">
                    <AnimatePresence>
                        {myHand.map((card, index) => (
                            <Card
                                key={`${index}-${card.color}-${card.value}`}
                                card={card}
                                onClick={() => isMyTurn && handlePlayCard(index)}
                                isPlayable={isMyTurn}
                                style={{ marginLeft: index === 0 ? 0 : '-40px' }}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Color Picker Overlay */}
            {showColorPicker !== null && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass" style={{ padding: '30px', textAlign: 'center' }}>
                        <h3>Pick a Color</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                            {['red', 'blue', 'green', 'yellow'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => handlePlayCard(showColorPicker, c)}
                                    style={{
                                        backgroundColor: c === 'yellow' ? '#ECD407' : (c === 'red' ? '#D72600' : (c === 'blue' ? '#0062B1' : '#379711')),
                                        width: '100px', height: '60px', borderRadius: '10px', border: '2px solid white'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnoGame;
