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
        case 'OPEN':
            return <Chip label="미해결"
                         color="error" size="small" />;
        case 'INPROGRESS':
            return <Chip label="처리중"
                         color="warning" size="small" />;
        case 'RESOLVED':
            return <Chip label="해결완료"
                         color="success" size="small" />;
        default:
            return <Chip label="알수없음"
                         color="default" size="small" />;
    }
};

function PortalIncidents({ user }) {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const res = await PortalApi
                .getIncidents(user.customerId);
            setIncidents(res.data);
        } catch (error) {
            console.error('장애 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5"
                        fontWeight="bold" mb={3}>
                ⚠️ 장애 이력
            </Typography>

            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {incidents.length}건
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
                                            <b>장애내용</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>발생시간</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>복구시간</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>처리내용</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>상태</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {incidents.length
                                    === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                align="center"
                                                sx={{ py: 5 }}>
                                                장애 이력이
                                                없습니다!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        incidents.map(
                                            (incident,
                                             index) => (
                                                <TableRow
                                                    key={incident.id}
                                                    hover
                                                    sx={{
                                                        backgroundColor:
                                                            incident.status
                                                            === 'OPEN'
                                                                ? '#fff8f8'
                                                                : 'inherit'
                                                    }}>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            fontWeight="bold">
                                                            {incident
                                                                    .device
                                                                    ?.deviceName
                                                                || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {incident.description
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {incident.occurredAt
                                                            ? new Date(
                                                                incident.occurredAt)
                                                                .toLocaleString(
                                                                    'ko-KR')
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {incident.resolvedAt
                                                            ? new Date(
                                                                incident.resolvedAt)
                                                                .toLocaleString(
                                                                    'ko-KR')
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {incident.resolution
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(
                                                            incident.status)}
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

export default PortalIncidents;