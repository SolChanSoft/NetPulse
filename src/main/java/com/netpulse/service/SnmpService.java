package com.netpulse.service;

import com.netpulse.entity.Device;
import com.netpulse.entity.Device.DeviceStatus;
import com.netpulse.entity.MonitoringLog;
import com.netpulse.entity.IncidentLog;
import com.netpulse.repository.MonitoringLogRepository;
import com.netpulse.repository.IncidentLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.snmp4j.*;
import org.snmp4j.event.ResponseEvent;
import org.snmp4j.mp.SnmpConstants;
import org.snmp4j.smi.*;
import org.snmp4j.transport.DefaultUdpTransportMapping;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SnmpService {

    private final MonitoringLogRepository monitoringLogRepository;
    private final IncidentLogRepository incidentLogRepository;
    private final DeviceService deviceService;

    // SNMP OID 상수 정의
    private static final String OID_SYS_DESCR
            = "1.3.6.1.2.1.1.1.0";  // 시스템 설명
    private static final String OID_SYS_UPTIME
            = "1.3.6.1.2.1.1.3.0";  // 시스템 가동시간
    private static final String OID_SYS_NAME
            = "1.3.6.1.2.1.1.5.0";  // 시스템 이름
    private static final String OID_IF_NUMBER
            = "1.3.6.1.2.1.2.1.0";  // 인터페이스 수
    private static final String OID_CPU_USAGE
            = "1.3.6.1.4.1.9.9.109.1.1.1.1.8.1"; // CPU (시스코)
    private static final String OID_MEMORY_USAGE
            = "1.3.6.1.4.1.9.9.48.1.1.1.5.1";    // 메모리 (시스코)

    // ─────────────────────────────────────────
    // 장비 Ping 체크 (SNMP GET)
    // ─────────────────────────────────────────
    public boolean pingDevice(String ipAddress,
                              String community,
                              int port) {
        try {
            TransportMapping<?> transport =
                    new DefaultUdpTransportMapping();
            transport.listen();

            Snmp snmp = new Snmp(transport);

            CommunityTarget target = new CommunityTarget();
            target.setCommunity(
                    new OctetString(community));
            target.setAddress(
                    GenericAddress.parse(
                            "udp:" + ipAddress + "/" + port));
            target.setVersion(SnmpConstants.version2c);
            target.setTimeout(3000);  // 3초 타임아웃
            target.setRetries(2);     // 2회 재시도

            PDU pdu = new PDU();
            pdu.add(new VariableBinding(
                    new OID(OID_SYS_NAME)));
            pdu.setType(PDU.GET);

            ResponseEvent<?> response =
                    snmp.send(pdu, target);
            snmp.close();

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
        }
    }

    // ─────────────────────────────────────────
    // 장비 상태 수집 (SNMP GET)
    // ─────────────────────────────────────────
    public String getSnmpValue(String ipAddress,
                               String community,
                               int port,
                               String oid) {
        try {
            TransportMapping<?> transport =
                    new DefaultUdpTransportMapping();
            transport.listen();

            Snmp snmp = new Snmp(transport);

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
            pdu.add(new VariableBinding(new OID(oid)));
            pdu.setType(PDU.GET);

            ResponseEvent<?> response =
                    snmp.send(pdu, target);
            snmp.close();

            if (response != null &&
                    response.getResponse() != null) {
                return response.getResponse()
                        .get(0)
                        .getVariable()
                        .toString();
            }

        } catch (IOException e) {
            log.error("SNMP GET 오류: {} - {}",
                    ipAddress, e.getMessage());
        }
        return null;
    }

    // ─────────────────────────────────────────
    // 장비 전체 모니터링 수집 및 저장
    // ─────────────────────────────────────────
    @Transactional
    public MonitoringLog collectDeviceStatus(Device device) {
        String ip        = device.getIpAddress();
        String community = device.getSnmpCommunity();
        int    port      = device.getSnmpPort();

        log.info("모니터링 수집 시작: {} ({})",
                device.getDeviceName(), ip);

        // Ping 체크
        boolean pingStatus = pingDevice(ip, community, port);

        // CPU 수집 (시스코 장비 기준)
        Double cpuUsage = null;
        String cpuValue = getSnmpValue(
                ip, community, port, OID_CPU_USAGE);
        if (cpuValue != null) {
            try {
                cpuUsage = Double.parseDouble(cpuValue);
            } catch (NumberFormatException e) {
                log.warn("CPU 파싱 오류: {}", cpuValue);
            }
        }

        // 메모리 수집
        Double memoryUsage = null;
        String memValue = getSnmpValue(
                ip, community, port, OID_MEMORY_USAGE);
        if (memValue != null) {
            try {
                memoryUsage = Double.parseDouble(memValue);
            } catch (NumberFormatException e) {
                log.warn("메모리 파싱 오류: {}", memValue);
            }
        }

        // 시스템 정보 수집
        String sysName = getSnmpValue(
                ip, community, port, OID_SYS_NAME);

        // 모니터링 로그 저장
        MonitoringLog monitoringLog = MonitoringLog.builder()
                .device(device)
                .pingStatus(pingStatus)
                .cpuUsage(cpuUsage)
                .memoryUsage(memoryUsage)
                .portStatus(sysName)
                .collectedAt(LocalDateTime.now())
                .build();

        monitoringLogRepository.save(monitoringLog);

        // 장비 상태 업데이트
        updateDeviceStatus(device, pingStatus, cpuUsage);

        log.info("모니터링 수집 완료: {} - Ping: {}, CPU: {}%",
                device.getDeviceName(), pingStatus, cpuUsage);

        return monitoringLog;
    }

    // ─────────────────────────────────────────
    // 장비 상태 업데이트 및 장애 등록
    // ─────────────────────────────────────────
    @Transactional
    public void updateDeviceStatus(Device device,
                                   boolean pingStatus,
                                   Double cpuUsage) {
        DeviceStatus newStatus;

        if (!pingStatus) {
            // Ping 실패 → 장애
            newStatus = DeviceStatus.ERROR;
            createIncident(device, "SNMP Ping 응답 없음");

        } else if (cpuUsage != null && cpuUsage >= 90) {
            // CPU 90% 이상 → 경고
            newStatus = DeviceStatus.WARNING;
            createIncident(device,
                    "CPU 사용률 높음: " + cpuUsage + "%");

        } else {
            // 정상
            newStatus = DeviceStatus.NORMAL;
        }

        deviceService.updateDeviceStatus(
                device.getId(), newStatus);
    }

    // ─────────────────────────────────────────
    // 장애 이력 자동 등록
    // ─────────────────────────────────────────
    @Transactional
    public void createIncident(Device device,
                               String description) {
        // 이미 미해결 장애가 있으면 중복 등록 방지
        boolean hasOpenIncident = incidentLogRepository
                .findByDeviceId(device.getId())
                .stream()
                .anyMatch(i -> i.getStatus() ==
                        IncidentLog.IncidentStatus.OPEN);

        if (!hasOpenIncident) {
            IncidentLog incident = IncidentLog.builder()
                    .device(device)
                    .description(description)
                    .status(IncidentLog.IncidentStatus.OPEN)
                    .occurredAt(LocalDateTime.now())
                    .build();;

            incidentLogRepository.save(incident);
            log.warn("장애 등록: {} - {}",
                    device.getDeviceName(), description);
        }
    }
}