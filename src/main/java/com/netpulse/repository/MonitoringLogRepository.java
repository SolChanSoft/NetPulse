package com.netpulse.repository;

import com.netpulse.entity.MonitoringLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MonitoringLogRepository
        extends JpaRepository<MonitoringLog, Long> {

    // 장비별 모니터링 이력 조회
    List<MonitoringLog> findByDeviceId(Long deviceId);

    // 장비별 최근 이력 조회
    List<MonitoringLog> findByDeviceIdOrderByCollectedAtDesc(
            Long deviceId
    );

    // 기간별 조회
    List<MonitoringLog> findByDeviceIdAndCollectedAtBetween(
            Long deviceId,
            LocalDateTime start,
            LocalDateTime end
    );
}