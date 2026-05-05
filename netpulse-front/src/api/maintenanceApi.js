import axios from './axios';

const MaintenanceApi = {
    getAll: () =>
        axios.get('/api/maintenance'),

    getByDevice: (deviceId) =>
        axios.get(`/api/maintenance/device/${deviceId}`),

    getByCustomer: (customerId) =>
        axios.get(`/api/maintenance/customer/${customerId}`),

    getByPeriod: (start, end) =>
        axios.get('/api/maintenance/period', {
            params: { start, end }
        }),

    create: (data) =>
        axios.post('/api/maintenance', data),

    update: (id, data) =>
        axios.put(`/api/maintenance/${id}`, data),

    delete: (id) =>
        axios.delete(`/api/maintenance/${id}`)
};

export default MaintenanceApi;