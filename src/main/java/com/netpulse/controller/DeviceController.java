package com.netpulse.controller;

import com.netpulse.entity.Device;
import com.netpulse.entity.Device.DeviceStatus;
import com.netpulse.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<Device>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<Device> getDevice(@PathVariable Long id) {
        return ResponseEntity.ok(deviceService.getDevice(id));
    }

    // 고객사별 장비 조회
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Device>> getDevicesByCustomer(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(
                deviceService.getDevicesByCustomer(customerId));
    }

    // 장비 등록
    @PostMapping
    public ResponseEntity<Device> createDevice(
            @RequestBody Device device) {
        return ResponseEntity.ok(deviceService.createDevice(device));
    }

    // 장비 수정
    @PutMapping("/{id}")
    public ResponseEntity<Device> updateDevice(
            @PathVariable Long id,
            @RequestBody Device device) {
        return ResponseEntity.ok(deviceService.updateDevice(id, device));
    }

    // 장비 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.ok().build();
    }

    // 장비 상태 변경
    @PatchMapping("/{id}/status")
    public ResponseEntity<Device> updateDeviceStatus(
            @PathVariable Long id,
            @RequestParam DeviceStatus status) {
        return ResponseEntity.ok(
                deviceService.updateDeviceStatus(id, status));
    }

    // 장애 장비 조회
    @GetMapping("/error")
    public ResponseEntity<List<Device>> getErrorDevices() {
        return ResponseEntity.ok(deviceService.getErrorDevices());
    }

    // 정상 장비 조회
    @GetMapping("/normal")
    public ResponseEntity<List<Device>> getNormalDevices() {
        return ResponseEntity.ok(deviceService.getNormalDevices());
    }
}
