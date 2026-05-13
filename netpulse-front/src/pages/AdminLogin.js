import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography,
    TextField, Button, Alert,
    CircularProgress
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import axios from '../api/axios';

function AdminLogin({ onLogin }) {
    const [form, setForm] = useState({
        username: '',
        password: ''
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
        if (!form.username.trim()) {
            setError('아이디를 입력해 주세요!');
            return;
        }
        if (!form.password.trim()) {
            setError('비밀번호를 입력해 주세요!');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(
                '/api/admin/login', form);

            if (res.data.success) {
                localStorage.setItem(
                    'adminUser',
                    JSON.stringify(res.data));
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
                            <LockIcon sx={{
                                fontSize: 40,
                                color: '#1976d2' }} />
                        </Box>
                        <Typography variant="h5"
                                    fontWeight="bold"
                                    color="primary">
                            🌐 NetPulse
                        </Typography>
                        <Typography variant="body2"
                                    color="text.secondary">
                            관리자 로그인
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
                            아이디
                        </Typography>
                        <TextField
                            fullWidth
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="아이디 입력"
                            size="small"
                        />
                    </Box>

                    <Box mb={3}>
                        <Typography variant="body2"
                                    color="text.secondary"
                                    mb={0.5}>
                            비밀번호
                        </Typography>
                        <TextField
                            fullWidth
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="비밀번호 입력"
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
                                size={24}
                                color="inherit" />
                            : '로그인'}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}

export default AdminLogin;