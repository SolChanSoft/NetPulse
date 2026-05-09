import axios from './axios';

const ReportApi = {
    // 월간 리포트 다운로드
    downloadMonthly: (customerId, year, month) =>
        axios.get(
            `/api/reports/monthly/${customerId}`,
            {
                params: { year, month },
                responseType: 'blob'
            }
        )
};

export default ReportApi;