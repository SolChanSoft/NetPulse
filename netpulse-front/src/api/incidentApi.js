import axios from './axios';

const IncidentApi = {
    // 전체 조회
    getAll: () =>
        axios.get('/api/incidents'),

    // 장비별 조회
    getByDevice: (deviceId) =>
        axios.get(`/api/incidents/device/${deviceId}`),

    // 미해결 조회
    getOpen: () =>
        axios.get('/api/incidents/open'),

    // 등록
    create: (data) =>
        axios.post('/api/incidents', data),

    // 해결 처리
    resolve: (id, resolution) =>
        axios.patch(
            `/api/incidents/${id}/resolve?resolution=${resolution}`),

    // 고객사별 조회
    getByCustomer: (customerId) =>
        axios.get(`/api/incidents/customer/${customerId}`)
};

export default IncidentApi;