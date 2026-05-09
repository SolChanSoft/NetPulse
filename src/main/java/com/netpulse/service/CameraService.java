package com.netpulse.service;

import com.netpulse.entity.Camera;
import com.netpulse.entity.Camera.CameraStatus;
import com.netpulse.entity.Customer;
import com.netpulse.repository.CameraRepository;
import com.netpulse.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CameraService {

    private final CameraRepository cameraRepository;
    private final CustomerRepository customerRepository;
    private final OnvifService onvifService;

    // 전체 조회
    public List<Camera> getAllCameras() {
        return cameraRepository.findAll();
    }

    // 단건 조회
    public Camera getCamera(Long id) {
        return cameraRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "카메라를 찾을 수 없습니다. ID: " + id));
    }

    // 고객사별 조회
    public List<Camera> getCamerasByCustomer(
            Long customerId) {
        return cameraRepository
                .findByCustomerId(customerId);
    }

    // 카메라 등록
    @Transactional
    public Camera createCamera(Camera camera) {
        Long customerId = camera.getCustomer().getId();
        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "고객사를 찾을 수 없습니다."));
        camera.setCustomer(customer);
        log.info("카메라 등록: {}",
                camera.getCameraName());
        return cameraRepository.save(camera);
    }

    // 카메라 수정
    @Transactional
    public Camera updateCamera(Long id,
                               Camera camera) {
        Camera existing = getCamera(id);
        existing.setCameraName(camera.getCameraName());
        existing.setIpAddress(camera.getIpAddress());
        existing.setPort(camera.getPort());
        existing.setUsername(camera.getUsername());
        existing.setPassword(camera.getPassword());
        existing.setRtspUrl(camera.getRtspUrl());
        existing.setLocation(camera.getLocation());
        existing.setManufacturer(
                camera.getManufacturer());
        existing.setModelName(camera.getModelName());
        return cameraRepository.save(existing);
    }

    // 카메라 삭제
    @Transactional
    public void deleteCamera(Long id) {
        cameraRepository.deleteById(id);
        log.info("카메라 삭제: ID {}", id);
    }

    // 카메라 상태 체크
    @Transactional
    public Camera checkCamera(Long id) {
        Camera camera = getCamera(id);
        return onvifService.checkCameraStatus(camera);
    }

    // 장애 카메라 조회
    public List<Camera> getErrorCameras() {
        return cameraRepository
                .findByStatus(CameraStatus.ERROR);
    }
}