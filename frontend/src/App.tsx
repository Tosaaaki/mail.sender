import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup';
import Review from './pages/Review';
import Stats from './pages/Stats';

const App: React.FC = () => (
  <div>
    <nav>
      <Link to="/signup">Signup</Link> |{' '}
      <Link to="/review">Review</Link> |{' '}
      <Link to="/stats">Stats</Link>
    </nav>
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/review" element={<Review />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  </div>
);

export default App;
