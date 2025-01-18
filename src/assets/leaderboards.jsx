import React, { useState } from 'react';
import AverageLeaderboard from './AverageLeaderboard';
import RecordLeaderboard from './RecordLeaderboard';
import { leaderboardURLs } from './leaderboardUrls';

const Leaderboards = () => {
    const [selectedLevelTypes, setSelectedLevelTypes] = useState([]);

    // Get unique LevelTypes from leaderboardURLs
    const levelTypes = [...new Set(leaderboardURLs.map(entry => entry.levelType))];

    const handleCheckboxChange = (levelType) => {
        setSelectedLevelTypes((prevSelected) =>
            prevSelected.includes(levelType)
                ? prevSelected.filter((type) => type !== levelType) // Remove if already selected
                : [...prevSelected, levelType] // Add if not already selected
        );
    };

    return (
        <div>
            {/* Filter Section */}
            <div>
                <h2>Filter by Run Types</h2>
                {levelTypes.map((levelType) => (
                    <label key={levelType} style={{ display: 'block', marginBottom: '5px' }}>
                        <input
                            type="checkbox"
                            checked={selectedLevelTypes.includes(levelType)}
                            onChange={() => handleCheckboxChange(levelType)}
                        />
                        {levelType}
                    </label>
                ))}
            </div>

            {/* Leaderboards */}
            <RecordLeaderboard selectedLevelTypes={selectedLevelTypes} />
            <AverageLeaderboard selectedLevelTypes={selectedLevelTypes} />
        </div>
    );
};

export default Leaderboards;
