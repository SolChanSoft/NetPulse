import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography,
    TextField, Button, Alert,
    CircularProgress
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PortalApi from '../api/portalApi';

function PortalLogin({ onLogin }) {
    const [form, setForm] = useState({
        companyName: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async () => {
        if (!form.companyName.trim()) {
            setError('회사명을 입력해 주세요!');
            return;
        }
        if (!form.phone.trim()) {
            setError('연락처를 입력해 주세요!');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await PortalApi.login(
                form.companyName, form.phone);

            if (res.data.success) {
                onLogin(res.data);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            sx={{ backgroundColor: '#f0f4f8' }}>
            <Card elevation={4}
                  sx={{ width: 400, borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    {/* 로고 */}
                    <Box display="flex"
                         flexDirection="column"
                         alignItems="center" mb={4}>
                        <Box sx={{
                            p: 2,
                            borderRadius: '50%',
                            backgroundColor: '#e3f2fd',
                            mb: 2 }}>
                            <LockIcon
                                sx={{ fontSize: 40,
                                    color: '#1565c0' }} />
                        </Box>
                        <Typography variant="h5"
                                    fontWeight="bold"
                                    color="primary">
                            NetPulse
                        </Typography>
                        <Typography variant="body2"
                                    color="text.secondary">
                            고객사 포털 로그인
                        </Typography>
                    </Box>

                    {/* 오류 메시지 */}
                    {error && (
                        <Alert severity="error"
                               sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* 로그인 폼 */}
                    <Box mb={2}>
                        <Typography variant="body2"
                                    color="text.secondary"
                                    mb={0.5}>
                            회사명
                        </Typography>
                        <TextField
                            fullWidth
                            name="companyName"
                            value={form.companyName}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="회사명을 입력해 주세요"
                            size="small"
                        />
                    </Box>

                    <Box mb={3}>
                        <Typography variant="body2"
                                    color="text.secondary"
                                    mb={0.5}>
                            연락처
                        </Typography>
                        <TextField
                            fullWidth
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="010-0000-0000"
                            size="small"
                        />
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleLogin}
                        disabled={loading}
                        sx={{ borderRadius: 2 }}>
                        {loading
                            ? <CircularProgress
                                size={24} color="inherit" />
                            : '로그인'}
                    </Button>

                    <Typography variant="caption"
                                color="text.secondary"
                                display="block"
                                textAlign="center"
                                mt={2}>
                        로그인 문의: NetPulse 관리자
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default PortalLogin;