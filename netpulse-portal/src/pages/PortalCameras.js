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
        case 'ERROR':
            return <Chip label="장애"
                         color="error" size="small" />;
        default:
            return <Chip label="미확인"
                         color="default" size="small" />;
    }
};

function PortalCameras({ user }) {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCameras();
    }, []);

    const fetchCameras = async () => {
        try {
            const res = await PortalApi
                .getCameras(user.customerId);
            setCameras(res.data);
        } catch (error) {
            console.error('카메라 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5"
                        fontWeight="bold" mb={3}>
                📹 IP 카메라 현황
            </Typography>

            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {cameras.length}대
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
                                            <b>카메라명</b>
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
                                        <TableCell>
                                            <b>마지막체크</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cameras.length
                                    === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                align="center"
                                                sx={{ py: 5 }}>
                                                등록된 카메라가
                                                없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cameras.map(
                                            (camera, index) => (
                                                <TableRow
                                                    key={camera.id}
                                                    hover
                                                    sx={{
                                                        backgroundColor:
                                                            camera.status
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
                                                            {camera.cameraName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {camera.ipAddress}
                                                    </TableCell>
                                                    <TableCell>
                                                        {camera.location
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {camera.manufacturer
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(
                                                            camera.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="caption">
                                                            {camera.lastCheckedAt
                                                                ? new Date(
                                                                    camera.lastCheckedAt)
                                                                    .toLocaleString(
                                                                        'ko-KR')
                                                                : '-'}
                                                        </Typography>
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

export default PortalCameras;