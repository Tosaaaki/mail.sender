import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Review from './pages/Review';
import Stats from './pages/Stats';
import DataList from './pages/DataList';

const App: React.FC = () => (
  <div>
    <nav>
      <Link to="/signup">Signup</Link> |{' '}
      <Link to="/review">Review</Link> |{' '}
      <Link to="/stats">Stats</Link> |{' '}
      <Link to="/data">Data</Link>
    </nav>
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/review" element={<Review />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/data" element={<DataList />} />
    </Routes>
  </div>
);

export default App;
