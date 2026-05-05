package com.netpulse.controller;

import com.netpulse.entity.Device;
import com.netpulse.entity.MonitoringLog;
import com.netpulse.service.DeviceService;
import com.netpulse.service.SnmpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/snmp")
@RequiredArgsConstructor
public class SnmpController {

    private final SnmpService snmpService;
    private final DeviceService deviceService;

    // 장비 Ping 체크
    @GetMapping("/ping/{deviceId}")
    public ResponseEntity<Boolean> pingDevice(
            @PathVariable Long deviceId) {
        Device device = deviceService.getDevice(deviceId);
        boolean result = snmpService.pingDevice(
                device.getIpAddress(),
                device.getSnmpCommunity(),
                device.getSnmpPort()
        );
        return ResponseEntity.ok(result);
    }

    // 장비 모니터링 수동 수집
    @PostMapping("/collect/{deviceId}")
    public ResponseEntity<MonitoringLog> collectDevice(
            @PathVariable Long deviceId) {
        Device device = deviceService.getDevice(deviceId);
        MonitoringLog result =
                snmpService.collectDeviceStatus(device);
        return ResponseEntity.ok(result);
    }

    // SNMP 값 직접 조회 (테스트용)
    @GetMapping("/get")
    public ResponseEntity<String> getSnmpValue(
            @RequestParam String ip,
            @RequestParam String community,
            @RequestParam(defaultValue = "161") int port,
            @RequestParam String oid) {
        String result = snmpService.getSnmpValue(
                ip, community, port, oid);
        return ResponseEntity.ok(result);
    }
}