import React, { useState, useEffect } from 'react';
import {
    Grid, Card, CardContent,
    Typography, Box, Chip,
    CircularProgress
} from '@mui/material';
import RouterIcon from '@mui/icons-material/Router';
import WarningIcon from '@mui/icons-material/Warning';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import DeviceApi from '../api/deviceApi';
import CustomerApi from '../api/customerApi';
import IncidentApi from '../api/incidentApi';

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDevices: 0,
        normalDevices: 0,
        errorDevices: 0,
        totalCustomers: 0,
        openIncidents: 0,
        expiringCustomers: 0
    });
    const [errorDevices, setErrorDevices] = useState([]);
    const [openIncidents, setOpenIncidents] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        // 1분마다 자동 갱신
        const interval = setInterval(
            fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [
                devicesRes,
                customersRes,
                errorRes,
                incidentsRes,
                expiringRes
            ] = await Promise.all([
                DeviceApi.getAll(),
                CustomerApi.getAll(),
                DeviceApi.getErrorDevices(),
                IncidentApi.getOpen(),
                CustomerApi.getExpiring()
            ]);

            setStats({
                totalDevices: devicesRes.data.length,
                normalDevices: devicesRes.data.filter(
                    d => d.status === 'NORMAL').length,
                errorDevices: errorRes.data.length,
                totalCustomers: customersRes.data.length,
                openIncidents: incidentsRes.data.length,
                expiringCustomers: expiringRes.data.length
            });

            setErrorDevices(errorRes.data);
            setOpenIncidents(incidentsRes.data);

        } catch (error) {
            console.error('대시보드 데이터 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 요약 카드 데이터
    const summaryCards = [
        {
            title: '전체 장비',
            value: stats.totalDevices,
            icon: <RouterIcon fontSize="large" />,
            color: '#1976d2',
            bgColor: '#e3f2fd'
        },
        {
            title: '정상 장비',
            value: stats.normalDevices,
            icon: <CheckCircleIcon fontSize="large" />,
            color: '#2e7d32',
            bgColor: '#e8f5e9'
        },
        {
            title: '장애 장비',
            value: stats.errorDevices,
            icon: <WarningIcon fontSize="large" />,
            color: '#d32f2f',
            bgColor: '#ffebee'
        },
        {
            title: '전체 고객사',
            value: stats.totalCustomers,
            icon: <PeopleIcon fontSize="large" />,
            color: '#7b1fa2',
            bgColor: '#f3e5f5'
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
            <Typography variant="h5"
                        fontWeight="bold" mb={3}>
                📊 대시보드
            </Typography>

            {/* 요약 카드 */}
            <Grid container spacing={3} mb={8}>
                {summaryCards.map((card, index) => (
                    <Grid item xs={12} sm={6}
                          md={3} key={index}>
                        <Card elevation={2}
                              sx={{ height: '100%', minHeight: 120 }}>
                            <CardContent>
                                <Box display="flex"
                                     justifyContent="space-between"
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
                                    </Box>
                                    <Box
                                        sx={{
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

            {/* 여백 추가 */}
            <Box sx={{ mb: 4 }} />
            
            {/* 하단 섹션 */}
            <Grid container spacing={3}
                mt={4}>
                {/* 장애 장비 목록 */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                mb={2}>
                                🚨 장애 장비 현황
                            </Typography>
                            {errorDevices.length === 0 ? (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    py={3}>
                                    <CheckCircleIcon
                                        color="success"
                                        sx={{ mr: 1 }} />
                                    <Typography
                                        color="success.main">
                                        모든 장비 정상!
                                    </Typography>
                                </Box>
                            ) : (
                                errorDevices.map(device => (
                                    <Box
                                        key={device.id}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        py={1}
                                        borderBottom="1px solid #eee">
                                        <Box>
                                            <Typography
                                                variant="body1"
                                                fontWeight="bold">
                                                {device.deviceName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary">
                                                {device.ipAddress}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label="장애"
                                            color="error"
                                            size="small" />
                                    </Box>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* 미해결 장애 이력 */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                mb={2}>
                                ⚠️ 미해결 장애 이력
                            </Typography>
                            {openIncidents.length === 0 ? (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    py={3}>
                                    <CheckCircleIcon
                                        color="success"
                                        sx={{ mr: 1 }} />
                                    <Typography
                                        color="success.main">
                                        미해결 장애 없음!
                                    </Typography>
                                </Box>
                            ) : (
                                openIncidents.map(incident => (
                                    <Box
                                        key={incident.id}
                                        py={1}
                                        borderBottom="1px solid #eee">
                                        <Box display="flex"
                                             justifyContent="space-between">
                                            <Typography
                                                variant="body1"
                                                fontWeight="bold">
                                                {incident.device
                                                    ?.deviceName}
                                            </Typography>
                                            <Chip
                                                label="미해결"
                                                color="warning"
                                                size="small" />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary">
                                            {incident.description}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary">
                                            {new Date(
                                                incident.occurredAt)
                                                .toLocaleString('ko-KR')}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* 계약만료 임박 */}
                {stats.expiringCustomers > 0 && (
                    <Grid item xs={12}>
                        <Card elevation={2}
                              sx={{ border: '1px solid #ff9800' }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color="warning.main"
                                    mb={2}>
                                    📅 계약만료 임박 고객사
                                    (30일 이내)
                                </Typography>
                                <Typography
                                    color="warning.main">
                                    {stats.expiringCustomers}곳의
                                    고객사 계약이 곧 만료됩니다!
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default Dashboard;