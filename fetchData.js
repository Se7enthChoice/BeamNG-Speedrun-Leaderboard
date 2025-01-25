import fs from "fs";
import fetch from "node-fetch";
import { leaderboardURLs } from "./leaderboardUrls.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch leaderboard data from all defined URLs and save to JSON file. Expecting [{levelType, runs}]
 */
const fetchLeaderboardData = async () => {
    try {
        console.log("Fetching leaderboard data...");
        const allData = [];

        for (const { levelType, url } of leaderboardURLs) {
            console.log(`Fetching leaderboard for ${levelType} from ${url}...`);
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`Failed to fetch leaderboard for ${levelType} - Status: ${response.status}`);
                    continue;
                }
                const data = await response.json();

                // Add the data to the allData array
                allData.push({ levelType, runs: data.data });
            } catch (error) {
                console.error(`Error fetching leaderboard for ${levelType}:`, error);
            }

            // Add a delay between requests to avoid rate-limiting
            await delay(600); // 0.6 seconds
        }

        // Save all data to the JSON file
        console.log("Saving leaderboard data...");
        fs.writeFileSync("./leaderboardData.json", JSON.stringify(allData, null, 2));
        console.log("Leaderboard data saved successfully.");
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
};

/**
 * Fetch player details individually to avoid overwhelming the API.
 */
const fetchPlayerDetails = async (playerIds) => {
    try {
        console.log("Fetching player details...");
        const playerData = {};

        for (const playerId of playerIds) {
            const url = `https://www.speedrun.com/api/v1/users/${playerId}`;
            try {
                console.log(`Fetching player: ${playerId}`);
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`Failed to fetch player ${playerId}`);
                    continue;
                }
                const data = await response.json();
                playerData[playerId] = {
                    name: data.data.names.international,
                    profileUrl: data.data.weblink,
                };
            } catch (error) {
                console.error(`Error fetching player ${playerId}:`, error);
            }

            // Add a delay between requests to avoid rate-limiting
            await delay(600); // 0.6 seconds
        }

        console.log("Saving player data...");
        fs.writeFileSync("./playerData.json", JSON.stringify(playerData, null, 2));
    } catch (error) {
        console.error("Error fetching player details:", error);
    }
};

/**
 * Main function to fetch all leaderboard and player data.
 */
const fetchAllData = async () => {
    await fetchLeaderboardData();

    console.log("Extracting player IDs...");
    const leaderboardData = JSON.parse(fs.readFileSync("./leaderboardData.json"));
    const playerIds = new Set();

    leaderboardData.forEach((entry) => {
        if (entry.runs && entry.runs.runs && Array.isArray(entry.runs.runs)) {
            entry.runs.runs.forEach((run) => {
                run.run.players.forEach((player) => {
                    if (player.rel === "user" && player.id) {
                        playerIds.add(player.id);
                    }
                });
            });
        } else {
            console.warn(`No valid runs data found for ${entry.levelType}`);
        }
    });

    console.log(`Extracted ${playerIds.size} unique player IDs.`);
    await fetchPlayerDetails(Array.from(playerIds));
};

fetchAllData();