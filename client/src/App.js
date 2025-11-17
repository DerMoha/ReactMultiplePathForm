import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormHome from './pages/FormHome';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';

// Legacy routes (kept for backwards compatibility)
import Home from './pages/Home';
import Builder from './pages/Builder';
import Viewer from './pages/Viewer';

function App() {
  return (
    <Router>
      <Routes>
        {/* New form system routes */}
        <Route path="/" element={<FormHome />} />
        <Route path="/form-builder" element={<FormBuilder />} />
        <Route path="/form-builder/:id" element={<FormBuilder />} />
        <Route path="/form-viewer/:id" element={<FormViewer />} />

        {/* Legacy questionnaire routes */}
        <Route path="/questionnaires" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/builder/:id" element={<Builder />} />
        <Route path="/view/:id" element={<Viewer />} />
      </Routes>
    </Router>
  );
}

export default App;
