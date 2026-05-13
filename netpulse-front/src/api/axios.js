import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 요청 인터셉터
instance.interceptors.request.use(
    config => {
        console.log('API 요청:', config.url);
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
instance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        console.error('API 오류:', error);
        return Promise.reject(error);
    }
);

export default instance;