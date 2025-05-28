import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Review from './pages/Review';
import Stats from './pages/Stats';
import DataList from './pages/DataList';
import SendMail from './pages/SendMail';
import Settings from './pages/Settings';

const App: React.FC = () => (
  <div>
    <nav>
      <Link to="/signup">Signup</Link> |{' '}
      <Link to="/review">Review</Link> |{' '}
      <Link to="/stats">Stats</Link> |{' '}
      <Link to="/data">Data</Link> |{' '}
      <Link to="/settings">Settings</Link>
    </nav>
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/review" element={<Review />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/data" element={<DataList />} />
      <Route path="/send" element={<SendMail />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </div>
);

export default App;
