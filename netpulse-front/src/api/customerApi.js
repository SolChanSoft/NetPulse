import axios from './axios';

const CustomerApi = {
    // 전체 조회
    getAll: () =>
        axios.get('/api/customers'),

    // 단건 조회
    getById: (id) =>
        axios.get(`/api/customers/${id}`),

    // 등록
    create: (data) =>
        axios.post('/api/customers', data),

    // 수정
    update: (id, data) =>
        axios.put(`/api/customers/${id}`, data),

    // 삭제
    delete: (id) =>
        axios.delete(`/api/customers/${id}`),

    // 검색
    search: (keyword) =>
        axios.get(`/api/customers/search?keyword=${keyword}`),

    // 계약만료 임박
    getExpiring: () =>
        axios.get('/api/customers/expiring')
};

export default CustomerApi;
