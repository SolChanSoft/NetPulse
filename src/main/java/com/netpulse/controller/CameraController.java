package com.netpulse.controller;

import com.netpulse.entity.Camera;
import com.netpulse.service.CameraService;
import com.netpulse.service.OnvifService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/cameras")
@RequiredArgsConstructor
public class CameraController {

    private final CameraService cameraService;
    private final OnvifService onvifService;

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<Camera>> getAllCameras() {
        return ResponseEntity.ok(
                cameraService.getAllCameras());
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<Camera> getCamera(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                cameraService.getCamera(id));
    }

    // 고객사별 조회
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Camera>>
    getCamerasByCustomer(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(
                cameraService.getCamerasByCustomer(
                        customerId));
    }

    // 카메라 등록
    @PostMapping
    public ResponseEntity<Camera> createCamera(
            @RequestBody Camera camera) {
        return ResponseEntity.ok(
                cameraService.createCamera(camera));
    }

    // 카메라 수정
    @PutMapping("/{id}")
    public ResponseEntity<Camera> updateCamera(
            @PathVariable Long id,
            @RequestBody Camera camera) {
        return ResponseEntity.ok(
                cameraService.updateCamera(id, camera));
    }

    // 카메라 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCamera(
            @PathVariable Long id) {
        cameraService.deleteCamera(id);
        return ResponseEntity.ok().build();
    }

    // 카메라 상태 체크
    @PostMapping("/{id}/check")
    public ResponseEntity<Camera> checkCamera(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                cameraService.checkCamera(id));
    }

    // 전체 카메라 체크
    @PostMapping("/check/all")
    public ResponseEntity<String> checkAllCameras() {
        onvifService.checkAllCameras();
        return ResponseEntity.ok("전체 카메라 체크 완료!");
    }

    // 장애 카메라 조회
    @GetMapping("/error")
    public ResponseEntity<List<Camera>>
    getErrorCameras() {
        return ResponseEntity.ok(
                cameraService.getErrorCameras());
    }
}