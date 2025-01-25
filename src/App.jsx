import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import PlayerRecords from './assets/PlayerRecords';
import AverageFinish from './assets/AverageFinish';

function App() {
  const [count, setCount] = useState(0);
  const [filters, setFilters] = useState({
    TimeTrial: true,
    Scenario: true,
    LightRunner: true,
    BusRoute: true,
  });

  const handleFilterChange = (event) => {
    const { name, checked } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  return (
    <>
      <div className="filters">
        <label>
          <input
            type="checkbox"
            name="TimeTrial"
            checked={filters.TimeTrial}
            onChange={handleFilterChange}
          />
          Time Trials
        </label>
        <label>
          <input
            type="checkbox"
            name="Scenario"
            checked={filters.Scenario}
            onChange={handleFilterChange}
          />
          Scenarios
        </label>
        <label>
          <input
            type="checkbox"
            name="LightRunner"
            checked={filters.LightRunner}
            onChange={handleFilterChange}
          />
          Light Runner
        </label>
        <label>
          <input
            type="checkbox"
            name="BusRoute"
            checked={filters.BusRoute}
            onChange={handleFilterChange}
          />
          Bus Routes
        </label>
      </div>
      <PlayerRecords filters={filters} />
      <AverageFinish filters={filters} />
    </>
  );
}

export default App;
