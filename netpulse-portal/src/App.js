import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { createTheme, ThemeProvider }
  from '@mui/material';
import PortalLogin from './pages/PortalLogin';
import PortalDashboard from './pages/PortalDashboard';
import PortalDevices from './pages/PortalDevices';
import PortalCameras from './pages/PortalCameras';
import PortalIncidents from './pages/PortalIncidents';
import PortalMaintenance
  from './pages/PortalMaintenance';
import PortalLayout
  from './components/Layout/PortalLayout';
import './App.css';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#f57c00' },
  },
});

function App() {
  const [portalUser, setPortalUser] = useState(
      JSON.parse(localStorage.getItem('portalUser'))
      || null
  );

  const handleLogin = (userData) => {
    setPortalUser(userData);
    localStorage.setItem(
        'portalUser',
        JSON.stringify(userData));
  };

  const handleLogout = () => {
    setPortalUser(null);
    localStorage.removeItem('portalUser');
  };

  return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            {/* 로그인 페이지 */}
            <Route
                path="/login"
                element={
                  portalUser
                      ? <Navigate to="/" />
                      : <PortalLogin
                          onLogin={handleLogin} />
                }
            />

            {/* 포털 페이지 */}
            <Route
                path="/"
                element={
                  portalUser
                      ? <PortalLayout
                          user={portalUser}
                          onLogout={handleLogout}>
                        <PortalDashboard
                            user={portalUser} />
                      </PortalLayout>
                      : <Navigate to="/login" />
                }
            />
            <Route
                path="/devices"
                element={
                  portalUser
                      ? <PortalLayout
                          user={portalUser}
                          onLogout={handleLogout}>
                        <PortalDevices
                            user={portalUser} />
                      </PortalLayout>
                      : <Navigate to="/login" />
                }
            />
            <Route
                path="/cameras"
                element={
                  portalUser
                      ? <PortalLayout
                          user={portalUser}
                          onLogout={handleLogout}>
                        <PortalCameras
                            user={portalUser} />
                      </PortalLayout>
                      : <Navigate to="/login" />
                }
            />
            <Route
                path="/incidents"
                element={
                  portalUser
                      ? <PortalLayout
                          user={portalUser}
                          onLogout={handleLogout}>
                        <PortalIncidents
                            user={portalUser} />
                      </PortalLayout>
                      : <Navigate to="/login" />
                }
            />
            <Route
                path="/maintenance"
                element={
                  portalUser
                      ? <PortalLayout
                          user={portalUser}
                          onLogout={handleLogout}>
                        <PortalMaintenance
                            user={portalUser} />
                      </PortalLayout>
                      : <Navigate to="/login" />
                }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;