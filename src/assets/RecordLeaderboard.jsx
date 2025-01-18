import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { leaderboardURLs } from './leaderboardUrls';

const RecordLeaderboard = ({ selectedLevelTypes }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const playerCache = new Map();

                // Filter URLs based on selected LevelTypes
                const filteredUrls = leaderboardURLs
                    .filter(entry => selectedLevelTypes.includes(entry.levelType))
                    .map(entry => entry.url);

                const responses = await Promise.all(
                    filteredUrls.map(url => axios.get(url))
                );

                const leaderboards = responses.map(res => res.data.data);
                const runnerRecords = {};

                leaderboards.forEach(leaderboard => {
                    leaderboard.runs.forEach(run => {
                        const runnerId = run.run.players[0].id;
                        if (run.place === 1) {
                            runnerRecords[runnerId] = (runnerRecords[runnerId] || 0) + 1;
                        }
                    });
                });

                const allRunners = Object.keys(runnerRecords);
                const playerDetails = await Promise.all(
                    allRunners.map(async runnerId => {
                        if (!playerCache.has(runnerId)) {
                            const response = await axios.get(`https://www.speedrun.com/api/v1/users/${runnerId}`);
                            const user = response.data.data;
                            playerCache.set(runnerId, {
                                name: user.names.international,
                                profileUrl: user.weblink,
                            });
                        }
                        return { id: runnerId, ...playerCache.get(runnerId) };
                    })
                );

                const playerNameMap = playerDetails.reduce((map, player) => {
                    map[player.id] = player;
                    return map;
                }, {});

                const recordLeaderboard = Object.entries(runnerRecords)
                    .map(([id, count]) => ({
                        id,
                        name: playerNameMap[id]?.name || 'Unknown Player',
                        profileUrl: playerNameMap[id]?.profileUrl || '#',
                        firstPlaceCount: count,
                    }))
                    .sort((a, b) => b.firstPlaceCount - a.firstPlaceCount);

                setLeaderboard(recordLeaderboard);
            } catch (err) {
                setError('Failed to fetch leaderboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboards();
    }, [selectedLevelTypes]); // Refetch data whenever selectedLevelTypes change

    if (loading) return <div className="spinner"></div>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>1st Place Records Leaderboard</h2>
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
                            <td>
                                <a href={runner.profileUrl} target="_blank" rel="noopener noreferrer">
                                    {runner.name}
                                </a>
                            </td>
                            <td>{runner.firstPlaceCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecordLeaderboard;
