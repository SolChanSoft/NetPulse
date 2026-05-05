import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Card,
    CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid,
    MenuItem, Select, FormControl,
    CircularProgress, Snackbar, Alert,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import MaintenanceApi from '../api/maintenanceApi';
import DeviceApi from '../api/deviceApi';
import CustomerApi from '../api/customerApi';

// 초기 폼 데이터
const initForm = {
    device: { id: '' },
    workDate: '',
    worker: '',
    workContent: '',
    result: ''
};

function MaintenancePage() {
    const [maintenances, setMaintenances] = useState([]);
    const [devices, setDevices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCustomer, setFilterCustomer] =
        useState('');
    const [filterDevice, setFilterDevice] =
        useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [openDialog, setOpenDialog] =
        useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [form, setForm] = useState(initForm);
    const [deleteConfirm, setDeleteConfirm] =
        useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchMaintenances();
        fetchDevices();
        fetchCustomers();
    }, []);

    // 유지보수 전체 조회
    const fetchMaintenances = async () => {
        try {
            setLoading(true);
            const res = await MaintenanceApi.getAll();
            setMaintenances(res.data);
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

    // 고객사 목록 조회
    const fetchCustomers = async () => {
        try {
            const res = await CustomerApi.getAll();
            setCustomers(res.data);
        } catch (error) {
            console.error('고객사 조회 실패:', error);
        }
    };

    // 기간별 검색
    const handleSearchByPeriod = async () => {
        if (!startDate || !endDate) {
            showSnackbar(
                '시작일과 종료일을 선택해 주세요!',
                'warning');
            return;
        }
        try {
            setLoading(true);
            const res = await MaintenanceApi
                .getByPeriod(startDate, endDate);
            setMaintenances(res.data);
        } catch (error) {
            showSnackbar('검색 실패!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 필터링된 유지보수 목록
    const filteredMaintenances = maintenances.filter(
        m => {
            const customerMatch = filterCustomer
                ? m.device?.customer?.id ===
                parseInt(filterCustomer)
                : true;
            const deviceMatch = filterDevice
                ? m.device?.id ===
                parseInt(filterDevice)
                : true;
            return customerMatch && deviceMatch;
        }
    );

    // 고객사 선택 시 해당 장비만 필터링
    const filteredDevices = filterCustomer
        ? devices.filter(d =>
            d.customer?.id ===
            parseInt(filterCustomer))
        : devices;

    // 등록 팝업 열기
    const handleOpenCreate = () => {
        setForm(initForm);
        setEditMode(false);
        setSelectedId(null);
        setOpenDialog(true);
    };

    // 수정 팝업 열기
    const handleOpenEdit = (maintenance) => {
        setForm({
            device: {
                id: maintenance.device?.id || ''
            },
            workDate: maintenance.workDate || '',
            worker: maintenance.worker || '',
            workContent: maintenance.workContent || '',
            result: maintenance.result || ''
        });
        setEditMode(true);
        setSelectedId(maintenance.id);
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
        if (name === 'deviceId') {
            setForm({
                ...form,
                device: { id: value }
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    // 등록 / 수정 저장
    const handleSave = async () => {
        if (!form.device.id) {
            showSnackbar(
                '장비를 선택해 주세요!', 'warning');
            return;
        }
        if (!form.workDate) {
            showSnackbar(
                '작업일을 입력해 주세요!', 'warning');
            return;
        }
        if (!form.worker.trim()) {
            showSnackbar(
                '작업자를 입력해 주세요!', 'warning');
            return;
        }
        if (!form.workContent.trim()) {
            showSnackbar(
                '작업내용을 입력해 주세요!', 'warning');
            return;
        }
        try {
            if (editMode) {
                await MaintenanceApi.update(
                    selectedId, form);
                showSnackbar(
                    '유지보수 수정 완료!', 'success');
            } else {
                await MaintenanceApi.create(form);
                showSnackbar(
                    '유지보수 등록 완료!', 'success');
            }
            handleCloseDialog();
            fetchMaintenances();
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
            await MaintenanceApi.delete(deleteId);
            showSnackbar(
                '유지보수 삭제 완료!', 'success');
            setDeleteConfirm(false);
            fetchMaintenances();
        } catch (error) {
            showSnackbar('삭제 실패!', 'error');
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
                🔧 유지보수 이력
            </Typography>

            {/* 필터 & 버튼 */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}
                          alignItems="flex-end">

                        {/* 고객사 필터 */}
                        <Grid item xs={12} sm={3}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                고객사 필터
                            </Typography>
                            <FormControl
                                fullWidth size="small">
                                <Select
                                    value={filterCustomer}
                                    displayEmpty
                                    onChange={(e) => {
                                        setFilterCustomer(
                                            e.target.value);
                                        setFilterDevice('');
                                    }}>
                                    <MenuItem value="">
                                        전체
                                    </MenuItem>
                                    {customers.map(c => (
                                        <MenuItem
                                            key={c.id}
                                            value={c.id}>
                                            {c.companyName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 장비 필터 */}
                        <Grid item xs={12} sm={3}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                장비 필터
                            </Typography>
                            <FormControl
                                fullWidth size="small">
                                <Select
                                    value={filterDevice}
                                    displayEmpty
                                    onChange={(e) =>
                                        setFilterDevice(
                                            e.target.value)}>
                                    <MenuItem value="">
                                        전체
                                    </MenuItem>
                                    {filteredDevices.map(
                                        d => (
                                            <MenuItem
                                                key={d.id}
                                                value={d.id}>
                                                {d.deviceName}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 기간 검색 */}
                        <Grid item xs={12} sm={2}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                시작일
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                value={startDate}
                                onChange={(e) =>
                                    setStartDate(
                                        e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                종료일
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                value={endDate}
                                onChange={(e) =>
                                    setEndDate(
                                        e.target.value)}
                            />
                        </Grid>

                        {/* 버튼 */}
                        <Grid item xs={12} sm={2}>
                            <Box display="flex"
                                 flexDirection="column"
                                 gap={1}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={
                                        <SearchIcon />}
                                    onClick={
                                        handleSearchByPeriod}>
                                    기간검색
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={
                                        <RefreshIcon />}
                                    onClick={
                                        fetchMaintenances}>
                                    새로고침
                                </Button>
                            </Box>
                        </Grid>

                        {/* 등록 버튼 */}
                        <Grid item xs={12}>
                            <Box display="flex"
                                 justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={
                                        handleOpenCreate}>
                                    유지보수 등록
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 유지보수 테이블 */}
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {filteredMaintenances.length}건
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
                                        <TableCell
                                            align="center">
                                            <b>관리</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredMaintenances
                                        .length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                align="center"
                                                sx={{ py: 5 }}>
                                                유지보수 이력이
                                                없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredMaintenances
                                            .map((m, index) => (
                                                <TableRow
                                                    key={m.id}
                                                    hover>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.device
                                                                ?.customer
                                                                ?.companyName
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            fontWeight="bold">
                                                            {m.device
                                                                    ?.deviceName
                                                                || '-'}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary">
                                                            {m.device
                                                                    ?.ipAddress
                                                                || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.workDate
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.worker
                                                            || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                maxWidth: 200,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                            {m.workContent
                                                                || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                maxWidth: 200,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                            {m.result
                                                                || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <Tooltip
                                                            title="수정">
                                                            <IconButton
                                                                color="primary"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleOpenEdit(m)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip
                                                            title="삭제">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleDeleteConfirm(
                                                                        m.id)}>
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
                    {editMode
                        ? '🔧 유지보수 수정'
                        : '🔧 유지보수 등록'}
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
                                    name="deviceId"
                                    value={form.device.id}
                                    displayEmpty
                                    onChange={handleChange}
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
                                                ({d.customer
                                                ?.companyName})
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 작업일 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                작업일 *
                            </Typography>
                            <TextField
                                fullWidth
                                type="date"
                                name="workDate"
                                value={form.workDate}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* 작업자 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                작업자 *
                            </Typography>
                            <TextField
                                fullWidth
                                name="worker"
                                value={form.worker}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* 작업내용 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                작업내용 *
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                name="workContent"
                                placeholder=
                                    "작업 내용을 입력해 주세요..."
                                value={form.workContent}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* 작업결과 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                작업결과
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                name="result"
                                placeholder=
                                    "작업 결과를 입력해 주세요..."
                                value={form.result}
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
                <DialogTitle>
                    유지보수 삭제
                </DialogTitle>
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

export default MaintenancePage;