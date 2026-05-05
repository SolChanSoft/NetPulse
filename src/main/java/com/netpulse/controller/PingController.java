package com.netpulse.controller;

import com.netpulse.entity.Device;
import com.netpulse.entity.MonitoringLog;
import com.netpulse.service.DeviceService;
import com.netpulse.service.PingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ping")
@RequiredArgsConstructor
public class PingController {

    private final PingService pingService;
    private final DeviceService deviceService;

    // 단순 IP Ping 체크
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>>
    pingCheck(@RequestParam String ip) {
        boolean result = pingService.pingCheck(ip);
        Map<String, Object> response = new HashMap<>();
        response.put("ip", ip);
        response.put("result", result);
        response.put("message", result
                ? "정상 응답" : "응답 없음");
        return ResponseEntity.ok(response);
    }

    // 장비 ID 로 Ping 체크
    @GetMapping("/device/{deviceId}")
    public ResponseEntity<MonitoringLog>
    pingDevice(@PathVariable Long deviceId) {
        Device device =
                deviceService.getDevice(deviceId);
        MonitoringLog result =
                pingService.pingDevice(device);
        return ResponseEntity.ok(result);
    }

    // 전체 장비 Ping 체크
    @PostMapping("/all")
    public ResponseEntity<Map<String, Object>>
    pingAllDevices() {
        List<Device> devices =
                deviceService.getAllDevices();
        pingService.pingAllDevices(devices);

        Map<String, Object> response = new HashMap<>();
        response.put("total", devices.size());
        response.put("message",
                "전체 장비 Ping 체크 완료!");
        return ResponseEntity.ok(response);
    }
}