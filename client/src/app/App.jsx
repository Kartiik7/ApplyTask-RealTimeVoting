import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreatePoll from '../features/polls/pages/CreatePoll';
import PollRoom from '../features/polls/pages/PollRoom';
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>
          <h1>Real-Time Polls</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollRoom />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
