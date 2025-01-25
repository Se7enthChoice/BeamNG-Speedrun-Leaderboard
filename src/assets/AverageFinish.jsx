import React, { useEffect, useState } from 'react';
import './AverageFinish.css'; // Import the CSS file for styling

const AverageFinish = ({ filters }) => {
    const [averageFinish, setAverageFinish] = useState([]);

    useEffect(() => {
        const fetchAverageFinish = async () => {
            try {
                const leaderboardResponse = await fetch(`https://raw.githubusercontent.com/se7enthchoice/BeamNG-Speedrun-Leaderboard/v2/leaderboardData.json`);
                const playerResponse = await fetch('https://raw.githubusercontent.com/se7enthchoice/BeamNG-Speedrun-Leaderboard/v2/playerData.json');
                const leaderboardData = await leaderboardResponse.json();
                const playerData = await playerResponse.json();
                const finishes = {};
                const allRunners = new Set();

                // Gather unique runners
                leaderboardData.forEach((entry) => {
                    if (filters[entry.levelType.replace(' ', '')]) {
                        entry.runs.runs.forEach((run) => {
                            const runnerId = run.run.players[0].id;
                            allRunners.add(runnerId);
                        });
                    }
                });

                // Initialize runner data
                allRunners.forEach((runnerId) => {
                    finishes[runnerId] = { totalRank: 0, count: 0 };
                });

                // Calculate normalized ranks
                leaderboardData.forEach((entry) => {
                    if (filters[entry.levelType.replace(' ', '')]) {
                        const maxRank = entry.runs.runs.length + 1;
                        const leaderboardRunners = {};

                        entry.runs.runs.forEach((run) => {
                            const runnerId = run.run.players[0].id;
                            leaderboardRunners[runnerId] = run.place;
                        });

                        allRunners.forEach((runnerId) => {
                            const rank = leaderboardRunners[runnerId] || maxRank;
                            finishes[runnerId].totalRank += rank;
                            finishes[runnerId].count += 1;
                        });
                    }
                });

                // Create the average leaderboard
                const averageFinishWithNames = Object.entries(finishes).map(([id, data]) => ({
                    id,
                    name: playerData[id]?.name || 'Unknown Player',
                    averageFinish: (data.totalRank / data.count).toFixed(2),
                }));

                // Sort by average finish
                averageFinishWithNames.sort((a, b) => a.averageFinish - b.averageFinish);

                setAverageFinish(averageFinishWithNames);
            } catch (error) {
                console.error("Error fetching average finish:", error);
            }
        };

        fetchAverageFinish();
    }, [filters]);

    return (
        <div className="average-finish">
            <h1>Average Finish</h1>
            <ul>
                {averageFinish.map((player, index) => (
                    <li key={player.id}>
                        <span className="player-name">{index + 1}. {player.name}</span>
                        <span className="player-average-finish">{player.averageFinish}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AverageFinish;
