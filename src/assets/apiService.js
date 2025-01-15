import axios from 'axios';

const playerCache = new Map(); // Cache for player details
const leaderboardCache = new Map(); // Cache for leaderboard data

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithRateLimiting = async (urls, delayMs) => {
    const results = [];
    for (const url of urls) {
        if (leaderboardCache.has(url)) {
            results.push(leaderboardCache.get(url));
        } else {
            try {
                const response = await axios.get(url);
                leaderboardCache.set(url, response.data.data); // Cache the response
                results.push(response.data.data);
            } catch (err) {
                console.error(`Error fetching URL ${url}:`, err);
            }
        }
        await delay(delayMs);
    }
    return results;
};

export const fetchPlayerDetails = async (runnerIds) => {
    const playerDetails = await Promise.all(
        Array.from(runnerIds).map(async (runnerId) => {
            if (!playerCache.has(runnerId)) {
                try {
                    const response = await axios.get(`https://www.speedrun.com/api/v1/users/${runnerId}`);
                    const userData = response.data.data;
                    playerCache.set(runnerId, {
                        name: userData.names.international,
                        profileUrl: userData.weblink, // Fetch and store the profile URL
                    });
                } catch (err) {
                    console.error(`Error fetching player details for ${runnerId}:`, err);
                    playerCache.set(runnerId, { name: 'Unknown Player', profileUrl: '#' });
                }
            }
            return { id: runnerId, ...playerCache.get(runnerId) };
        })
    );

    return playerDetails.reduce((map, player) => {
        map[player.id] = { name: player.name, profileUrl: player.profileUrl };
        return map;
    }, {});
};
