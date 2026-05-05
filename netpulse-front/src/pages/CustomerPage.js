import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Card,
    CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid,
    InputAdornment, CircularProgress,
    Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CustomerApi from '../api/customerApi';

// 초기 폼 데이터
const initForm = {
    companyName: '',
    managerName: '',
    phone: '',
    address: '',
    email: '',
    contractExpiry: ''
};

function CustomerPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [form, setForm] = useState(initForm);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    // 고객사 전체 조회
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await CustomerApi.getAll();
            setCustomers(res.data);
        } catch (error) {
            showSnackbar('데이터 조회 실패!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 검색
    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            fetchCustomers();
            return;
        }
        try {
            const res = await CustomerApi.search(
                searchKeyword);
            setCustomers(res.data);
        } catch (error) {
            showSnackbar('검색 실패!', 'error');
        }
    };

    // 엔터키 검색
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // 등록 팝업 열기
    const handleOpenCreate = () => {
        setForm(initForm);
        setEditMode(false);
        setSelectedId(null);
        setOpenDialog(true);
    };

    // 수정 팝업 열기
    const handleOpenEdit = (customer) => {
        setForm({
            companyName: customer.companyName || '',
            managerName: customer.managerName || '',
            phone: customer.phone || '',
            address: customer.address || '',
            email: customer.email || '',
            contractExpiry: customer.contractExpiry || ''
        });
        setEditMode(true);
        setSelectedId(customer.id);
        setOpenDialog(true);
    };

    // 팝업 닫기
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setForm(initForm);
    };

    // 폼 입력
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // 등록 / 수정 저장
    const handleSave = async () => {
        if (!form.companyName.trim()) {
            showSnackbar('회사명을 입력해 주세요!', 'warning');
            return;
        }
        try {
            if (editMode) {
                await CustomerApi.update(selectedId, form);
                showSnackbar('고객사 수정 완료!', 'success');
            } else {
                await CustomerApi.create(form);
                showSnackbar('고객사 등록 완료!', 'success');
            }
            handleCloseDialog();
            fetchCustomers();
        } catch (error) {
            showSnackbar('저장 실패!', 'error');
        }
    };

    // 삭제 확인 팝업
    const handleDeleteConfirm = (id) => {
        setDeleteId(id);
        setDeleteConfirm(true);
    };

    // 삭제 실행
    const handleDelete = async () => {
        try {
            await CustomerApi.delete(deleteId);
            showSnackbar('고객사 삭제 완료!', 'success');
            setDeleteConfirm(false);
            fetchCustomers();
        } catch (error) {
            showSnackbar('삭제 실패!', 'error');
        }
    };

    // 스낵바 표시
    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    // 계약만료 상태 확인
    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return null;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = Math.ceil(
            (expiry - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return <Chip label="만료"
                         color="error" size="small" />;
        } else if (diffDays <= 30) {
            return <Chip
                label={`D-${diffDays}`}
                color="warning" size="small" />;
        }
        return <Chip label="정상"
                     color="success" size="small" />;
    };

    return (
        <Box>
            {/* 페이지 제목 */}
            <Typography variant="h5"
                        fontWeight="bold" mb={3}>
                👥 고객사 관리
            </Typography>

            {/* 검색 & 등록 버튼 */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    {/* 검색창 */}
                    <Box mb={1}>
                        <TextField
                            size="small"
                            placeholder="회사명 검색..."
                            value={searchKeyword}
                            onChange={(e) =>
                                setSearchKeyword(
                                    e.target.value)}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment
                                        position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ width: 300 }}
                        />
                        <Box display="flex" gap={1}>
                            <Button
                                variant="outlined"
                                onClick={handleSearch}>
                                검색
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSearchKeyword('');
                                    fetchCustomers();
                                }}>
                                전체
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreate}>
                                고객사 등록
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 고객사 테이블 */}
            <Card elevation={2}>
                <CardContent>
                    <Typography variant="body2"
                                color="text.secondary" mb={2}>
                        전체 {customers.length}개
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
                                    <TableRow
                                        sx={{ backgroundColor:
                                                '#f5f5f5' }}>
                                        <TableCell>
                                            <b>No</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>회사명</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>담당자</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>연락처</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>이메일</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>계약만료일</b>
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
                                    {customers.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                align="center"
                                                sx={{ py: 5 }}>
                                                등록된 고객사가
                                                없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        customers.map(
                                            (customer, index) => (
                                                <TableRow
                                                    key={customer.id}
                                                    hover>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            fontWeight="bold">
                                                            {customer.companyName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.managerName}
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.phone}
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.contractExpiry}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getExpiryStatus(
                                                            customer.contractExpiry)}
                                                    </TableCell>
                                                    <TableCell
                                                        align="center">
                                                        <IconButton
                                                            color="primary"
                                                            size="small"
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    customer)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() =>
                                                                handleDeleteConfirm(
                                                                    customer.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
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
                    {editMode ? '고객사 수정' : '고객사 등록'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="회사명 *"
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="담당자명"
                                name="managerName"
                                value={form.managerName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="연락처"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="주소"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="이메일"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="계약만료일"
                                name="contractExpiry"
                                type="date"
                                value={form.contractExpiry}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    placeholder: ''
                                }}
                                sx={{
                                    '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                        cursor: 'pointer'
                                    },
                                    '& input[type="date"]': {
                                        color: form.contractExpiry
                                            ? 'inherit' : 'transparent'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
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
                    onClose={() => setDeleteConfirm(false)}>
                <DialogTitle>고객사 삭제</DialogTitle>
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

export default CustomerPage;