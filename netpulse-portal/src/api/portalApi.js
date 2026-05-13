import axios from './portalAxios';

const PortalApi = {
    // 로그인
    login: (companyName, phone) =>
        axios.post('/api/portal/login', {
            companyName,
            phone
        }),

    // 대시보드 데이터
    getDashboard: (customerId) =>
        axios.get(`/api/portal/dashboard/${customerId}`),

    // 장비 목록
    getDevices: (customerId) =>
        axios.get(`/api/devices/customer/${customerId}`),

    // 카메라 목록
    getCameras: (customerId) =>
        axios.get(`/api/cameras/customer/${customerId}`),

    // 장애 이력
    getIncidents: (customerId) =>
        axios.get(`/api/incidents/customer/${customerId}`),

    // 유지보수 이력
    getMaintenance: (customerId) =>
        axios.get(
            `/api/maintenance/customer/${customerId}`)
};

export default PortalApi;
