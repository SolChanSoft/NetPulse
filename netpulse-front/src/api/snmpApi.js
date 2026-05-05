import axios from './axios';

const SnmpApi = {
    // Ping 체크
    ping: (deviceId) =>
        axios.get(`/api/snmp/ping/${deviceId}`),

    // 모니터링 수집
    collect: (deviceId) =>
        axios.post(`/api/snmp/collect/${deviceId}`),

    // SNMP 값 조회
    getValue: (ip, community, port, oid) =>
        axios.get('/api/snmp/get', {
            params: { ip, community, port, oid }
        })
};

export default SnmpApi;