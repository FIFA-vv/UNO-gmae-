export const COLORS = ['red', 'blue', 'green', 'yellow'];
export const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw2'];
export const SPECIAL = ['Wild', 'WildDraw4'];

export const CARD_POINTS = {
    'Skip': 20,
    'Reverse': 20,
    'Draw2': 20,
    'Wild': 50,
    'WildDraw4': 50
};

export const getCardScore = (card) => {
    if (CARD_POINTS[card.value]) return CARD_POINTS[card.value];
    return parseInt(card.value) || 0;
};

export const calculateHandScore = (hand) => {
    return hand.reduce((total, card) => total + getCardScore(card), 0);
};

export const createDeck = () => {
    let deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(value => {
            deck.push({ color, value });
            if (value !== '0') deck.push({ color, value }); // Two of each except '0'
        });
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'Wild' });
        deck.push({ color: 'wild', value: 'WildDraw4' });
    }
    return shuffle(deck);
};

const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

export const isValidMove = (card, topCard, currentColor) => {
    if (card.color === 'wild' || card.value === 'Wild' || card.value === 'WildDraw4') return true;
    return card.color === currentColor || card.value === topCard.value;
};
