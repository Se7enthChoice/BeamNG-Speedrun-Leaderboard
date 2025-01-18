import React from 'react';
import AverageLeaderboard from './assets/AverageLeaderboard';
import RecordLeaderboard from './assets/RecordLeaderboard';
import './App.css';
import Leaderboards from './assets/leaderboards';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>BeamNG.drive Speedrunning Leaderboards</h1>
            </header>
            <div className="container">
                <Leaderboards />
            </div>
        </div>
    );
}

export default App;