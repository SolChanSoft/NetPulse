package com.netpulse.service;

import com.netpulse.entity.MaintenanceLog;
import com.netpulse.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaintenanceLogService {

    private final MaintenanceLogRepository maintenanceLogRepository;

    // 유지보수 전체 조회
    public List<MaintenanceLog> getAllMaintenanceLogs() {
        return maintenanceLogRepository.findAll();
    }

    // 장비별 유지보수 이력
    public List<MaintenanceLog> getMaintenanceByDevice(Long deviceId) {
        return maintenanceLogRepository.findByDeviceId(deviceId);
    }

    // 고객사별 유지보수 이력
    public List<MaintenanceLog> getMaintenanceByCustomer(Long customerId) {
        return maintenanceLogRepository.findByDeviceCustomerId(customerId);
    }

    // 유지보수 등록
    @Transactional
    public MaintenanceLog createMaintenance(MaintenanceLog log) {
        return maintenanceLogRepository.save(log);
    }

    // 유지보수 수정
    @Transactional
    public MaintenanceLog updateMaintenance(Long id, MaintenanceLog maintenance) {
        MaintenanceLog existing = maintenanceLogRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("유지보수 이력을 찾을 수 없습니다. ID: " + id));
        existing.setWorkDate(maintenance.getWorkDate());
        existing.setWorker(maintenance.getWorker());
        existing.setWorkContent(maintenance.getWorkContent());
        existing.setResult(maintenance.getResult());
        return maintenanceLogRepository.save(existing);
    }

    // 유지보수 삭제
    @Transactional
    public void deleteMaintenance(Long id) {
        maintenanceLogRepository.deleteById(id);
    }

    // 기간별 유지보수 조회
    public List<MaintenanceLog> getMaintenanceByPeriod(
            LocalDate start, LocalDate end) {
        return maintenanceLogRepository.findByWorkDateBetween(start, end);
    }
}
