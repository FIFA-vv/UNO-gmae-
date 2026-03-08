import React, { useState, useEffect } from 'react';

const Scoreboard = () => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/scores')
            .then(res => res.json())
            .then(data => setScores(data))
            .catch(err => console.error('Error fetching scores:', err));
    }, []);

    return (
        <div className="glass" style={{ padding: '20px', minWidth: '300px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Scoreboard</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Player</th>
                        <th style={{ textAlign: 'center', padding: '10px' }}>Wins</th>
                        <th style={{ textAlign: 'center', padding: '10px' }}>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <td style={{ padding: '10px' }}>{s.name}</td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>{s.games_won}</td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>{s.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Scoreboard;
