package com.netpulse.controller;

import com.netpulse.entity.MaintenanceLog;
import com.netpulse.service.MaintenanceLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceLogController {

    private final MaintenanceLogService maintenanceLogService;

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<MaintenanceLog>> getAllMaintenanceLogs() {
        return ResponseEntity.ok(
                maintenanceLogService.getAllMaintenanceLogs());
    }

    // 장비별 유지보수 이력
    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<MaintenanceLog>> getMaintenanceByDevice(
            @PathVariable Long deviceId) {
        return ResponseEntity.ok(
                maintenanceLogService.getMaintenanceByDevice(deviceId));
    }

    // 고객사별 유지보수 이력
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<MaintenanceLog>> getMaintenanceByCustomer(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(
                maintenanceLogService.getMaintenanceByCustomer(customerId));
    }

    // 유지보수 등록
    @PostMapping
    public ResponseEntity<MaintenanceLog> createMaintenance(
            @RequestBody MaintenanceLog maintenanceLog) {
        return ResponseEntity.ok(
                maintenanceLogService.createMaintenance(maintenanceLog));
    }

    // 유지보수 수정
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceLog> updateMaintenance(
            @PathVariable Long id,
            @RequestBody MaintenanceLog maintenanceLog) {
        return ResponseEntity.ok(
                maintenanceLogService.updateMaintenance(id, maintenanceLog));
    }

    // 유지보수 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable Long id) {
        maintenanceLogService.deleteMaintenance(id);
        return ResponseEntity.ok().build();
    }

    // 기간별 유지보수 조회
    @GetMapping("/period")
    public ResponseEntity<List<MaintenanceLog>> getMaintenanceByPeriod(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        return ResponseEntity.ok(
                maintenanceLogService.getMaintenanceByPeriod(start, end));
    }
}
