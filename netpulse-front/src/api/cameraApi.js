import axios from './axios';

const CameraApi = {
    getAll: () =>
        axios.get('/api/cameras'),

    getById: (id) =>
        axios.get(`/api/cameras/${id}`),

    getByCustomer: (customerId) =>
        axios.get(`/api/cameras/customer/${customerId}`),

    create: (data) =>
        axios.post('/api/cameras', data),

    update: (id, data) =>
        axios.put(`/api/cameras/${id}`, data),

    delete: (id) =>
        axios.delete(`/api/cameras/${id}`),

    checkCamera: (id) =>
        axios.post(`/api/cameras/${id}/check`),

    checkAll: () =>
        axios.post('/api/cameras/check/all'),

    getErrorCameras: () =>
        axios.get('/api/cameras/error')
};

export default CameraApi;