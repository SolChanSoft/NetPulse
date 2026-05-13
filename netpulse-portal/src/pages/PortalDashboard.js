import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card,
    CardContent, Chip, CircularProgress
} from '@mui/material';
import RouterIcon from '@mui/icons-material/Router';
import VideocamIcon
    from '@mui/icons-material/Videocam';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon
    from '@mui/icons-material/CheckCircle';
import PortalApi from '../api/portalApi';

function PortalDashboard({ user }) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDevices: 0,
        normalDevices: 0,
        errorDevices: 0,
        totalCameras: 0,
        normalCameras: 0,
        errorCameras: 0,
        openIncidents: 0
    });
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [
                dashboardRes,
                devicesRes,
                camerasRes,
                incidentsRes
            ] = await Promise.all([
                PortalApi.getDashboard(user.customerId),
                PortalApi.getDevices(user.customerId),
                PortalApi.getCameras(user.customerId),
                PortalApi.getIncidents(user.customerId)
            ]);

            setDashboard(dashboardRes.data);

            const devices = devicesRes.data;
            const cameras = camerasRes.data;
            const incidents = incidentsRes.data;

            setStats({
                totalDevices: devices.length,
                normalDevices: devices.filter(
                    d => d.status === 'NORMAL').length,
                errorDevices: devices.filter(
                    d => d.status === 'ERROR').length,
                totalCameras: cameras.length,
                normalCameras: cameras.filter(
                    c => c.status === 'NORMAL').length,
                errorCameras: cameras.filter(
                    c => c.status === 'ERROR').length,
                openIncidents: incidents.filter(
                    i => i.status === 'OPEN').length
            });

        } catch (error) {
            console.error('대시보드 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const summaryCards = [
        {
            title: '전체 장비',
            value: stats.totalDevices,
            sub: `정상 ${stats.normalDevices}대`,
            icon: <RouterIcon fontSize="large" />,
            color: '#1565c0',
            bgColor: '#e3f2fd'
        },
        {
            title: '장애 장비',
            value: stats.errorDevices,
            sub: stats.errorDevices > 0
                ? '즉시 확인 필요!'
                : '모두 정상!',
            icon: <WarningIcon fontSize="large" />,
            color: stats.errorDevices > 0
                ? '#d32f2f' : '#2e7d32',
            bgColor: stats.errorDevices > 0
                ? '#ffebee' : '#e8f5e9'
        },
        {
            title: 'IP 카메라',
            value: stats.totalCameras,
            sub: `정상 ${stats.normalCameras}대`,
            icon: <VideocamIcon fontSize="large" />,
            color: '#7b1fa2',
            bgColor: '#f3e5f5'
        },
        {
            title: '미해결 장애',
            value: stats.openIncidents,
            sub: stats.openIncidents > 0
                ? '처리 필요!'
                : '장애 없음!',
            icon: <CheckCircleIcon fontSize="large" />,
            color: stats.openIncidents > 0
                ? '#f57c00' : '#2e7d32',
            bgColor: stats.openIncidents > 0
                ? '#fff3e0' : '#e8f5e9'
        }
    ];

    if (loading) {
        return (
            <Box display="flex"
                 justifyContent="center"
                 alignItems="center"
                 minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* 페이지 제목 */}
            <Box display="flex"
                 justifyContent="space-between"
                 alignItems="center" mb={3}>
                <Typography variant="h5"
                            fontWeight="bold">
                    📊 현황 대시보드
                </Typography>
                <Box>
                    <Chip
                        label={
                            `계약만료: ${dashboard
                                ?.contractExpiry
                            || '-'}`}
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 1 }}
                    />
                    <Chip
                        label={dashboard?.status
                        === 'ACTIVE'
                            ? '계약중' : '만료'}
                        color={dashboard?.status
                        === 'ACTIVE'
                            ? 'success' : 'error'}
                    />
                </Box>
            </Box>

            {/* 요약 카드 */}
            <Grid container spacing={3} mb={4}>
                {summaryCards.map((card, index) => (
                    <Grid item xs={12} sm={6}
                          md={3} key={index}>
                        <Card elevation={2}
                              sx={{ height: '100%' }}>
                            <CardContent>
                                <Box display="flex"
                                     justifyContent=
                                         "space-between"
                                     alignItems="center">
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary">
                                            {card.title}
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color={card.color}>
                                            {card.value}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color={card.color}>
                                            {card.sub}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        backgroundColor:
                                        card.bgColor,
                                        color: card.color
                                    }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 안내 메시지 */}
            <Card elevation={2}
                  sx={{ backgroundColor: '#e3f2fd' }}>
                <CardContent>
                    <Typography variant="body1"
                                fontWeight="bold"
                                color="primary" mb={1}>
                        💡 이용 안내
                    </Typography>
                    <Typography variant="body2"
                                color="text.secondary">
                        • 좌측 메뉴에서 장비/카메라
                        현황을 확인하실 수 있습니다.
                    </Typography>
                    <Typography variant="body2"
                                color="text.secondary">
                        • 장애 발생 시 카카오톡으로
                        자동 알림이 발송됩니다.
                    </Typography>
                    <Typography variant="body2"
                                color="text.secondary">
                        • 문의사항은 NetPulse 관리자에게
                        연락해 주세요.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default PortalDashboard;