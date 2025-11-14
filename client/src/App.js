import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Builder from './pages/Builder';
import Viewer from './pages/Viewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/builder/:id" element={<Builder />} />
        <Route path="/view/:id" element={<Viewer />} />
      </Routes>
    </Router>
  );
}

export default App;
