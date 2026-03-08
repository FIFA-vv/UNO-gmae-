# 🃏 UNO Multiplayer

A real-time, web-based multiplayer UNO game built with modern technologies. Play with friends in real-time with full game logic, animations, and a global leaderboard.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 🚀 Features

- **Real-time Multiplayer**: Powered by Socket.io for instantaneous game updates.
- **Full UNO Logic**: Includes Skip, Reverse, Draw 2, Wild, and Wild Draw 4 cards.
- **Interactive UI**: Sleek animations using Framer Motion and Lucide icons.
- **Global Leaderboard**: Track high scores and games won, persisted in a SQLite database.
- **Official Rules**: Implements official 2-player and multiplayer rules.
- **Responsive Design**: Play on any device.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Framer Motion, Lucide React
- **Backend**: Node.js, Express, Socket.io
- **Database**: SQLite (via `better-sqlite3`)
- **Styling**: Vanilla CSS

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/FIFA-vv/UNO-gmae-.git
   cd UNO-gmae-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   The application uses a local `uno.db` file. The server will initialize it automatically on first run.

### Running the Application

You'll need two terminal windows:

**Terminal 1: Start the Backend Server**
```bash
node server.js
```

**Terminal 2: Start the Frontend Dev Server**
```bash
npm run dev
```

The game should now be running at `http://localhost:5173`.

---

## 🎮 How to Play

1. **Join/Create a Room**: Enter a room ID and your name.
2. **Start the Game**: Once players have joined, click "Start Game".
3. **Play Cards**: Match by color or number.
4. **Action Cards**: Use Special cards to skip turns, reverse direction, or make opponents draw cards.
5. **UNO!**: Don't forget to press the "UNO" button when you have one card left, or neighbors might catch you!

---

## 🏗️ Architecture

The project follows a client-server architecture:
- **`server.js`**: Manages game state, room logic, and socket connections.
- **`src/logic/unoLogic.js`**: Pure game logic used by both client and server to ensure consistency.
- **`src/components/UnoGame.jsx`**: Main game component handling user interactions and real-time updates.

---

## 📄 License

This project is open-source and available under the MIT License.

