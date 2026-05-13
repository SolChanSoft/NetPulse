package com.netpulse.service;

import com.netpulse.entity.Device;
import com.netpulse.entity.Device.DeviceStatus;
import com.netpulse.entity.MonitoringLog;
import com.netpulse.entity.IncidentLog;
import com.netpulse.repository.MonitoringLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.snmp4j.event.ResponseEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.net.InetAddress;
import java.time.LocalDateTime;
import java.util.List;

import org.snmp4j.*;
import org.snmp4j.mp.SnmpConstants;
import org.snmp4j.smi.*;
import org.snmp4j.transport.DefaultUdpTransportMapping;
import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PingService {

    private final MonitoringLogRepository
            monitoringLogRepository;
    private final DeviceService deviceService;
    private final IncidentLogService incidentLogService;

    private static final String
            OID_SYS_NAME = "1.3.6.1.2.1.1.5.0";

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

    public boolean pingDevice(String ipAddress,
                              String community,
                              int port) {
        Snmp snmp = null;

        try {
            TransportMapping<?> transport =
                    new DefaultUdpTransportMapping();
            transport.listen();

            snmp = new Snmp(transport);

            CommunityTarget target = new CommunityTarget();
            target.setCommunity(
                    new OctetString(community));
            target.setAddress(
                    GenericAddress.parse(
                            "udp:" + ipAddress + "/" + port));
            target.setVersion(SnmpConstants.version2c);
            target.setTimeout(3000);
            target.setRetries(2);

            PDU pdu = new PDU();
            pdu.add(new VariableBinding(
                    new OID(OID_SYS_NAME)));
            pdu.setType(PDU.GET);

            ResponseEvent<?> response =
                    snmp.send(pdu, target);

            if (response != null &&
                    response.getResponse() != null) {
                log.info("SNMP Ping 성공: {}", ipAddress);
                return true;
            } else {
                log.warn("SNMP Ping 실패: {}", ipAddress);
                return false;
            }

        } catch (IOException e) {
            log.error("SNMP Ping 오류: {} - {}",
                    ipAddress, e.getMessage());
            return false;
        } finally {
            if (snmp != null) {
                try {
                    snmp.close();
                } catch (IOException e) {
                    log.warn("SNMP 리소스 종료 실패: {} - {}",
                            ipAddress, e.getMessage());
                }
            }
        }
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