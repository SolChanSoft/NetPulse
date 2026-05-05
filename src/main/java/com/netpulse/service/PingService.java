package com.netpulse.service;

import com.netpulse.entity.Device;
import com.netpulse.entity.Device.DeviceStatus;
import com.netpulse.entity.MonitoringLog;
import com.netpulse.entity.IncidentLog;
import com.netpulse.repository.MonitoringLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.net.InetAddress;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PingService {

    private final MonitoringLogRepository
            monitoringLogRepository;
    private final DeviceService deviceService;
    private final IncidentLogService incidentLogService;

    // ─────────────────────────────────────────
    // 단순 Ping 체크
    // ─────────────────────────────────────────
    public boolean pingCheck(String ipAddress) {
        try {
            InetAddress address =
                    InetAddress.getByName(ipAddress);
            boolean reachable =
                    address.isReachable(3000); // 3초 타임아웃
            log.info("Ping 체크 - IP: {} 결과: {}",
                    ipAddress, reachable ? "성공" : "실패");
            return reachable;
        } catch (Exception e) {
            log.error("Ping 오류 - IP: {} - {}",
                    ipAddress, e.getMessage());
            return false;
        }
    }

    // ─────────────────────────────────────────
    // 장비 Ping 체크 및 상태 업데이트
    // ─────────────────────────────────────────
    @Transactional
    public MonitoringLog pingDevice(Device device) {
        String ip = device.getIpAddress();
        log.info("Ping 모니터링 시작: {} ({})",
                device.getDeviceName(), ip);

        boolean pingResult = pingCheck(ip);

        // 모니터링 로그 저장
        MonitoringLog monitoringLog = MonitoringLog
                .builder()
                .device(device)
                .pingStatus(pingResult)
                .collectedAt(LocalDateTime.now())
                .build();

        monitoringLogRepository.save(monitoringLog);

        // 장비 상태 업데이트
        if (pingResult) {
            deviceService.updateDeviceStatus(
                    device.getId(), DeviceStatus.NORMAL);
            log.info("Ping 성공 - 장비 정상: {}",
                    device.getDeviceName());
        } else {
            deviceService.updateDeviceStatus(
                    device.getId(), DeviceStatus.ERROR);
            log.warn("Ping 실패 - 장비 장애: {}",
                    device.getDeviceName());

            IncidentLog incident = IncidentLog.builder()
                    .device(device)
                    .description("Ping 실패")
                    .build();

            incidentLogService.createIncident(incident);
        }

        return monitoringLog;
    }

    // ─────────────────────────────────────────
    // 전체 장비 Ping 체크
    // ─────────────────────────────────────────
    @Transactional
    public void pingAllDevices(List<Device> devices) {
        log.info("=== 전체 장비 Ping 체크 시작 ===");
        for (Device device : devices) {
            try {
                pingDevice(device);
            } catch (Exception e) {
                log.error("Ping 오류 - 장비: {} - {}",
                        device.getDeviceName(),
                        e.getMessage());
            }
        }
        log.info("=== 전체 장비 Ping 체크 완료 ===");
    }
}