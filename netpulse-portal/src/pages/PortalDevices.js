import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent,
    Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    Paper, Chip, CircularProgress
} from '@mui/material';
import PortalApi from '../api/portalApi';

const getStatusChip = (status) => {
    switch (status) {
        case 'NORMAL':
            return <Chip label="정상"
                         color="success" size="small" />;
        case 'WARNING':
            return <Chip label="경고"
                         color="warning" size="small" />;
        case 'ERROR':
            return <Chip label="장애"
                         color="error" size="small" />;
        default:
            return <Chip label="미확인"
                         color="default" size="small" />;
    }
};

function PortalDevices({ user }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await PortalApi
                .getDevices(user.customerId);
            setDevices(res.data);
        } catch (error) {
            console.error('장비 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5"
                        fontWeight="bold" mb={3}>
                🖥️ 장비 현황
            </Typography>

            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {devices.length}대
                    </Typography>
                    {loading ? (
                        <Box display="flex"
                             justifyContent="center"
                             py={5}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer
                            component={Paper}
                            elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{
                                        backgroundColor:
                                            '#f5f5f5' }}>
                                        <TableCell>
                                            <b>No</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>장비명</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>유형</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>IP주소</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>위치</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>제조사</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>상태</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {devices.length
                                    === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                align="center"
                                                sx={{ py: 5 }}>
                                                등록된 장비가
                                                없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        devices.map(
                                            (device, index) => (
                                                <TableRow
                                                    key={device.id}
                                                    hover
                                                    sx={{
                                                        backgroundColor:
                                                            device.status
                                                            === 'ERROR'
                                                                ? '#fff8f8'
                                                                : 'inherit'
                                                    }}>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            fontWeight="bold">
                                                            {device.deviceName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {device.deviceType}
                                                    </TableCell>
                                                    <TableCell>
                                                        {device.ipAddress}
                                                    </TableCell>
                                                    <TableCell>
                                                        {device.location
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {device.manufacturer
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(
                                                            device.status)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default PortalDevices;