import axios from './axios';

const PingApi = {
    // IP 직접 Ping 체크
    checkIp: (ip) =>
        axios.get(`/api/ping/check?ip=${ip}`),

    // 장비 ID 로 Ping 체크
    pingDevice: (deviceId) =>
        axios.get(`/api/ping/device/${deviceId}`),

    // 전체 장비 Ping 체크
    pingAll: () =>
        axios.post('/api/ping/all')
};

export default PingApi;