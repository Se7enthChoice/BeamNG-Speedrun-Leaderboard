import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { leaderboardURLs } from './leaderboardUrls'; //Import the leaderboard URLs

const RecordLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const playerCache = new Map(); //Cache for player details
                const responses = await Promise.all(
                    leaderboardURLs.map(url => axios.get(url)) //Use imported URLs here
                );

                const leaderboards = responses.map(res => res.data.data);
                const runnerRecords = {};

                //Gather all unique users across leaderboards
                leaderboards.forEach(leaderboard => {
                    leaderboard.runs.forEach(run => {
                        const runnerId = run.run.players[0].id;

                        //If the runner is in 1st place, increment their record count
                        if (run.place === 1) {
                            runnerRecords[runnerId] = (runnerRecords[runnerId] || 0) + 1;
                        }
                    });
                });

                //Fetch player details for all users who have 1st places
                const allRunners = Object.keys(runnerRecords);
                const playerDetails = await Promise.all(
                    allRunners.map(async runnerId => {
                        if (!playerCache.has(runnerId)) {
                            const response = await axios.get(`https://www.speedrun.com/api/v1/users/${runnerId}`);
                            playerCache.set(runnerId, response.data.data.names.international);
                        }
                        return { id: runnerId, name: playerCache.get(runnerId) };
                    })
                );

                //Map player details to IDs
                const playerNameMap = playerDetails.reduce((map, player) => {
                    map[player.id] = player.name;
                    return map;
                }, {});

                //Create leaderboard based on 1st places count
                const recordLeaderboard = Object.entries(runnerRecords)
                    .map(([id, count]) => ({
                        id,
                        name: playerNameMap[id] || 'Unknown Player',
                        firstPlaceCount: count,
                    }))
                    .sort((a, b) => b.firstPlaceCount - a.firstPlaceCount); //Sort by most 1st places

                setLeaderboard(recordLeaderboard);
            } catch (err) {
                setError('Failed to fetch leaderboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboards();
    }, []);

    if (loading) return <div className="spinner"></div>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>1st Place Records Leaderboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Runner Name</th>
                        <th>1st Place Count</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((runner, index) => (
                        <tr key={runner.id}>
                            <td>{index + 1}</td>
                            <td>{runner.name}</td>
                            <td>{runner.firstPlaceCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecordLeaderboard;