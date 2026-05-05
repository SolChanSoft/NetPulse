package com.netpulse.repository;

import com.netpulse.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceLogRepository
        extends JpaRepository<MaintenanceLog, Long> {

    // 장비별 유지보수 이력
    List<MaintenanceLog> findByDeviceId(Long deviceId);

    // 작업일별 조회
    List<MaintenanceLog> findByWorkDate(LocalDate workDate);

    // 작업자별 조회
    List<MaintenanceLog> findByWorker(String worker);

    // 고객사별 유지보수 이력
    List<MaintenanceLog> findByDeviceCustomerId(Long customerId);

    // 기간별 조회
    List<MaintenanceLog> findByWorkDateBetween(
            LocalDate start,
            LocalDate end
    );
}