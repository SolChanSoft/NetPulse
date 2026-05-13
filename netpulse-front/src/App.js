import React, { useState } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate
} from 'react-router-dom';
import { createTheme, ThemeProvider }
  from '@mui/material';
import Layout from './components/Common/Layout';
import Dashboard from './pages/Dashboard';
import CustomerPage from './pages/CustomerPage';
import DevicePage from './pages/DevicePage';
import IncidentPage from './pages/IncidentPage';
import MaintenancePage from './pages/MaintenancePage';
import CameraPage from './pages/CameraPage';
import AdminLogin from './pages/AdminLogin';
import './App.css';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  const [adminUser, setAdminUser] = useState(
      JSON.parse(localStorage.getItem('adminUser'))
      || null
  );

  const handleLogin = (userData) => {
    setAdminUser(userData);
    localStorage.setItem(
        'adminUser',
        JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            {/* 로그인 */}
            <Route path="/login"
                   element={
                     adminUser
                         ? <Navigate to="/" />
                         : <AdminLogin
                             onLogin={handleLogin} />
                   }
            />

            {/* 관리자 페이지 */}
            <Route path="/"
                   element={
                     adminUser
                         ? <Layout
                             onLogout={handleLogout}>
                           <Dashboard />
                         </Layout>
                         : <Navigate to="/login" />
                   }
            />
            <Route path="/customers"
                   element={
                     adminUser
                         ? <Layout
                             onLogout={handleLogout}>
                           <CustomerPage />
                         </Layout>
                         : <Navigate to="/login" />
                   }
            />
            <Route path="/devices"
                   element={
                     adminUser
                         ? <Layout
                             onLogout={handleLogout}>
                           <DevicePage />
                         </Layout>
                         : <Navigate to="/login" />
                   }
            />
            <Route path="/cameras"
                   element={
                     adminUser
                         ? <Layout
                             onLogout={handleLogout}>
                           <CameraPage />
                         </Layout>
                         : <Navigate to="/login" />
                   }
            />
            <Route path="/incidents"
                   element={
                     adminUser
                         ? <Layout onLogout={handleLogout}><IncidentPage />
                         </Layout>
                         : <Navigate to="/login" />
                   }
            />
            <Route path="/maintenance"
                   element={
                     adminUser
                         ? <Layout
                             onLogout={handleLogout}>
                           <MaintenancePage />
                         </Layout>
                         : <Navigate to="/login" />
                   }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;