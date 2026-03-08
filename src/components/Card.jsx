import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ card, onClick, isPlayable, style, isBack = false }) => {
    const getColorCode = (color) => {
        switch (color) {
            case 'red': return '#D72600';
            case 'blue': return '#0062B1';
            case 'green': return '#379711';
            case 'yellow': return '#ECD407';
            case 'wild': return '#000000';
            default: return '#000000';
        }
    };

    const getSymbol = (value) => {
        if (value === 'WildDraw4') return '+4';
        if (value === 'Wild') return 'W';
        if (value === 'Draw2') return '+2';
        if (value === 'Skip') return '⊘';
        if (value === 'Reverse') return '⇄';
        return value;
    };

    if (isBack) {
        return (
            <div
                onClick={onClick}
                style={{
                    ...style,
                    width: '100px',
                    height: '150px',
                    backgroundColor: 'black',
                    borderRadius: '12px',
                    border: '4px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    cursor: onClick ? 'pointer' : 'default'
                }}
            >
                <div style={{
                    position: 'absolute',
                    width: '140%',
                    height: '60%',
                    background: '#D72600',
                    transform: 'rotate(-45deg)',
                    zIndex: 1
                }} />
                <span style={{
                    zIndex: 2,
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: '900',
                    fontStyle: 'italic',
                    textShadow: '2px 2px 0 #000'
                }}>UNO</span>
            </div>
        );
    }

    const symbol = getSymbol(card.value);
    const isWild = card.color === 'wild';

    return (
        <motion.div
            whileHover={isPlayable ? { y: -20, scale: 1.05, rotate: -2 } : {}}
            onClick={onClick}
            style={{
                ...style,
                backgroundColor: 'white',
                width: '100px',
                height: '150px',
                borderRadius: '12px',
                padding: '5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isPlayable ? 'pointer' : 'default',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                position: 'relative',
                userSelect: 'none',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.1)'
            }}
        >
            {/* Background Color Area */}
            <div style={{
                position: 'absolute',
                inset: '5px',
                backgroundColor: getColorCode(card.color),
                borderRadius: '8px',
                zIndex: 1
            }} />

            {/* White Oval Center */}
            <div style={{
                position: 'absolute',
                width: '120%',
                height: '70%',
                backgroundColor: 'white',
                borderRadius: '50%',
                transform: 'rotate(-45deg)',
                zIndex: 2,
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
            }} />

            {/* Main Symbol */}
            <div style={{
                zIndex: 3,
                fontSize: symbol.length > 2 ? '1.5rem' : '3.5rem',
                fontWeight: '900',
                color: isWild ? 'white' : getColorCode(card.color),
                fontStyle: 'italic',
                textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
            }}>
                {isWild ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                        <div style={{ width: '15px', height: '15px', background: '#D72600', borderRadius: '2px' }} />
                        <div style={{ width: '15px', height: '15px', background: '#0062B1', borderRadius: '2px' }} />
                        <div style={{ width: '15px', height: '15px', background: '#ECD407', borderRadius: '2px' }} />
                        <div style={{ width: '15px', height: '15px', background: '#379711', borderRadius: '2px' }} />
                    </div>
                ) : symbol}
            </div>

            {/* Corner Symbols */}
            <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 4, color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {symbol}
            </div>
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 4, color: 'white', fontWeight: 'bold', fontSize: '0.8rem', transform: 'rotate(180deg)' }}>
                {symbol}
            </div>
        </motion.div>
    );
};

export default Card;
