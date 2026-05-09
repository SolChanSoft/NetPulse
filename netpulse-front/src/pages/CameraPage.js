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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideocamIcon from '@mui/icons-material/Videocam';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from
        '@mui/icons-material/CheckCircle';
import CameraApi from '../api/cameraApi';
import CustomerApi from '../api/customerApi';

// 초기 폼 데이터
const initForm = {
    cameraName: '',
    ipAddress: '',
    port: 80,
    username: '',
    password: '',
    rtspUrl: '',
    location: '',
    manufacturer: '',
    modelName: '',
    customer: { id: '' }
};

// 카메라 상태 표시
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

function CameraPage() {
    const [cameras, setCameras] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCustomer, setFilterCustomer] =
        useState('');
    const [openDialog, setOpenDialog] =
        useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [form, setForm] = useState(initForm);
    const [deleteConfirm, setDeleteConfirm] =
        useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [checkLoading, setCheckLoading] =
        useState({});
    const [checkAllLoading, setCheckAllLoading] =
        useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchCameras();
        fetchCustomers();
    }, []);

    // 카메라 전체 조회
    const fetchCameras = async () => {
        try {
            setLoading(true);
            const res = await CameraApi.getAll();
            setCameras(res.data);
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

    // 필터링된 카메라 목록
    const filteredCameras = cameras.filter(camera => {
        return filterCustomer
            ? camera.customer?.id ===
            parseInt(filterCustomer)
            : true;
    });

    // 등록 팝업 열기
    const handleOpenCreate = () => {
        setForm(initForm);
        setEditMode(false);
        setSelectedId(null);
        setOpenDialog(true);
    };

    // 수정 팝업 열기
    const handleOpenEdit = (camera) => {
        setForm({
            cameraName: camera.cameraName || '',
            ipAddress: camera.ipAddress || '',
            port: camera.port || 80,
            username: camera.username || '',
            password: camera.password || '',
            rtspUrl: camera.rtspUrl || '',
            location: camera.location || '',
            manufacturer: camera.manufacturer || '',
            modelName: camera.modelName || '',
            customer: { id: camera.customer?.id || '' }
        });
        setEditMode(true);
        setSelectedId(camera.id);
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
        if (!form.cameraName.trim()) {
            showSnackbar(
                '카메라명을 입력해 주세요!', 'warning');
            return;
        }
        if (!form.customer.id) {
            showSnackbar(
                '고객사를 선택해 주세요!', 'warning');
            return;
        }
        if (!form.ipAddress.trim()) {
            showSnackbar(
                'IP주소를 입력해 주세요!', 'warning');
            return;
        }
        try {
            if (editMode) {
                await CameraApi.update(selectedId, form);
                showSnackbar(
                    '카메라 수정 완료!', 'success');
            } else {
                await CameraApi.create(form);
                showSnackbar(
                    '카메라 등록 완료!', 'success');
            }
            handleCloseDialog();
            fetchCameras();
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
            await CameraApi.delete(deleteId);
            showSnackbar(
                '카메라 삭제 완료!', 'success');
            setDeleteConfirm(false);
            fetchCameras();
        } catch (error) {
            showSnackbar('삭제 실패!', 'error');
        }
    };

    // 카메라 상태 체크
    const handleCheck = async (id) => {
        setCheckLoading({
            ...checkLoading, [id]: true });
        try {
            const res = await CameraApi.checkCamera(id);
            if (res.data.status === 'NORMAL') {
                showSnackbar(
                    '✅ 카메라 정상 응답!', 'success');
            } else {
                showSnackbar(
                    '❌ 카메라 응답 없음!', 'error');
            }
            fetchCameras();
        } catch (error) {
            showSnackbar('상태 체크 실패!', 'error');
        } finally {
            setCheckLoading({
                ...checkLoading, [id]: false });
        }
    };

    // 전체 카메라 체크
    const handleCheckAll = async () => {
        setCheckAllLoading(true);
        try {
            await CameraApi.checkAll();
            showSnackbar(
                '전체 카메라 체크 완료!', 'success');
            fetchCameras();
        } catch (error) {
            showSnackbar('전체 체크 실패!', 'error');
        } finally {
            setCheckAllLoading(false);
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
                📹 IP 카메라 관리
            </Typography>

            {/* 필터 & 버튼 */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}
                          alignItems="flex-end">

                        {/* 고객사 필터 */}
                        <Grid item xs={12} sm={4}>
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
                                    onChange={(e) =>
                                        setFilterCustomer(
                                            e.target.value)}>
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
                                    onClick={fetchCameras}>
                                    새로고침
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="info"
                                    startIcon={
                                        checkAllLoading
                                            ? <CircularProgress
                                                size={16} />
                                            : <CheckCircleIcon />}
                                    onClick={handleCheckAll}
                                    disabled={
                                        checkAllLoading}>
                                    전체 상태체크
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={
                                        handleOpenCreate}>
                                    카메라 등록
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 카메라 테이블 */}
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {filteredCameras.length}대
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
                                            <b>카메라명</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>IP주소</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>포트</b>
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
                                        <TableCell
                                            align="center">
                                            <b>관리</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCameras
                                        .length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={10}
                                                align="center"
                                                sx={{ py: 5 }}>
                                                등록된 카메라가
                                                없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCameras
                                            .map((camera,
                                                  index) => (
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
                                                        {camera
                                                                .customer
                                                                ?.companyName
                                                            || '-'}
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
                                                        {camera.port}
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
                                                            {formatDate(
                                                                camera
                                                                    .lastCheckedAt)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        {/* 상태체크 */}
                                                        <Tooltip
                                                            title="상태 체크">
                                                            <IconButton
                                                                color="info"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleCheck(
                                                                        camera.id)}
                                                                disabled={
                                                                    checkLoading[
                                                                        camera.id]}>
                                                                {checkLoading[
                                                                    camera.id]
                                                                    ? <CircularProgress
                                                                        size={16} />
                                                                    : <VideocamIcon />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        {/* 수정 */}
                                                        <Tooltip
                                                            title="수정">
                                                            <IconButton
                                                                color="primary"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleOpenEdit(
                                                                        camera)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {/* 삭제 */}
                                                        <Tooltip
                                                            title="삭제">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() =>
                                                                    handleDeleteConfirm(
                                                                        camera.id)}>
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
                        ? '📹 카메라 수정'
                        : '📹 카메라 등록'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>

                        {/* 고객사 선택 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                고객사 *
                            </Typography>
                            <FormControl fullWidth>
                                <Select
                                    name="customerId"
                                    value={form.customer.id}
                                    displayEmpty
                                    onChange={handleChange}
                                    renderValue={(value) => {
                                        if (!value) return '고객사를 선택하세요';
                                        const found =
                                            customers.find(
                                                c => c.id
                                                    === value);
                                        return found
                                            ? found.companyName
                                            : '';
                                    }}>
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

                        {/* 카메라명 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                카메라명 *
                            </Typography>
                            <TextField
                                fullWidth
                                name="cameraName"
                                value={form.cameraName}
                                onChange={handleChange}
                                placeholder="카메라명 입력"
                            />
                        </Grid>

                        {/* IP주소 */}
                        <Grid item xs={8}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                IP주소 *
                            </Typography>
                            <TextField
                                fullWidth
                                name="ipAddress"
                                value={form.ipAddress}
                                onChange={handleChange}
                                placeholder="192.168.0.100"
                            />
                        </Grid>

                        {/* 포트 */}
                        <Grid item xs={4}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                포트
                            </Typography>
                            <TextField
                                fullWidth
                                name="port"
                                type="number"
                                value={form.port}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* 아이디 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                접속 아이디
                            </Typography>
                            <TextField
                                fullWidth
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="admin"
                            />
                        </Grid>

                        {/* 비밀번호 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                접속 비밀번호
                            </Typography>
                            <TextField
                                fullWidth
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="비밀번호 입력"
                            />
                        </Grid>

                        {/* 설치위치 */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                설치위치
                            </Typography>
                            <TextField
                                fullWidth
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="1층 입구"
                            />
                        </Grid>

                        {/* 제조사 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                제조사
                            </Typography>
                            <TextField
                                fullWidth
                                name="manufacturer"
                                value={form.manufacturer}
                                onChange={handleChange}
                                placeholder="제조사 입력"
                            />
                        </Grid>

                        {/* 모델명 */}
                        <Grid item xs={6}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                모델명
                            </Typography>
                            <TextField
                                fullWidth
                                name="modelName"
                                value={form.modelName}
                                onChange={handleChange}
                                placeholder="모델명 입력"
                            />
                        </Grid>

                        {/* RTSP URL */}
                        <Grid item xs={12}>
                            <Typography variant="body2"
                                        color="text.secondary"
                                        mb={0.5}>
                                RTSP URL
                            </Typography>
                            <TextField
                                fullWidth
                                name="rtspUrl"
                                value={form.rtspUrl}
                                onChange={handleChange}
                                placeholder=
                                    "rtsp://192.168.0.100:554/stream"
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
                <DialogTitle>카메라 삭제</DialogTitle>
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

export default CameraPage;