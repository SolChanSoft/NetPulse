package com.netpulse.service;

import com.netpulse.entity.Device;
import com.netpulse.entity.IncidentLog;
import com.netpulse.entity.IncidentLog.IncidentStatus;
import com.netpulse.repository.IncidentLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentLogService {

    private final IncidentLogRepository incidentLogRepository;

    // 장애 전체 조회
    public List<IncidentLog> getAllIncidents() {

        return incidentLogRepository.findAll();
    }

    // 장비별 장애 이력
    public List<IncidentLog> getIncidentsByDevice(Long deviceId) {
        return incidentLogRepository.findByDeviceId(deviceId);
    }

    // 미해결 장애 조회
    public List<IncidentLog> getOpenIncidents() {

        return incidentLogRepository.findByStatus(IncidentStatus.OPEN);
    }

    // 장애 등록
    @Transactional
    public IncidentLog createIncident(IncidentLog incident) {
        log.info("장애 등록: 장비ID {}", incident.getDevice().getId());
        return incidentLogRepository.save(incident);
    }

    // 장애 등록
    @Transactional
    public IncidentLog createIncident(Device device, String description) {
        IncidentLog incident = IncidentLog.builder()
                .device(device)
                .description(description)
                .build();

        log.info("장애 등록: 장비ID {}", device.getId());
        return incidentLogRepository.save(incident);
    }

    // 장애 해결 처리
    @Transactional
    public IncidentLog resolveIncident(Long id, String resolution) {
        IncidentLog incident = incidentLogRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("장애 이력을 찾을 수 없습니다. ID: " + id));
        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolution(resolution);
        incident.setResolvedAt(LocalDateTime.now());
        log.info("장애 해결 처리: ID {}", id);
        return incidentLogRepository.save(incident);
    }

    // 고객사별 장애 이력
    public List<IncidentLog> getIncidentsByCustomer(Long customerId) {
        return incidentLogRepository.findByDeviceCustomerId(customerId);
    }
}
