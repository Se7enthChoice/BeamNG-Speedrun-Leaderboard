import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { leaderboardURLs } from './leaderboardUrls'; //Import the leaderboard URLs

const AverageLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const playerCache = new Map(); //Cache for player details
                const responses = await Promise.all(
                    leaderboardURLs.map(url => axios.get(url))
                );

                const leaderboards = responses.map(res => res.data.data);
                const runnerData = {};

                //Gather all unique users across leaderboards
                const allRunners = new Set();
                leaderboards.forEach(leaderboard => {
                    leaderboard.runs.forEach(run => {
                        const runnerId = run.run.players[0].id;
                        allRunners.add(runnerId);
                    });
                });

                //Fetch player details for all unique users
                const playerDetails = await Promise.all(
                    Array.from(allRunners).map(async runnerId => {
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

                //Calculate normalized ranks
                allRunners.forEach(runnerId => {
                    runnerData[runnerId] = { totalRank: 0, count: 0 };
                });

                leaderboards.forEach(leaderboard => {
                    const maxRank = leaderboard.runs.length + 1;

                    //Map leaderboard runs to runners
                    const leaderboardRunners = {};
                    leaderboard.runs.forEach(run => {
                        const runnerId = run.run.players[0].id;
                        leaderboardRunners[runnerId] = run.place;
                    });

                    //Update runner data for this leaderboard
                    allRunners.forEach(runnerId => {
                        const rank = leaderboardRunners[runnerId] || maxRank;
                        runnerData[runnerId].totalRank += rank;
                        runnerData[runnerId].count += 1;
                    });
                });

                //Calculate average ranks
                const averageLeaderboard = Object.entries(runnerData).map(([id, data]) => ({
                    id,
                    name: playerNameMap[id] || 'Unknown Player',
                    averageRank: data.totalRank / data.count,
                }));

                //Sort by average rank
                averageLeaderboard.sort((a, b) => a.averageRank - b.averageRank);

                setLeaderboard(averageLeaderboard);
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
            <h1>Average Finish Leaderboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Runner Name</th>
                        <th>Average Finish</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((runner, index) => (
                        <tr key={runner.id}>
                            <td>{index + 1}</td>
                            <td>{runner.name}</td>
                            <td>{runner.averageRank.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AverageLeaderboard;