import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ImageDashboard from './imagedashboard';
import ChatDashboard from './chatdashboard';
import Login from './Login';
import Dashboard from './dashboard';
import Profile from './profile';
import FrontPage from './frontpage';
import CharacterPage from './CharacterPage';
import CharacterChat from './Characterchat';
import './App.css';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/imagedashboard" element={<ImageDashboard />} />
          <Route path="/chatdashboard" element={<ChatDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/characterpage" element={<CharacterPage />} />
          <Route path="/characterchat" element={<CharacterChat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
