import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import SoilInputPage from './SoilInputPage';
import CropResultsPage from './CropResultsPage';
import ProfitPage from './ProfitPage';
import DiseaseDetection from './DiseaseDetection';
import MarketTrends from './MarketTrends';
import AlertsPage from './AlertsPage';
import GovSchemes from './GovSchemes';
import NearbyResources from './NearbyResources';
import AppLayout from './AppLayout';
import { NotificationProvider } from './NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Authenticated Routes with Bottom Nav */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/soil" element={<SoilInputPage />} />
            <Route path="/crops" element={<CropResultsPage />} />
            <Route path="/profit" element={<ProfitPage />} />
            <Route path="/scan" element={<DiseaseDetection />} />
            <Route path="/market" element={<MarketTrends />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/schemes" element={<GovSchemes />} />
            <Route path="/resources" element={<NearbyResources />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
