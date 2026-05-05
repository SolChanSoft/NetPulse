import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Card,
    CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid,
    MenuItem, Select, FormControl,
    CircularProgress, Snackbar, Alert,
    Tooltip
} from '@mui/material';
import CheckCircleIcon from
        '@mui/icons-material/CheckCircle';
import RefreshIcon from
        '@mui/icons-material/Refresh';
import IncidentApi from '../api/incidentApi';
import DeviceApi from '../api/deviceApi';

// 장애 상태 표시
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

function IncidentPage() {
    const [incidents, setIncidents] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] =
        useState('');
    const [resolveDialog, setResolveDialog] =
        useState(false);
    const [selectedIncident, setSelectedIncident] =
        useState(null);
    const [resolution, setResolution] = useState('');
    const [createDialog, setCreateDialog] =
        useState(false);
    const [createForm, setCreateForm] = useState({
        device: { id: '' },
        description: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchIncidents();
        fetchDevices();
    }, []);

    // 장애 이력 조회
    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const res = await IncidentApi.getAll();
            setIncidents(res.data);
        } catch (error) {
            showSnackbar('데이터 조회 실패!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 장비 목록 조회
    const fetchDevices = async () => {
        try {
            const res = await DeviceApi.getAll();
            setDevices(res.data);
        } catch (error) {
            console.error('장비 조회 실패:', error);
        }
    };

    // 필터링된 장애 목록
    const filteredIncidents = incidents.filter(
        incident => {
            return filterStatus
                ? incident.status === filterStatus
                : true;
        }
    );

    // 해결 처리 팝업 열기
    const handleOpenResolve = (incident) => {
        setSelectedIncident(incident);
        setResolution('');
        setResolveDialog(true);
    };

    // 해결 처리 실행
    const handleResolve = async () => {
        if (!resolution.trim()) {
            showSnackbar(
                '처리 내용을 입력해 주세요!', 'warning');
            return;
        }
        try {
            await IncidentApi.resolve(
                selectedIncident.id, resolution);
            showSnackbar('장애 해결 처리 완료!', 'success');
            setResolveDialog(false);
            fetchIncidents();
        } catch (error) {
            showSnackbar('처리 실패!', 'error');
        }
    };

    // 장애 등록 팝업 열기
    const handleOpenCreate = () => {
        setCreateForm({
            device: { id: '' },
            description: ''
        });
        setCreateDialog(true);
    };

    // 장애 등록 실행
    const handleCreate = async () => {
        if (!createForm.device.id) {
            showSnackbar(
                '장비를 선택해 주세요!', 'warning');
            return;
        }
        if (!createForm.description.trim()) {
            showSnackbar(
                '장애 내용을 입력해 주세요!', 'warning');
            return;
        }
        try {
            await IncidentApi.create(createForm);
            showSnackbar('장애 등록 완료!', 'success');
            setCreateDialog(false);
            fetchIncidents();
        } catch (error) {
            showSnackbar('등록 실패!', 'error');
        }
    };

    // 날짜 포맷
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr)
            .toLocaleString('ko-KR');
    };

    // 스낵바 표시
    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box>
            {/* 페이지 제목 */}
            <Typography variant="h5"
                        fontWeight="bold" mb={3}>
                ⚠️ 장애 이력
            </Typography>

            {/* 필터 & 버튼 */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}
                          alignItems="flex-end">
                        {/* 상태 필터 */}
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                상태 필터
                            </Typography>
                            <FormControl
                                fullWidth size="small">
                                <Select
                                    value={filterStatus}
                                    displayEmpty
                                    onChange={(e) =>
                                        setFilterStatus(
                                            e.target.value)}>
                                    <MenuItem value="">
                                        전체
                                    </MenuItem>
                                    <MenuItem value="OPEN">
                                        미해결
                                    </MenuItem>
                                    <MenuItem
                                        value="INPROGRESS">
                                        처리중
                                    </MenuItem>
                                    <MenuItem
                                        value="RESOLVED">
                                        해결완료
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 버튼 */}
                        <Grid item xs={12} sm={8}>
                            <Box display="flex"
                                 gap={1}
                                 justifyContent="flex-end"
                                 alignItems="flex-end"
                                 height="100%">
                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <RefreshIcon />}
                                    onClick={fetchIncidents} sx={{mr: 2}}>
                                    새로고침
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleOpenCreate}>
                                    장애 등록
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 장애 이력 테이블 */}
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {filteredIncidents.length}건
                        {filterStatus === 'OPEN' &&
                            <Chip label="미해결"
                                  color="error"
                                  size="small"
                                  sx={{ ml: 1 }} />
                        }
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
                                            <b>고객사</b>
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
                                        <TableCell
                                            align="center">
                                            <b>관리</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredIncidents
                                        .length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                align="center"
                                                sx={{ py: 5 }}>
                                                <CheckCircleIcon
                                                    color="success"
                                                    sx={{ mr: 1,
                                                        verticalAlign:
                                                            'middle' }}
                                                />
                                                장애 이력이
                                                없습니다!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredIncidents
                                            .map((incident,
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
                                                        {incident
                                                                .device
                                                                ?.customer
                                                                ?.companyName
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            fontWeight="bold">
                                                            {incident
                                                                    .device
                                                                    ?.deviceName
                                                                || '-'}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary">
                                                            {incident
                                                                    .device
                                                                    ?.ipAddress
                                                                || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {incident
                                                                .description
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            incident
                                                                .occurredAt)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            incident
                                                                .resolvedAt)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {incident
                                                                .resolution
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(
                                                            incident
                                                                .status)}
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        {incident
                                                                .status
                                                            !== 'RESOLVED'
                                                            && (
                                                                <Tooltip
                                                                    title="해결 처리">
                                                                    <IconButton
                                                                        color="success"
                                                                        size="small"
                                                                        onClick={() =>
                                                                            handleOpenResolve(
                                                                                incident)}>
                                                                        <CheckCircleIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
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

            {/* 해결 처리 팝업 */}
            <Dialog open={resolveDialog}
                    onClose={() =>
                        setResolveDialog(false)}
                    maxWidth="sm" fullWidth>
                <DialogTitle>
                    🔧 장애 해결 처리
                </DialogTitle>
                <DialogContent>
                    <Box mt={2}>
                        {/* 장애 정보 */}
                        <Card variant="outlined"
                              sx={{ mb: 2, p: 2,
                                  backgroundColor: '#f5f5f5' }}>
                            <Typography variant="body2"
                                        color="text.secondary">
                                장비명
                            </Typography>
                            <Typography fontWeight="bold">
                                {selectedIncident
                                    ?.device?.deviceName}
                            </Typography>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mt={1}>
                                장애내용
                            </Typography>
                            <Typography>
                                {selectedIncident
                                    ?.description}
                            </Typography>
                        </Card>

                        {/* 처리 내용 입력 */}
                        <Typography variant="body2"
                                    color="text.secondary"
                                    mb={0.5}>
                            처리 내용 *
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="처리 내용을 입력해 주세요..."
                            value={resolution}
                            onChange={(e) =>
                                setResolution(
                                    e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() =>
                        setResolveDialog(false)}>
                        취소
                    </Button>
                    <Button variant="contained"
                            color="success"
                            onClick={handleResolve}>
                        해결 처리
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 장애 등록 팝업 */}
            <Dialog open={createDialog}
                    onClose={() =>
                        setCreateDialog(false)}
                    maxWidth="sm" fullWidth>
                <DialogTitle>
                    ⚠️ 장애 등록
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>
                        {/* 장비 선택 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                장비 *
                            </Typography>
                            <FormControl fullWidth>
                                <Select
                                    value={
                                        createForm
                                            .device.id}
                                    displayEmpty
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            device: {
                                                id: e.target
                                                    .value
                                            }
                                        })}
                                    renderValue={(value) => {
                                        if (!value) return '장비를 선택하세요';
                                        const found =
                                            devices.find(
                                                d => d.id
                                                    === value);
                                        return found
                                            ? found.deviceName
                                            : '';
                                    }}>
                                    {devices.map(d => (
                                        <MenuItem
                                            key={d.id}
                                            value={d.id}>
                                            {d.deviceName}
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ ml: 1 }}>
                                                ({d.ipAddress})
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 장애 내용 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                장애 내용 *
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder=
                                    "장애 내용을 입력해 주세요..."
                                value={
                                    createForm.description}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        description:
                                        e.target.value
                                    })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() =>
                        setCreateDialog(false)}>
                        취소
                    </Button>
                    <Button variant="contained"
                            color="error"
                            onClick={handleCreate}>
                        등록
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 스낵바 알림 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({
                    ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default IncidentPage;