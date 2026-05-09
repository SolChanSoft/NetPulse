import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import Layout from './components/Common/Layout';
import Dashboard from './pages/Dashboard';
import CustomerPage from './pages/CustomerPage';
import DevicePage from './pages/DevicePage';
import IncidentPage from './pages/IncidentPage';
import './App.css';
import MaintenancePage from './pages/MaintenancePage';
import CameraPage from './pages/CameraPage';

// MUI 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/"
                     element={<Dashboard />} />
              <Route path="/customers"
                     element={<CustomerPage />} />
              <Route path="/devices"
                     element={<DevicePage />} />
              <Route path="/incidents"
                     element={<IncidentPage />} />
              <Route path="/maintenance"
                     element={<MaintenancePage />} />
              <Route path="/cameras"
                     element={<CameraPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;