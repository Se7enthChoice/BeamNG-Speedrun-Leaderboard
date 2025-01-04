import React from 'react';
import AverageLeaderboard from './assets/AverageLeaderboard';
import RecordLeaderboard from './assets/RecordLeaderboard';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Speedrun Average Leaderboard</h1>
            </header>
            <div className="container">
                <AverageLeaderboard />
                <RecordLeaderboard />
            </div>
        </div>
    );
}

export default App;