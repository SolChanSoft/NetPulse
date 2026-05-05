import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar,
    Typography, List, ListItem,
    ListItemIcon, ListItemText,
    IconButton, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import RouterIcon from '@mui/icons-material/Router';
import WarningIcon from '@mui/icons-material/Warning';
import MenuIcon from '@mui/icons-material/Menu';
import BuildIcon from '@mui/icons-material/Build';

const drawerWidth = 240;

const menuItems = [
    { text: '대시보드', icon: <DashboardIcon />, path: '/' },
    { text: '고객사 관리', icon: <PeopleIcon />, path: '/customers' },
    { text: '장비 관리', icon: <RouterIcon />, path: '/devices' },
    { text: '장애 이력', icon: <WarningIcon />, path: '/incidents' },
    { text: '유지보수 이력', icon: <BuildIcon />, path: '/maintenance' },     
];

function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6"
                            fontWeight="bold"
                            color="primary">
                    🌐 NetPulse
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={
                            location.pathname === item.path}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: '#e3f2fd',
                                borderRight: '3px solid #1976d2'
                            }
                        }}>
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            {/* 상단 AppBar */}
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) =>
                        theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() =>
                            setMobileOpen(!mobileOpen)}
                        sx={{ mr: 2,
                            display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6"
                                noWrap component="div">
                        NetPulse - 네트워크 모니터링 시스템
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* 사이드바 */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                    display: { xs: 'none', sm: 'block' }
                }}>
                {drawer}
            </Drawer>

            {/* 메인 컨텐츠 */}
            <Box component="main"
                 sx={{
                     flexGrow: 1,
                     p: 3,
                     mt: 8,
                     backgroundColor: '#f5f5f5',
                     minHeight: '100vh'
                 }}>
                {children}
            </Box>
        </Box>
    );
}

export default Layout;