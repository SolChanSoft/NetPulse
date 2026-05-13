import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent,
    Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    Paper, CircularProgress
} from '@mui/material';
import PortalApi from '../api/portalApi';

function PortalMaintenance({ user }) {
    const [maintenances, setMaintenances] =
        useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaintenance();
    }, []);

    const fetchMaintenance = async () => {
        try {
            const res = await PortalApi
                .getMaintenance(user.customerId);
            setMaintenances(res.data);
        } catch (error) {
            console.error('유지보수 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5"
                        fontWeight="bold" mb={3}>
                🔧 유지보수 이력
            </Typography>

            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {maintenances.length}건
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
                                            <b>작업일</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>작업자</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>작업내용</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>작업결과</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {maintenances.length
                                    === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6} align="center" sx={{ py: 5 }}>
                                                유지보수 이력이 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        maintenances.map(
                                            (m, index) => (
                                                <TableRow
                                                    key={m.id} hover>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            fontWeight="bold">
                                                            {m.device ?.deviceName || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.workDate
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.worker || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.workContent || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.result || '-'}
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

export default PortalMaintenance;
