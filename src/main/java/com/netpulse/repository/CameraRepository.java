package com.netpulse.repository;

import com.netpulse.entity.Camera;
import com.netpulse.entity.Camera.CameraStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CameraRepository
        extends JpaRepository<Camera, Long> {

    // 고객사별 카메라 조회
    List<Camera> findByCustomerId(Long customerId);

    // 상태별 카메라 조회
    List<Camera> findByStatus(CameraStatus status);

    // 장애 카메라 조회
    List<Camera> findByStatusNot(CameraStatus status);
}