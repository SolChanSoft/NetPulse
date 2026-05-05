package com.netpulse.repository;

import com.netpulse.entity.IncidentLog;
import com.netpulse.entity.IncidentLog.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentLogRepository
        extends JpaRepository<IncidentLog, Long> {

    // 장비별 장애 이력
    List<IncidentLog> findByDeviceId(Long deviceId);

    // 상태별 장애 조회
    List<IncidentLog> findByStatus(IncidentStatus status);

    // 미해결 장애 조회
    List<IncidentLog> findByStatusNot(IncidentStatus status);

    // 고객사별 장애 이력
    List<IncidentLog> findByDeviceCustomerId(Long customerId);
}