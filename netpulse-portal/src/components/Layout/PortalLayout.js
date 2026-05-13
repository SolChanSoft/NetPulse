import React from 'react';
import { useNavigate, useLocation }
    from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Typography,
    Drawer, List, ListItem, ListItemIcon,
    ListItemText, Button, Divider, Chip
} from '@mui/material';
import DashboardIcon
    from '@mui/icons-material/Dashboard';
import RouterIcon from '@mui/icons-material/Router';
import VideocamIcon
    from '@mui/icons-material/Videocam';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const menuItems = [
    { text: '대시보드',
        icon: <DashboardIcon />, path: '/' },
    { text: '장비 현황',
        icon: <RouterIcon />, path: '/devices' },
    { text: 'IP 카메라',
        icon: <VideocamIcon />, path: '/cameras' },
    { text: '장애 이력',
        icon: <WarningIcon />, path: '/incidents' },
    { text: '유지보수 이력',
        icon: <BuildIcon />, path: '/maintenance' },
];

function PortalLayout({ children, user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box sx={{ display: 'flex' }}>
            {/* 상단 AppBar */}
            <AppBar position="fixed"
                    sx={{ zIndex: (theme) =>
                            theme.zIndex.drawer + 1,
                        backgroundColor: '#1565c0' }}>
                <Toolbar>
                    <Typography variant="h6"
                                noWrap sx={{ flexGrow: 1 }}>
                        🌐 NetPulse 고객 포털
                    </Typography>
                    <Chip
                        label={user?.companyName}
                        color="warning"
                        sx={{ mr: 2 }}
                    />
                    <Button
                        color="inherit"
                        startIcon={<LogoutIcon />}
                        onClick={onLogout}>
                        로그아웃
                    </Button>
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
                }}>
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    {/* 회사 정보 */}
                    <Box sx={{ p: 2,
                        backgroundColor: '#e3f2fd' }}>
                        <Typography variant="body2"
                                    color="text.secondary">
                            접속 고객사
                        </Typography>
                        <Typography variant="body1"
                                    fontWeight="bold">
                            {user?.companyName}
                        </Typography>
                        <Typography variant="body2"
                                    color="text.secondary">
                            {user?.managerName} 담당자
                        </Typography>
                    </Box>
                    <Divider />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() =>
                                    navigate(item.path)}
                                selected={
                                    location.pathname
                                    === item.path}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor:
                                            '#e3f2fd',
                                        borderRight:
                                            '3px solid #1565c0'
                                    }
                                }}>
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
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

export default PortalLayout;