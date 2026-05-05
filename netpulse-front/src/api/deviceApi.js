import axios from './axios';

const DeviceApi = {
    // 전체 조회
    getAll: () =>
        axios.get('/api/devices'),

    // 단건 조회
    getById: (id) =>
        axios.get(`/api/devices/${id}`),

    // 고객사별 조회
    getByCustomer: (customerId) =>
        axios.get(`/api/devices/customer/${customerId}`),

    // 등록
    create: (data) =>
        axios.post('/api/devices', data),

    // 수정
    update: (id, data) =>
        axios.put(`/api/devices/${id}`, data),

    // 삭제
    delete: (id) =>
        axios.delete(`/api/devices/${id}`),

    // 장애 장비 조회
    getErrorDevices: () =>
        axios.get('/api/devices/error'),

    // 정상 장비 조회
    getNormalDevices: () =>
        axios.get('/api/devices/normal'),

    // 상태 변경
    updateStatus: (id, status) =>
        axios.patch(
            `/api/devices/${id}/status?status=${status}`)
};

export default DeviceApi;