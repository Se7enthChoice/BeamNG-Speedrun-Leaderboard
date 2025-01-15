import React, { useEffect, useState } from 'react';
import { leaderboardURLs } from './leaderboardUrls';
import { fetchWithRateLimiting, fetchPlayerDetails } from './apiService';

const AverageLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const leaderboards = await fetchWithRateLimiting(leaderboardURLs, 125);

                const runnerData = {};
                const allRunners = new Set();

                // Gather unique runners
                leaderboards.forEach((leaderboard) => {
                    leaderboard.runs.forEach((run) => {
                        const runnerId = run.run.players[0].id;
                        allRunners.add(runnerId);
                    });
                });

                // Fetch player details
                const playerNameMap = await fetchPlayerDetails(allRunners);

                // Calculate normalized ranks
                allRunners.forEach((runnerId) => {
                    runnerData[runnerId] = { totalRank: 0, count: 0 };
                });

                leaderboards.forEach((leaderboard) => {
                    const maxRank = leaderboard.runs.length + 1;
                    const leaderboardRunners = {};

                    leaderboard.runs.forEach((run) => {
                        const runnerId = run.run.players[0].id;
                        leaderboardRunners[runnerId] = run.place;
                    });

                    allRunners.forEach((runnerId) => {
                        const rank = leaderboardRunners[runnerId] || maxRank;
                        runnerData[runnerId].totalRank += rank;
                        runnerData[runnerId].count += 1;
                    });
                });

                // Create the average leaderboard
                const averageLeaderboard = Object.entries(runnerData).map(([id, data]) => ({
                    id,
                    name: playerNameMap[id]?.name || 'Unknown Player',
                    profileUrl: playerNameMap[id]?.profileUrl || '#',
                    averageRank: data.totalRank / data.count,
                }));

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
                            <td>
                                <a href={runner.profileUrl} target="_blank" rel="noopener noreferrer">
                                    {runner.name}
                                </a>
                            </td>
                            <td>{runner.averageRank.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AverageLeaderboard;
