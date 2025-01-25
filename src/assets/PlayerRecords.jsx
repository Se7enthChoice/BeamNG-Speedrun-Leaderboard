import React, { useEffect, useState } from 'react';
import './PlayerRecords.css'; // Import the CSS file for styling

const PlayerRecords = ({ filters }) => {
    const [playerRecords, setPlayerRecords] = useState([]);

    useEffect(() => {
        const fetchPlayerRecords = async () => {
            try {
                const leaderboardResponse = await fetch(`https://raw.githubusercontent.com/se7enthchoice/BeamNG-Speedrun-Leaderboard/v2/leaderboardData.json`);
                const playerResponse = await fetch('https://raw.githubusercontent.com/se7enthchoice/BeamNG-Speedrun-Leaderboard/v2/playerData.json');
                const leaderboardData = await leaderboardResponse.json();
                const playerData = await playerResponse.json();
                const records = {};

                leaderboardData.forEach((entry) => {
                    if (filters[entry.levelType.replace(' ', '')] && entry.runs && entry.runs.runs && Array.isArray(entry.runs.runs)) {
                        entry.runs.runs.forEach((run) => {
                            if (run.place === 1) {
                                run.run.players.forEach((player) => {
                                    if (player.rel === "user" && player.id) {
                                        if (!records[player.id]) {
                                            records[player.id] = 0;
                                        }
                                        records[player.id]++;
                                    }
                                });
                            }
                        });
                    }
                });

                const playerRecordsWithNames = Object.keys(records).map(playerId => ({
                    id: playerId,
                    name: playerData[playerId]?.name || 'Unknown',
                    records: records[playerId]
                }));

                // Sort by number of records held
                playerRecordsWithNames.sort((a, b) => b.records - a.records);

                setPlayerRecords(playerRecordsWithNames);
            } catch (error) {
                console.error("Error fetching player records:", error);
            }
        };

        fetchPlayerRecords();
    }, [filters]);

    return (
        <div className="player-records">
            <h1>Player Records</h1>
            <ul>
                {playerRecords.map((player, index) => (
                    <li key={player.id}>
                        <span className="player-name">{index + 1}. {player.name}</span>
                        <span className="player-records-count">{player.records} Records Held</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerRecords;
