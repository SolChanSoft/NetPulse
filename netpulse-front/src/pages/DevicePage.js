import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Card,
    CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid,
    MenuItem, Select, FormControl,
    InputLabel, CircularProgress,
    Snackbar, Alert, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WifiIcon from '@mui/icons-material/Wifi';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeviceApi from '../api/deviceApi';
import CustomerApi from '../api/customerApi';
import SnmpApi from '../api/snmpApi';

// 초기 폼 데이터
const initForm = {
    deviceName: '',
    deviceType: 'SWITCH',
    ipAddress: '',
    manufacturer: '',
    modelName: '',
    location: '',
    snmpCommunity: 'public',
    snmpPort: 161,
    customer: { id: '' }
};

// 장비 유형 목록
const deviceTypes = [
    { value: 'SWITCH', label: '스위치' },
    { value: 'EXCHANGE', label: '교환기' },
    { value: 'ROUTER', label: '라우터' },
    { value: 'SERVER', label: '서버' },
    { value: 'FIREWALL', label: '방화벽' },
    { value: 'OTHER', label: '기타' }
];

// 장비 상태 표시
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
            return <Chip label="알수없음"
                         color="default" size="small" />;
    }
};

// 장비 유형 한글 변환
const getDeviceTypeLabel = (type) => {
    const found = deviceTypes.find(
        d => d.value === type);
    return found ? found.label : type;
};

