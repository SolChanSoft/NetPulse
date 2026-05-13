import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://www.netpulse.co.kr',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.interceptors.request.use(
    config => {
        console.log('포털 API 요청:', config.url);
        return config;
    },
    error => Promise.reject(error)
);

instance.interceptors.response.use(
    response => response,
    error => {
        console.error('포털 API 오류:', error);
        return Promise.reject(error);
    }
);

export default instance;