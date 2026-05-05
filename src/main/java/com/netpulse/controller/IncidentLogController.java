package com.netpulse.controller;

import com.netpulse.entity.IncidentLog;
import com.netpulse.service.IncidentLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentLogController {

    private final IncidentLogService incidentLogService;

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<IncidentLog>> getAllIncidents() {
        return ResponseEntity.ok(incidentLogService.getAllIncidents());
    }

    // 장비별 장애 이력
    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<IncidentLog>> getIncidentsByDevice(
            @PathVariable Long deviceId) {
        return ResponseEntity.ok(
                incidentLogService.getIncidentsByDevice(deviceId));
    }

    // 미해결 장애 조회
    @GetMapping("/open")
    public ResponseEntity<List<IncidentLog>> getOpenIncidents() {
        return ResponseEntity.ok(incidentLogService.getOpenIncidents());
    }

    // 장애 등록
    @PostMapping
    public ResponseEntity<IncidentLog> createIncident(
            @RequestBody IncidentLog incident) {
        return ResponseEntity.ok(
                incidentLogService.createIncident(incident));
    }

    // 장애 해결 처리
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<IncidentLog> resolveIncident(
            @PathVariable Long id,
            @RequestParam String resolution) {
        return ResponseEntity.ok(
                incidentLogService.resolveIncident(id, resolution));
    }

    // 고객사별 장애 이력
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<IncidentLog>> getIncidentsByCustomer(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(
                incidentLogService.getIncidentsByCustomer(customerId));
    }
}