function DevicePage() {
    const [devices, setDevices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCustomer, setFilterCustomer] =
        useState('');
    const [filterStatus, setFilterStatus] =
        useState('');
    const [openDialog, setOpenDialog] =
        useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [form, setForm] = useState(initForm);
    const [deleteConfirm, setDeleteConfirm] =
        useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [pingLoading, setPingLoading] =
        useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchDevices();
        fetchCustomers();
    }, []);

    // 장비 전체 조회
    const fetchDevices = async () => {
        try {
            setLoading(true);
            const res = await DeviceApi.getAll();
            setDevices(res.data);
        } catch (error) {
            showSnackbar('데이터 조회 실패!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 고객사 목록 조회
    const fetchCustomers = async () => {
        try {
            const res = await CustomerApi.getAll();
            setCustomers(res.data);
        } catch (error) {
            console.error('고객사 조회 실패:', error);
        }
    };

    // 필터링된 장비 목록
    const filteredDevices = devices.filter(device => {
        const customerMatch = filterCustomer
            ? device.customer?.id ===
            parseInt(filterCustomer)
            : true;
        const statusMatch = filterStatus
            ? device.status === filterStatus
            : true;
        return customerMatch && statusMatch;
    });

    // 등록 팝업 열기
    const handleOpenCreate = () => {
        setForm(initForm);
        setEditMode(false);
        setSelectedId(null);
        setOpenDialog(true);
    };

    // 수정 팝업 열기
    const handleOpenEdit = (device) => {
        setForm({
            deviceName: device.deviceName || '',
            deviceType: device.deviceType || 'SWITCH',
            ipAddress: device.ipAddress || '',
            manufacturer: device.manufacturer || '',
            modelName: device.modelName || '',
            location: device.location || '',
            snmpCommunity: device.snmpCommunity || 'public',
            snmpPort: device.snmpPort || 161,
            customer: { id: device.customer?.id || '' }
        });
        setEditMode(true);
        setSelectedId(device.id);
        setOpenDialog(true);
    };

    // 팝업 닫기
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setForm(initForm);
    };

    // 폼 입력
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'customerId') {
            setForm({
                ...form,
                customer: { id: value }
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    // 등록 / 수정 저장
    const handleSave = async () => {
        if (!form.deviceName.trim()) {
            showSnackbar('장비명을 입력해 주세요!',
                'warning');
            return;
        }
        if (!form.customer.id) {
            showSnackbar('고객사를 선택해 주세요!',
                'warning');
            return;
        }
        if (!form.ipAddress.trim()) {
            showSnackbar('IP주소를 입력해 주세요!',
                'warning');
            return;
        }
        try {
            if (editMode) {
                await DeviceApi.update(selectedId, form);
                showSnackbar('장비 수정 완료!', 'success');
            } else {
                await DeviceApi.create(form);
                showSnackbar('장비 등록 완료!', 'success');
            }
            handleCloseDialog();
            fetchDevices();
        } catch (error) {
            showSnackbar('저장 실패!', 'error');
        }
    };

    // 삭제 확인
    const handleDeleteConfirm = (id) => {
        setDeleteId(id);
        setDeleteConfirm(true);
    };

    // 삭제 실행
    const handleDelete = async () => {
        try {
            await DeviceApi.delete(deleteId);
            showSnackbar('장비 삭제 완료!', 'success');
            setDeleteConfirm(false);
            fetchDevices();
        } catch (error) {
            showSnackbar('삭제 실패!', 'error');
        }
    };

    // SNMP Ping 테스트
    const handlePing = async (deviceId) => {
        setPingLoading({ ...pingLoading,
            [deviceId]: true });
        try {
            const res = await SnmpApi.ping(deviceId);
            if (res.data) {
                showSnackbar(
                    '✅ Ping 성공! 장비 정상입니다.',
                    'success');
            } else {
                showSnackbar(
                    '❌ Ping 실패! 장비를 확인해 주세요.',
                    'error');
            }
            fetchDevices();
        } catch (error) {
            showSnackbar('Ping 테스트 실패!', 'error');
        } finally {
            setPingLoading({ ...pingLoading,
                [deviceId]: false });
        }
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
                🖥️ 장비 관리
            </Typography>

            {/* 필터 & 등록 버튼 */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    <Box mb={2}>
                        <Grid container spacing={2}
                              alignItems="flex-end">
                            {/* 고객사 필터 */}
                            <Grid item xs={12} sm={5}>
                                <FormControl fullWidth size="small">
                                    {/* label 대신 Typography 로 위에 표시 */}
                                    <Typography variant="body2"
                                                color="text.secondary" mb={0.5}>
                                        고객사 필터
                                    </Typography>
                                    <Select
                                        value={filterCustomer}
                                        displayEmpty
                                        onChange={(e) =>
                                            setFilterCustomer(e.target.value)}>
                                        <MenuItem value="">전체</MenuItem>
                                        {customers.map(c => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.companyName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* 상태 필터 */}
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="body2"
                                                color="text.secondary" mb={0.5}>
                                        상태 필터
                                    </Typography>
                                    <Select
                                        value={filterStatus}
                                        displayEmpty
                                        onChange={(e) =>
                                            setFilterStatus(e.target.value)}>
                                        <MenuItem value="">전체</MenuItem>
                                        <MenuItem value="NORMAL">정상</MenuItem>
                                        <MenuItem value="WARNING">경고</MenuItem>
                                        <MenuItem value="ERROR">장애</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* 버튼 */}
                            <Grid item xs={12} sm={3}>
                                <Box display="flex"
                                     gap={2}
                                     justifyContent="flex-end"
                                     alignItems="flex-end"
                                     height="100%">
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={fetchDevices} sx={{mr: 2}}>
                                        새로고침
                                    </Button>

                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenCreate}>
                                        장비 등록
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>

            {/* 장비 테이블 */}
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {filteredDevices.length}개
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
                                            <b>유형</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>IP주소</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>제조사</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>위치</b>
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
                                    {filteredDevices.length
                                    === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                align="center"
                                                sx={{ py: 5 }}>
                                                등록된 장비가
                                                없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDevices.map(
                                            (device, index) => (
                                                <TableRow
                                                    key={device.id}
                                                    hover>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {device.customer
                                                            ?.companyName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            fontWeight="bold">
                                                            {device.deviceName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getDeviceTypeLabel(
                                                            device.deviceType)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {device.ipAddress}
                                                    </TableCell>
                                                    <TableCell>
                                                        {device.manufacturer}
                                                    </TableCell>
                                                    <TableCell>
                                                        {device.location}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(
                                                            device.status)}
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        {/* Ping 버튼 */}
                                                        <Tooltip
                                                            title="Ping 테스트">
                                                            <IconButton
                                                                color="info"
                                                                size="small"
                                                                onClick={() =>
                                                                    handlePing(
                                                                        device.id)}
                                                                disabled={
                                                                    pingLoading[
                                                                        device.id]}>
                                                                {pingLoading[
                                                                    device.id] ? (
                                                                    <CircularProgress
                                                                        size={16} />
                                                                ) : (
                                                                    <WifiIcon />
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>
                                                        {/* 수정 버튼 */}
                                                        <Tooltip
                                                            title="수정">
                                                            <IconButton
                                                                color="primary"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleOpenEdit(
                                                                        device)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {/* 삭제 버튼 */}
                                                        <Tooltip
                                                            title="삭제">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleDeleteConfirm(
                                                                        device.id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
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

            {/* 등록/수정 팝업 */}
            <Dialog open={openDialog}
                    onClose={handleCloseDialog}
                    maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editMode ? '장비 수정' : '장비 등록'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>

                        {/* 고객사 선택 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                고객사 *
                            </Typography>
                            <FormControl fullWidth>
                                <Select
                                    name="customerId"
                                    value={form.customer.id}
                                    displayEmpty
                                    onChange={handleChange}
                                    renderValue={(value) => {
                                        if (!value) {
                                            return '고객사를 선택하세요';  // ← 한줄로!
                                        }
                                        const found = customers.find(
                                            c => c.id === value);
                                        return found ? found.companyName : '';
                                    }}>
                                    {customers.map(c => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.companyName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 장비명 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                장비명 *
                            </Typography>
                            <TextField
                                fullWidth
                                name="deviceName"
                                value={form.deviceName}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* 장비유형 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                장비유형
                            </Typography>
                            <FormControl fullWidth>
                                <Select
                                    name="deviceType"
                                    value={form.deviceType}
                                    onChange={handleChange}>
                                    {deviceTypes.map(t => (
                                        <MenuItem
                                            key={t.value}
                                            value={t.value}>
                                            {t.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* IP주소 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                IP주소 *
                            </Typography>
                            <TextField
                                fullWidth
                                name="ipAddress"
                                value={form.ipAddress}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* 제조사 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                제조사
                            </Typography>
                            <TextField
                                fullWidth
                                name="manufacturer"
                                value={form.manufacturer}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* 모델명 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                모델명
                            </Typography>
                            <TextField
                                fullWidth
                                name="modelName"
                                value={form.modelName}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* 설치위치 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                설치위치
                            </Typography>
                            <TextField
                                fullWidth
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* SNMP Community */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                SNMP Community
                            </Typography>
                            <TextField
                                fullWidth
                                name="snmpCommunity"
                                value={form.snmpCommunity}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* SNMP Port */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary" mb={0.5}>
                                SNMP Port
                            </Typography>
                            <TextField
                                fullWidth
                                name="snmpPort"
                                type="number"
                                value={form.snmpPort}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDialog}>
                        취소
                    </Button>
                    <Button variant="contained"
                            onClick={handleSave}>
                        {editMode ? '수정' : '등록'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 삭제 확인 팝업 */}
            <Dialog open={deleteConfirm}
                    onClose={() =>
                        setDeleteConfirm(false)}>
                <DialogTitle>장비 삭제</DialogTitle>
                <DialogContent>
                    <Typography>
                        정말 삭제하시겠습니까?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() =>
                        setDeleteConfirm(false)}>
                        취소
                    </Button>
                    <Button variant="contained"
                            color="error"
                            onClick={handleDelete}>
                        삭제
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

export default DevicePage;